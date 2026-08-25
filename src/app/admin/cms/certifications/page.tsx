"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCertifications, createCertification, updateCertification,
  deleteCertification, uploadImage, Certification,
} from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Check, X, Award, Upload, ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { toast, confirmDialog } from "@/lib/toast";

const EMPTY = { title: "", description: "", image: "", imagePublicId: "", year: "", order: 0 };

export default function CertificationsPage() {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState<null | "add" | Certification>(null);
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCertifications(true).then(setItems).catch(() => setErr("Load failed")).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(EMPTY); setPreview(""); setErr(""); setModal("add"); };
  const openEdit = (c: Certification) => {
    setForm({ title: c.title, description: c.description, image: c.image, imagePublicId: c.imagePublicId, year: c.year, order: c.order });
    setPreview(c.image); setErr(""); setModal(c);
  };
  const closeModal = () => { setModal(null); setErr(""); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const { url, publicId } = await uploadImage(file, "certifications");
      setForm((f) => ({ ...f, image: url, imagePublicId: publicId }));
      setPreview(url);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true); setErr("");
    try {
      if (modal === "add") {
        const created = await createCertification(form);
        setItems((prev) => [...prev, created]);
        toast.success("Certification add ho gayi!");
      } else if (modal) {
        const updated = await updateCertification((modal as Certification)._id, form);
        setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
        toast.success("Certification update ho gayi!");
      }
      closeModal();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (c: Certification) => {
    try {
      const updated = await updateCertification(c._id, { isActive: !c.isActive });
      setItems((prev) => prev.map((x) => (x._id === c._id ? updated : x)));
    } catch { setErr("Status update failed"); }
  };

  const handleDelete = async (c: Certification) => {
    const ok = await confirmDialog("Certification Delete Karo", `"${c.title}" permanently delete ho jayegi.`, "Haan, Delete Karo");
    if (!ok) return;
    setDeletingId(c._id);
    try {
      await deleteCertification(c._id);
      setItems((prev) => prev.filter((x) => x._id !== c._id));
      toast.success("Certification delete ho gayi");
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Delete failed"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Certifications</h2>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} certifications</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#f26b31] hover:bg-[#d85720] text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <Plus size={15} /> Add Certification
        </button>
      </div>

      {err && !modal && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{err}</div>}

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
          <Award size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Koi certification nahi hai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c._id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${!c.isActive ? "opacity-60" : "border-gray-100"}`}>
              <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                {c.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={c.image} alt={c.title} className="h-full w-full object-contain p-3" />
                  : <Award size={40} className="text-gray-200" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 text-sm">{c.title}</p>
                  <button onClick={() => handleToggle(c)} className="shrink-0">
                    {c.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-300" />}
                  </button>
                </div>
                {c.year && <p className="text-xs text-gray-400 mt-0.5">Year: {c.year}</p>}
                {c.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600">
                    <Pencil size={11} /> Edit
                  </button>
                  <button onClick={() => handleDelete(c)} disabled={deletingId === c._id} className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50">
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-gray-800">{modal === "add" ? "New Certification" : "Edit Certification"}</h3>
              <button onClick={closeModal}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {err && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{err}</div>}

              {/* Image upload */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Certificate Image</p>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {preview
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={preview} alt="cert" className="w-full h-full object-contain p-1" />
                      : <ImageIcon size={22} className="text-gray-300" />}
                  </div>
                  <div className="flex-1">
                    <label className={`flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:border-[#f26b31] hover:text-[#f26b31] transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                      <Upload size={14} /> {uploading ? "Uploading…" : "Image upload karo"}
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                    </label>
                    {form.image && (
                      <button type="button" onClick={() => { setForm((f) => ({ ...f, image: "", imagePublicId: "" })); setPreview(""); }}
                        className="text-xs text-red-400 hover:underline mt-1">Remove</button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="ISO 9001:2015" required autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Year</label>
                  <input value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    placeholder="2024"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Certificate ke baare mein…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none" />
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
