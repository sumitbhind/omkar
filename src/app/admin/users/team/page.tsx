"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Pencil, Trash2, X, Save, Eye, EyeOff,
  ExternalLink, Mail, Phone, GripVertical, Upload, Users,
} from "lucide-react";
import {
  TeamMember, getTeamMembers, createTeamMember, updateTeamMember,
  toggleTeamMember, deleteTeamMember, uploadImage,
} from "@/lib/adminApi";
import Swal from "sweetalert2";

const EMPTY: Partial<TeamMember> = {
  name: "", designation: "", department: "", photo: "", photoPublicId: "",
  bio: "", email: "", phone: "", linkedin: "", order: 0, isActive: true,
};

export default function TeamMembersPage() {
  const [members, setMembers]     = useState<TeamMember[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<TeamMember | null>(null);
  const [form, setForm]           = useState<Partial<TeamMember>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMembers(await getTeamMembers(true));
    } catch {
      Swal.fire({ icon: "error", title: "Load failed", timer: 2000, showConfirmButton: false });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({ ...m });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const setF = (key: keyof TeamMember, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  // Photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, publicId } = await uploadImage(file, "team");
      setF("photo", url);
      setF("photoPublicId", publicId);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Upload failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  // Save (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateTeamMember(editing._id, form);
        setMembers(prev => prev.map(m => m._id === editing._id ? updated : m));
        Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
      } else {
        const created = await createTeamMember(form);
        setMembers(prev => [...prev, created]);
        Swal.fire({ icon: "success", title: "Added", text: `${created.name} added as team member.`, timer: 1800, showConfirmButton: false });
      }
      closeModal();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const handleToggle = async (m: TeamMember) => {
    try {
      const updated = await toggleTeamMember(m._id);
      setMembers(prev => prev.map(x => x._id === m._id ? updated : x));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const handleDelete = async (m: TeamMember) => {
    const result = await Swal.fire({
      title: `Delete ${m.name}?`,
      text: "Yeh team member permanently delete ho jayega.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteTeamMember(m._id);
      setMembers(prev => prev.filter(x => x._id !== m._id));
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const activeCount = members.filter(m => m.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} members · {activeCount} active</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-4 py-2.5 rounded-lg hover:bg-[#d4581f] font-medium text-sm">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Members grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl p-5 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white border rounded-2xl p-16 text-center text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No team members yet</p>
          <p className="text-sm mt-1">Add your first team member</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map(m => (
            <div key={m._id} className={`bg-white border rounded-2xl p-5 flex flex-col items-center text-center transition-all ${!m.isActive ? "opacity-50" : ""}`}>
              {/* Photo */}
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden mb-3 flex-shrink-0 border-2 border-white shadow">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#f26b31]/10 text-[#f26b31] font-bold text-2xl">
                    {m.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <p className="font-bold text-gray-800 text-sm leading-tight">{m.name}</p>
              {m.designation && <p className="text-xs text-[#f26b31] font-medium mt-0.5">{m.designation}</p>}
              {m.department && <p className="text-xs text-gray-400 mt-0.5">{m.department}</p>}

              {/* Bio */}
              {m.bio && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{m.bio}</p>
              )}

              {/* Contact */}
              <div className="flex items-center gap-3 mt-3">
                {m.email && (
                  <a href={`mailto:${m.email}`} className="text-gray-400 hover:text-[#f26b31]" title={m.email}>
                    <Mail size={14} />
                  </a>
                )}
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="text-gray-400 hover:text-[#f26b31]" title={m.phone}>
                    <Phone size={14} />
                  </a>
                )}
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600" title="LinkedIn">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {/* Order badge */}
              {m.order > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-300 mt-2">
                  <GripVertical size={11} /> Order {m.order}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 w-full pt-4 border-t">
                <button onClick={() => openEdit(m)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-gray-600 hover:bg-gray-100">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => handleToggle(m)}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg ${m.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                  {m.isActive ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Show</>}
                </button>
                <button onClick={() => handleDelete(m)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg text-red-500 hover:bg-red-50">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#f26b31]" />
                <h2 className="text-lg font-bold text-gray-800">{editing ? "Edit Member" : "Add Team Member"}</h2>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Modal body */}
            <form id="team-form" onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center bg-gray-50 cursor-pointer hover:border-[#f26b31] transition-colors"
                  onClick={() => fileRef.current?.click()}>
                  {uploading ? (
                    <div className="text-xs text-gray-400 text-center px-2">Uploading...</div>
                  ) : form.photo ? (
                    <img src={form.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-300">
                      <Upload size={18} />
                      <span className="text-xs mt-1">Photo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="px-3 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                    {uploading ? "Uploading..." : form.photo ? "Change Photo" : "Upload Photo"}
                  </button>
                  {form.photo && (
                    <button type="button" onClick={() => { setF("photo", ""); setF("photoPublicId", ""); }}
                      className="ml-2 px-3 py-1.5 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50">
                      Remove
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP (max 5MB)</p>
                </div>
              </div>

              {/* Name + Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input value={form.name || ""} onChange={e => setF("name", e.target.value)} required
                    placeholder="Ramesh Kumar"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input value={form.designation || ""} onChange={e => setF("designation", e.target.value)}
                    placeholder="Sales Manager"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>

              {/* Department + Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input value={form.department || ""} onChange={e => setF("department", e.target.value)}
                    placeholder="Sales & Marketing"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input value={form.order ?? 0} onChange={e => setF("order", Number(e.target.value))}
                    type="number" min={0}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={form.bio || ""} onChange={e => setF("bio", e.target.value)} rows={3}
                  placeholder="Short description about this team member..."
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31] resize-none" />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input value={form.email || ""} onChange={e => setF("email", e.target.value)}
                    type="email" placeholder="ramesh@example.com"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone || ""} onChange={e => setF("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input value={form.linkedin || ""} onChange={e => setF("linkedin", e.target.value)}
                  type="url" placeholder="https://linkedin.com/in/rameshlkumar"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f26b31]" />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-[#f26b31]" : "bg-gray-200"}`}
                  onClick={() => setF("isActive", !form.isActive)}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Active (show on website)</span>
              </label>
            </form>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t flex-shrink-0">
              <button type="button" onClick={closeModal}
                className="flex-1 border rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button form="team-form" type="submit" disabled={saving || !form.name?.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#f26b31] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#d4581f] disabled:opacity-50">
                <Save size={14} />{saving ? "Saving..." : editing ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
