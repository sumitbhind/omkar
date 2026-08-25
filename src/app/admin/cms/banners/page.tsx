"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, ImageIcon, Upload, Save } from "lucide-react";
import {
  getBannersAdmin, createBanner, updateBanner, deleteBanner, toggleBanner,
  uploadImage, type Banner,
} from "@/lib/adminApi";
import { toast } from "@/lib/toast";
import Swal from "sweetalert2";

const POSITIONS = ["hero"];

const EMPTY: Omit<Banner, "_id"> = {
  title: "", subtitle: "", image: "", bgColor: "#1a1a1a",
  link: "", buttonText: "", position: "hero", order: 0, isActive: true,
};

export default function BannersPage() {
  const [banners, setBanners]       = useState<Banner[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState<Omit<Banner, "_id">>(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBanners(await getBannersAdmin()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (b: Banner) => {
    setEditId(b._id);
    setForm({ title: b.title, subtitle: b.subtitle, image: b.image, bgColor: b.bgColor,
              link: b.link, buttonText: b.buttonText, position: b.position,
              order: b.order, isActive: b.isActive });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(EMPTY); };

  const set = (key: keyof Omit<Banner, "_id">, val: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, "banners");
      setForm((f) => ({ ...f, image: url }));
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { toast.error("Banner image required"); return; }
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateBanner(editId, form);
        setBanners((prev) => prev.map((b) => (b._id === editId ? updated : b)));
        toast.success("Banner updated!");
      } else {
        const created = await createBanner(form);
        setBanners((prev) => [...prev, created]);
        toast.success("Banner add ho gaya!");
      }
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Banner delete karo?", text: "Yeh action undo nahi hoga",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
      confirmButtonText: "Haan, delete karo", cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      toast.success("Banner delete ho gaya!");
    } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleBanner(id);
      setBanners((prev) => prev.map((b) => (b._id === id ? updated : b)));
    } catch { toast.error("Toggle failed"); }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Hero Banners</h2>
          <p className="text-xs text-gray-400 mt-0.5">Homepage slider ke banners manage karo</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#f26b31] hover:bg-[#d85720] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Banner
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse text-sm">Loading…</div>
      ) : banners.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm">
          Koi banner nahi hai. &quot;Add Banner&quot; se naya banner add karo.
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map((b) => (
            <div key={b._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 items-center">
              {/* Thumbnail */}
              <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                {b.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={b.image} alt={b.title || "banner"} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-gray-300" /></div>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{b.title || <span className="text-gray-400 italic">No title</span>}</p>
                {b.subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{b.subtitle}</p>}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">{b.position}</span>
                  <span className="text-[11px] text-gray-400">Order: {b.order}</span>
                  {b.link && <span className="text-[11px] text-blue-500 truncate max-w-[120px]">{b.link}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(b._id)} title={b.isActive ? "Active" : "Inactive"}>
                  {b.isActive
                    ? <ToggleRight size={24} className="text-green-500 hover:text-green-600" />
                    : <ToggleLeft size={24} className="text-gray-300 hover:text-gray-400" />}
                </button>
                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#f26b31] transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">{editId ? "Banner Edit karo" : "Naya Banner Add karo"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">

              {/* Image */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Banner Image *</label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {form.image
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      : <ImageIcon size={18} className="text-gray-300" />}
                  </div>
                  <label className={`flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:border-[#f26b31] hover:text-[#f26b31] transition-colors flex-1 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                    <Upload size={13} />
                    {uploading ? "Uploading…" : "Image Upload karo"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Recommended: 1920×1080px</p>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Title (optional)</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Smart Solutions. Reliable Products."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                <p className="text-[11px] text-gray-400 mt-0.5">Dot (.) se alag karo — har part ek alag badge banega</p>
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Subtitle (optional)</label>
                <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)}
                  placeholder="e.g. Authorized Schneider Electric Distributor"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
              </div>

              {/* Button Text + Link */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Button Text</label>
                  <input value={form.buttonText} onChange={(e) => set("buttonText", e.target.value)}
                    placeholder="e.g. Explore Now"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Button Link</label>
                  <input value={form.link} onChange={(e) => set("link", e.target.value)}
                    placeholder="e.g. /our-products"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>

              {/* BgColor + Position + Order */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Background Color</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5">
                    <input type="color" value={form.bgColor} onChange={(e) => set("bgColor", e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 p-0" />
                    <span className="text-xs text-gray-500">{form.bgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Position</label>
                  <select value={form.position} onChange={(e) => set("position", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]">
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Order</label>
                  <input type="number" min={0} value={form.order} onChange={(e) => set("order", Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-[#f26b31]" : "bg-gray-300"}`}
                  onClick={() => set("isActive", !form.isActive)}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-gray-600 font-medium">{form.isActive ? "Active" : "Inactive"}</span>
              </label>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving || uploading}
                  className="flex items-center gap-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                  <Save size={14} />
                  {saving ? "Saving…" : editId ? "Update karo" : "Add karo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
