"use client";

import { useEffect, useRef, useState } from "react";
import { getBrands, createBrand, updateBrand, deleteBrand, uploadImage, Brand } from "@/lib/adminApi";
import { Plus, Pencil, Trash2, Check, X, Star, Globe, ToggleLeft, ToggleRight, Upload, ImageIcon } from "lucide-react";

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_FORM = { name: "", description: "", website: "", order: 0, logo: "", logoPublicId: "" };

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  // Modal state — null = closed, "add" = add mode, Brand = edit mode
  const [modal, setModal] = useState<null | "add" | Brand>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getBrands(true)
      .then((data) => setBrands(data))
      .catch(() => setErr("Brands load nahi ho sake"))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setPreviewUrl("");
    setErr("");
    setModal("add");
  };

  const openEdit = (b: Brand) => {
    setForm({ name: b.name, description: b.description, website: b.website, order: b.order, logo: b.logo, logoPublicId: b.logoPublicId });
    setPreviewUrl(b.logo);
    setErr("");
    setModal(b);
  };

  const closeModal = () => { setModal(null); setErr(""); };

  // Logo upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const { url, publicId } = await uploadImage(file, "brands");
      setForm((f) => ({ ...f, logo: url, logoPublicId: publicId }));
      setPreviewUrl(url);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Submit — add or edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setSaving(true); setErr("");
    try {
      const payload = { ...form, name, slug: slugify(name) };
      if (modal === "add") {
        const created = await createBrand(payload);
        setBrands((prev) => [...prev, created]);
      } else if (modal) {
        const updated = await updateBrand((modal as Brand)._id, payload);
        setBrands((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      }
      closeModal();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (b: Brand) => {
    try {
      const updated = await updateBrand(b._id, { isActive: !b.isActive });
      setBrands((prev) => prev.map((x) => (x._id === b._id ? updated : x)));
    } catch {
      setErr("Status update nahi ho saka");
    }
  };

  const handleDelete = async (b: Brand) => {
    if (!confirm(`"${b.name}" permanently delete karna chahte ho?`)) return;
    setDeletingId(b._id);
    try {
      await deleteBrand(b._id);
      setBrands((prev) => prev.filter((x) => x._id !== b._id));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Brands</h2>
          <p className="text-xs text-gray-400 mt-0.5">{brands.length} brands total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#f26b31] hover:bg-[#d85720] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Brand
        </button>
      </div>

      {err && !modal && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{err}</div>
      )}

      {/* Brand grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
      ) : brands.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20 text-center">
          <Star size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">Koi brand nahi hai. Pehla brand add karo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => (
            <div key={b._id} className={`bg-white rounded-xl border shadow-sm p-4 flex gap-4 items-start transition-all ${b.isActive ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {b.logo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={b.logo} alt={b.name} className="w-full h-full object-contain p-1" />
                  : <Star size={24} className="text-gray-300" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{b.name}</p>
                    <code className="text-[10px] text-gray-400">{b.slug}</code>
                  </div>
                  <button onClick={() => handleToggle(b)} className="shrink-0 mt-0.5">
                    {b.isActive
                      ? <ToggleRight size={20} className="text-green-500" />
                      : <ToggleLeft size={20} className="text-gray-300" />}
                  </button>
                </div>

                {b.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.description}</p>
                )}

                {b.website && (
                  <a href={b.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-1">
                    <Globe size={11} /> {b.website.replace(/^https?:\/\//, "")}
                  </a>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEdit(b)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b)}
                    disabled={deletingId === b._id}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
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
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-gray-800">{modal === "add" ? "New Brand" : "Edit Brand"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {err && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{err}</div>
              )}

              {/* Logo upload */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Brand Logo</p>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {previewUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={previewUrl} alt="logo" className="w-full h-full object-contain p-1" />
                      : <ImageIcon size={22} className="text-gray-300" />
                    }
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="brand-logo-upload"
                    />
                    <label
                      htmlFor="brand-logo-upload"
                      className={`flex items-center gap-2 cursor-pointer w-full border border-dashed border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:border-[#f26b31] hover:text-[#f26b31] transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}
                    >
                      <Upload size={14} />
                      {uploading ? "Uploading…" : "Logo upload karo"}
                    </label>
                    {form.logo && (
                      <button type="button" onClick={() => { setForm((f) => ({ ...f, logo: "", logoPublicId: "" })); setPreviewUrl(""); }}
                        className="text-xs text-red-400 hover:underline mt-1">
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Brand Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Polycab"
                  required autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
                />
                {form.name && <p className="text-xs text-gray-400 mt-1 pl-1">slug: {slugify(form.name)}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brand ke baare mein..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none"
                />
              </div>

              {/* Website + Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Website URL</label>
                  <input
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    placeholder="https://..."
                    type="url"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Display Order</label>
                  <input
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    type="number"
                    min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading || !form.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg"
                >
                  <Check size={14} />
                  {saving ? "Saving…" : modal === "add" ? "Create Brand" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
