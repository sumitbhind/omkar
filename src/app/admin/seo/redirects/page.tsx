"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight, ArrowRight, Check, X } from "lucide-react";
import { getUrlRedirects, createUrlRedirect, updateUrlRedirect, deleteUrlRedirect, type UrlRedirect } from "@/lib/adminApi";
import Swal from "sweetalert2";

interface FormState { source: string; destination: string; type: 301 | 302; isActive: boolean }
const EMPTY: FormState = { source: "", destination: "", type: 301, isActive: true };

export default function UrlRedirectsPage() {
  const [items, setItems]     = useState<UrlRedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [editId, setEditId]   = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getUrlRedirects()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.source || !form.destination) return;
    setSaving(true);
    try {
      const item = await createUrlRedirect(form);
      setItems(prev => [item, ...prev]);
      setForm(EMPTY);
      setAdding(false);
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Create failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const startEdit = (r: UrlRedirect) => {
    setEditId(r._id);
    setEditForm({ source: r.source, destination: r.destination, type: r.type, isActive: r.isActive });
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    try {
      const updated = await updateUrlRedirect(id, editForm);
      setItems(prev => prev.map(r => r._id === id ? updated : r));
      setEditId(null);
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Save failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const toggleActive = async (r: UrlRedirect) => {
    try {
      const updated = await updateUrlRedirect(r._id, { isActive: !r.isActive });
      setItems(prev => prev.map(x => x._id === r._id ? updated : x));
    } catch { /* ignore */ }
  };

  const handleDelete = async (r: UrlRedirect) => {
    const res = await Swal.fire({
      title: "Delete redirect?",
      text: `${r.source} → ${r.destination}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;
    try {
      await deleteUrlRedirect(r._id);
      setItems(prev => prev.filter(x => x._id !== r._id));
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">URL Redirects</h1>
          <p className="text-sm text-gray-500 mt-0.5">301/302 redirects manage karo — old URLs ko new URLs pe bhejo</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] font-medium">
          <Plus size={16} /> Add Redirect
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Source URL</th>
              <th className="px-2 py-3 hidden sm:table-cell" />
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Destination URL</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Type</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Hits</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Active</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Add row */}
            {adding && (
              <tr className="bg-orange-50">
                <td className="px-4 py-2">
                  <input autoFocus value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    placeholder="/old-url" className="w-full border rounded px-2 py-1 text-sm font-mono" />
                </td>
                <td className="px-2 hidden sm:table-cell text-gray-400"><ArrowRight size={14} /></td>
                <td className="px-4 py-2">
                  <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                    placeholder="/new-url" className="w-full border rounded px-2 py-1 text-sm font-mono" />
                </td>
                <td className="px-4 py-2 hidden md:table-cell">
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: Number(e.target.value) as 301 | 302 }))}
                    className="border rounded px-2 py-1 text-sm">
                    <option value={301}>301</option>
                    <option value={302}>302</option>
                  </select>
                </td>
                <td className="hidden lg:table-cell" />
                <td />
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button onClick={handleAdd} disabled={saving} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50">
                      <Check size={12} /> Save
                    </button>
                    <button onClick={() => setAdding(false)} className="flex items-center gap-1 border px-3 py-1.5 rounded text-xs text-gray-600">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : items.length === 0 && !adding ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Koi redirect nahi. Add karo.</td></tr>
            ) : items.map(r => (
              <tr key={r._id} className={`hover:bg-gray-50 ${!r.isActive ? "opacity-50" : ""}`}>
                {editId === r._id ? (
                  <>
                    <td className="px-4 py-2">
                      <input value={editForm.source} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))}
                        className="w-full border rounded px-2 py-1 text-sm font-mono" autoFocus />
                    </td>
                    <td className="px-2 hidden sm:table-cell text-gray-400"><ArrowRight size={14} /></td>
                    <td className="px-4 py-2">
                      <input value={editForm.destination} onChange={e => setEditForm(f => ({ ...f, destination: e.target.value }))}
                        className="w-full border rounded px-2 py-1 text-sm font-mono" />
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: Number(e.target.value) as 301 | 302 }))}
                        className="border rounded px-2 py-1 text-sm">
                        <option value={301}>301</option>
                        <option value={302}>302</option>
                      </select>
                    </td>
                    <td className="hidden lg:table-cell" />
                    <td />
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(r._id)} disabled={saving} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50">
                          <Check size={12} /> Save
                        </button>
                        <button onClick={() => setEditId(null)} className="flex items-center gap-1 border px-3 py-1.5 rounded text-xs text-gray-600">
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 max-w-[150px] truncate" title={r.source}>{r.source}</td>
                    <td className="px-2 hidden sm:table-cell text-gray-400"><ArrowRight size={14} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 max-w-[150px] truncate" title={r.destination}>{r.destination}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.type === 301 ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-center text-gray-500 text-xs">{r.hitCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(r)} className={r.isActive ? "text-green-600" : "text-gray-400"}>
                        {r.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(r)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">Redirects kaise kaam karte hain?</p>
        <p><strong>301 — Permanent:</strong> Old URL permanently naye URL pe move ho gaya. SEO juice transfer hota hai.</p>
        <p className="mt-1"><strong>302 — Temporary:</strong> Temporarily redirect karo. SEO juice transfer nahi hota.</p>
      </div>
    </div>
  );
}
