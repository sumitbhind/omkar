"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  getPricelistItems, createPricelistItem, updatePricelistItem,
  deletePricelistItem, uploadPdf, PricelistItem,
} from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Check, X, FileText, Upload, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { toast, confirmDialog } from "@/lib/toast";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EMPTY = { title: "", brand: "", pdfUrl: "", pdfPublicId: "", thumbnailUrl: "", month: "", year: new Date().getFullYear().toString(), order: 0 };

export default function PricelistPage() {
  const [items, setItems] = useState<PricelistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState<null | "add" | PricelistItem>(null);
  const [form, setForm] = useState(EMPTY);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPricelistItems(true).then(setItems).catch(() => setErr("Load failed")).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm({ ...EMPTY, year: new Date().getFullYear().toString() }); setErr(""); setModal("add"); };
  const openEdit = (p: PricelistItem) => {
    setForm({ title: p.title, brand: p.brand, pdfUrl: p.pdfUrl, pdfPublicId: p.pdfPublicId, thumbnailUrl: p.thumbnailUrl || "", month: p.month, year: p.year, order: p.order });
    setErr(""); setModal(p);
  };
  const closeModal = () => { setModal(null); setErr(""); };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const { url, publicId } = await uploadPdf(file, "pricelist");
      setForm((f) => ({ ...f, pdfUrl: url, pdfPublicId: publicId }));
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true); setErr("");
    try {
      if (modal === "add") {
        const created = await createPricelistItem(form);
        setItems((prev) => [...prev, created]);
        toast.success("Pricelist add ho gayi!");
      } else if (modal) {
        const updated = await updatePricelistItem((modal as PricelistItem)._id, form);
        setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
        toast.success("Pricelist update ho gayi!");
      }
      closeModal();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (p: PricelistItem) => {
    try {
      const updated = await updatePricelistItem(p._id, { isActive: !p.isActive });
      setItems((prev) => prev.map((x) => (x._id === p._id ? updated : x)));
    } catch { setErr("Status update failed"); }
  };

  const handleDelete = async (p: PricelistItem) => {
    const ok = await confirmDialog("Pricelist Delete Karo", `"${p.title}" permanently delete ho jayegi.`, "Haan, Delete Karo");
    if (!ok) return;
    setDeletingId(p._id);
    try {
      await deletePricelistItem(p._id);
      setItems((prev) => prev.filter((x) => x._id !== p._id));
      toast.success("Pricelist delete ho gayi");
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Delete failed"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pricelist Manager</h2>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} pricelists</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#f26b31] hover:bg-[#d85720] text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <Plus size={15} /> Add Pricelist
        </button>
      </div>

      {err && !modal && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{err}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Koi pricelist nahi hai.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Brand</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Period</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">PDF</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((p) => (
                <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${!p.isActive ? "opacity-60" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {p.thumbnailUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                          <Image src={p.thumbnailUrl} alt={p.title} width={40} height={40} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-red-400" />
                        </div>
                      )}
                      <span className="font-semibold text-gray-800 text-sm">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {p.brand ? <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">{p.brand}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-xs text-gray-500">
                    {[p.month, p.year].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {p.pdfUrl
                      ? <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline"><ExternalLink size={11} /> View PDF</a>
                      : <span className="text-xs text-gray-300">No PDF</span>}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <button onClick={() => handleToggle(p)}>
                      {p.isActive ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p)} disabled={deletingId === p._id} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-800">{modal === "add" ? "New Pricelist" : "Edit Pricelist"}</h3>
              <button onClick={closeModal}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {err && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{err}</div>}

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Polycab Price List 2024" required autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Brand</label>
                  <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    placeholder="Polycab"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Year</label>
                  <input value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    placeholder="2024"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Month</label>
                <select value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]">
                  <option value="">— Select Month —</option>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Thumbnail Image URL</label>
                <input value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                  placeholder="/pricelist/folder/preview_Page_01.png"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                {form.thumbnailUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 w-24 h-16">
                    <Image src={form.thumbnailUrl} alt="thumbnail preview" width={96} height={64} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* PDF Upload */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">PDF File</label>
                <label className={`flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-[#f26b31] hover:text-[#f26b31] transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                  <Upload size={14} />
                  {uploading ? "Uploading…" : form.pdfUrl ? "PDF uploaded ✓ (change karo)" : "PDF upload karo"}
                  <input ref={fileRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
                {form.pdfUrl && (
                  <div className="flex items-center gap-2 mt-1">
                    <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><ExternalLink size={10} /> View PDF</a>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, pdfUrl: "", pdfPublicId: "" }))} className="text-xs text-red-400 hover:underline">Remove</button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || uploading || !form.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg">
                  <Check size={14} /> {saving ? "Saving…" : modal === "add" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
