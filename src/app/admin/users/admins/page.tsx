"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Shield, ShieldOff, Trash2, KeyRound,
  User, Edit2, X, Check, Eye, EyeOff,
} from "lucide-react";
import {
  AdminUser, getAdminUsers, createAdminUser, updateAdminUser,
  toggleAdminUser, deleteAdminUser, resetAdminPassword,
} from "@/lib/adminApi";
import Swal from "sweetalert2";

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  editor: "Editor",
};
const ROLE_COLORS: Record<AdminUser["role"], string> = {
  "super-admin": "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  editor: "bg-green-100 text-green-700",
};

interface FormData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: AdminUser["role"];
}
const EMPTY_FORM: FormData = { username: "", password: "", name: "", email: "", role: "admin" };

interface EditData { name: string; email: string; role: AdminUser["role"]; }

export default function AdminUsersPage() {
  const [admins, setAdmins]           = useState<AdminUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [showPw, setShowPw]           = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [editData, setEditData]       = useState<EditData>({ name: "", email: "", role: "admin" });
  const [resetId, setResetId]         = useState<string | null>(null);
  const [resetPw, setResetPw]         = useState("");
  const [showResetPw, setShowResetPw] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAdmins(await getAdminUsers());
    } catch {
      Swal.fire({ icon: "error", title: "Load failed", timer: 2000, showConfirmButton: false });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = admins.filter(a =>
    a.username.includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createAdminUser(form);
      setAdmins(prev => [...prev, created]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      Swal.fire({ icon: "success", title: "Admin Created", text: `@${created.username} create ho gaya.`, timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const handleEditSave = async (id: string) => {
    try {
      const updated = await updateAdminUser(id, editData);
      setAdmins(prev => prev.map(a => a._id === id ? updated : a));
      setEditId(null);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const handleToggle = async (admin: AdminUser) => {
    try {
      const updated = await toggleAdminUser(admin._id);
      setAdmins(prev => prev.map(a => a._id === admin._id ? updated : a));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    const result = await Swal.fire({
      title: `Delete @${admin.username}?`,
      text: "Yeh admin account permanently delete ho jayega.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteAdminUser(admin._id);
      setAdmins(prev => prev.filter(a => a._id !== admin._id));
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetId) return;
    try {
      await resetAdminPassword(resetId, resetPw);
      setResetId(null);
      setResetPw("");
      Swal.fire({ icon: "success", title: "Password Reset", text: "Password successfully reset ho gaya.", timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err instanceof Error ? err.message : "Error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{admins.length} admin account{admins.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setShowPw(false); }}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-4 py-2.5 rounded-lg hover:bg-[#d4581f] font-medium text-sm">
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by username / name..."
          className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#f26b31]" />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No admin users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Created</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(admin => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    {/* User */}
                    <td className="px-4 py-3">
                      {editId === admin._id ? (
                        <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                          placeholder="Display name"
                          className="border rounded-lg px-2 py-1 text-sm w-40 focus:outline-none focus:border-[#f26b31]" />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#f26b31]/10 flex items-center justify-center text-[#f26b31] font-bold text-sm flex-shrink-0 overflow-hidden">
                            {admin.avatar
                              ? <img src={admin.avatar} alt="" className="w-full h-full object-cover" />
                              : (admin.name || admin.username).charAt(0).toUpperCase()
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{admin.name || <span className="text-gray-300">No name</span>}</p>
                            <p className="text-xs text-gray-400">@{admin.username}</p>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {editId === admin._id ? (
                        <select value={editData.role} onChange={e => setEditData(d => ({ ...d, role: e.target.value as AdminUser["role"] }))}
                          className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#f26b31]">
                          <option value="super-admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[admin.role]}`}>
                          {ROLE_LABELS[admin.role]}
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-gray-600">
                      {editId === admin._id ? (
                        <input value={editData.email} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
                          placeholder="email@example.com" type="email"
                          className="border rounded-lg px-2 py-1 text-sm w-44 focus:outline-none focus:border-[#f26b31]" />
                      ) : (
                        admin.email || <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${admin.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(admin.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {editId === admin._id ? (
                          <>
                            <button onClick={() => handleEditSave(admin._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Save">
                              <Check size={15} />
                            </button>
                            <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" title="Cancel">
                              <X size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(admin._id); setEditData({ name: admin.name, email: admin.email, role: admin.role }); }}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="Edit">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => { setResetId(admin._id); setResetPw(""); setShowResetPw(false); }}
                              className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg" title="Reset Password">
                              <KeyRound size={15} />
                            </button>
                            <button onClick={() => handleToggle(admin)}
                              className={`p-1.5 rounded-lg ${admin.isActive ? "text-blue-500 hover:bg-blue-50" : "text-gray-400 hover:bg-gray-100"}`}
                              title={admin.isActive ? "Deactivate" : "Activate"}>
                              {admin.isActive ? <Shield size={15} /> : <ShieldOff size={15} />}
                            </button>
                            <button onClick={() => handleDelete(admin)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#f26b31]" />
                <h2 className="text-lg font-bold text-gray-800">Add New Admin</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                <input value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, "") }))}
                  placeholder="johndoe" required
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
                <p className="text-xs text-gray-400 mt-1">Lowercase only, no spaces</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 8 characters" type={showPw ? "text" : "password"} required minLength={8}
                    className="w-full border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#f26b31]" />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AdminUser["role"] }))}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]">
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="john@example.com" type="email"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !form.username || !form.password}
                  className="flex-1 bg-[#f26b31] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#d4581f] disabled:opacity-50">
                  {saving ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-amber-500" />
                <h2 className="text-lg font-bold text-gray-800">Reset Password</h2>
              </div>
              <button onClick={() => setResetId(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Admin <strong>@{admins.find(a => a._id === resetId)?.username}</strong> ke liye naya password set karo.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input value={resetPw} onChange={e => setResetPw(e.target.value)}
                    type={showResetPw ? "text" : "password"} placeholder="Min 8 characters" required minLength={8}
                    className="w-full border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#f26b31]" />
                  <button type="button" onClick={() => setShowResetPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetId(null)}
                  className="flex-1 border rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={!resetPw || resetPw.length < 8}
                  className="flex-1 bg-amber-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
