"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, ChevronDown, X, Check, Globe, ExternalLink } from "lucide-react";
import { getSeoMetas, upsertSeoMeta, createSeoMeta, deleteSeoMeta, type SeoMeta } from "@/lib/adminApi";
import Swal from "sweetalert2";

type EditForm = Omit<SeoMeta, "_id" | "updatedAt">;

const EMPTY_FORM: EditForm = {
  pageKey: "", pageLabel: "", title: "", description: "", keywords: "",
  canonicalUrl: "", ogTitle: "", ogDescription: "", ogImage: "", noIndex: false,
};

export default function MetaTagsPage() {
  const [metas, setMetas]     = useState<SeoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ key: string; form: EditForm } | null>(null);
  const [saving, setSaving]   = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<EditForm>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMetas(await getSeoMetas()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (m: SeoMeta) => {
    setEditing({
      key: m.pageKey,
      form: { pageKey: m.pageKey, pageLabel: m.pageLabel, title: m.title, description: m.description,
              keywords: m.keywords, canonicalUrl: m.canonicalUrl, ogTitle: m.ogTitle,
              ogDescription: m.ogDescription, ogImage: m.ogImage, noIndex: m.noIndex },
    });
    setExpanded(m.pageKey);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await upsertSeoMeta(editing.key, editing.form);
      setMetas(prev => prev.map(m => m.pageKey === editing.key ? updated : m));
      setEditing(null);
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Save failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!addForm.pageKey || !addForm.pageLabel) return;
    setSaving(true);
    try {
      const item = await createSeoMeta(addForm);
      setMetas(prev => [...prev, item]);
      setAddForm(EMPTY_FORM);
      setShowAdd(false);
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Create failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (m: SeoMeta) => {
    const r = await Swal.fire({
      title: "Delete meta?",
      text: `"${m.pageLabel}" ka SEO meta delete ho jayega.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Haan, delete karo",
    });
    if (!r.isConfirmed) return;
    try {
      await deleteSeoMeta(m.pageKey);
      setMetas(prev => prev.filter(x => x.pageKey !== m.pageKey));
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const titleScore = (t: string) => {
    const len = t.length;
    if (!len) return { color: "text-gray-400", label: "Missing" };
    if (len < 30) return { color: "text-yellow-600", label: `${len}/60 — Too short` };
    if (len <= 60) return { color: "text-green-600", label: `${len}/60 — Good` };
    return { color: "text-red-600", label: `${len}/60 — Too long` };
  };

  const descScore = (d: string) => {
    const len = d.length;
    if (!len) return { color: "text-gray-400", label: "Missing" };
    if (len < 70) return { color: "text-yellow-600", label: `${len}/160 — Too short` };
    if (len <= 160) return { color: "text-green-600", label: `${len}/160 — Good` };
    return { color: "text-red-600", label: `${len}/160 — Too long` };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meta Tags Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">Har page ka SEO title, description, Open Graph set karo</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] font-medium">
          <Plus size={16} /> Add Page
        </button>
      </div>

      {/* Add custom page modal */}
      {showAdd && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Custom Page Add Karo</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Page Key *</label>
              <input value={addForm.pageKey} onChange={e => setAddForm(f => ({ ...f, pageKey: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                placeholder="e.g. services, gallery" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Page Label *</label>
              <input value={addForm.pageLabel} onChange={e => setAddForm(f => ({ ...f, pageLabel: e.target.value }))}
                placeholder="e.g. Services, Gallery" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="bg-[#f26b31] text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Add Page"}
            </button>
            <button onClick={() => setShowAdd(false)} className="border px-5 py-2 rounded-lg text-sm text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Pages list */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-xl p-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></div>
          ))
        ) : metas.map(m => {
          const isExpanded = expanded === m.pageKey;
          const isEditing  = editing?.key === m.pageKey;
          const ts = titleScore(m.title);
          const ds = descScore(m.description);
          const f  = isEditing ? editing.form : null;

          return (
            <div key={m.pageKey} className="bg-white border rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                onClick={() => setExpanded(isExpanded ? null : m.pageKey)}
              >
                <Globe size={16} className="text-[#f26b31] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{m.pageLabel}</p>
                  <p className="text-xs text-gray-400 font-mono">/{m.pageKey}</p>
                </div>
                <span className={`text-xs flex-shrink-0 ${ts.color}`}>{m.title ? `Title: ${ts.label}` : "Title: Missing"}</span>
                <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <div className="border-t bg-gray-50 p-5">
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Basic SEO */}
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Page Label</label>
                          <input value={f!.pageLabel} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, pageLabel: e.target.value } } : null)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">SEO Title</label>
                          <input value={f!.title} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, title: e.target.value } } : null)}
                            placeholder="Page ka SEO title" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                          <p className={`text-xs mt-0.5 ${titleScore(f!.title).color}`}>{titleScore(f!.title).label}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Description</label>
                          <textarea value={f!.description} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, description: e.target.value } } : null)}
                            rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#f26b31]" />
                          <p className={`text-xs mt-0.5 ${descScore(f!.description).color}`}>{descScore(f!.description).label}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Keywords</label>
                          <input value={f!.keywords} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, keywords: e.target.value } } : null)}
                            placeholder="keyword1, keyword2, keyword3" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Canonical URL</label>
                          <input value={f!.canonicalUrl} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, canonicalUrl: e.target.value } } : null)}
                            placeholder="https://yoursite.com/page" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                        </div>
                      </div>
                      {/* Open Graph */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-bold text-gray-600 mb-2">Open Graph (Social Share)</p>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">OG Title</label>
                            <input value={f!.ogTitle} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, ogTitle: e.target.value } } : null)}
                              placeholder={f!.title} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">OG Description</label>
                            <textarea value={f!.ogDescription} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, ogDescription: e.target.value } } : null)}
                              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#f26b31]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">OG Image URL</label>
                            <input value={f!.ogImage} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, ogImage: e.target.value } } : null)}
                              placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={f!.noIndex} onChange={e => setEditing(prev => prev ? { ...prev, form: { ...prev.form, noIndex: e.target.checked } } : null)} className="rounded" />
                        No Index (search engines se hide karo)
                      </label>
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleSave} disabled={saving} className="bg-[#f26b31] text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                          <Check size={14} className="inline mr-1" />{saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setEditing(null)} className="border px-6 py-2 rounded-lg text-sm text-gray-600"><X size={14} className="inline mr-1" />Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium text-gray-600">Title: </span><span className={ts.color}>{m.title || <em className="text-gray-400">Not set</em>}</span></div>
                      <div><span className="font-medium text-gray-600">Description: </span><span className={ds.color}>{m.description || <em className="text-gray-400">Not set</em>}</span></div>
                      <div><span className="font-medium text-gray-600">Keywords: </span><span className="text-gray-600">{m.keywords || <em className="text-gray-400">—</em>}</span></div>
                      {m.canonicalUrl && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-600">Canonical: </span>
                          <a href={m.canonicalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            {m.canonicalUrl} <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                      {m.noIndex && <p className="text-red-600 text-xs font-medium">⚠ noindex is ON — search engines se hidden</p>}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => startEdit(m)} className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><Pencil size={11} /> Edit</button>
                        <button onClick={() => handleDelete(m)} className="flex items-center gap-1 text-red-500 hover:underline text-xs"><Trash2 size={11} /> Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
