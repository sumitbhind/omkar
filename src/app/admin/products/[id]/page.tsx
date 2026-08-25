"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "@/lib/adminApi";
import { Plus, Trash2, ArrowLeft, ImagePlus } from "lucide-react";
import { toast, confirmDialog } from "@/lib/toast";
import Link from "next/link";

interface Badge  { label: string; value: string }

const EMPTY = {
  name: "",
  image: "",
  imageAlt: "",
  features: [""],
  applications: [""],
  badges: [] as Badge[],
  order: 0,
  isActive: true,
};

export default function ProductFormPage() {
  const { id }        = useParams<{ id: string }>();
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const isNew         = id === "new";

  const groupId    = searchParams.get("groupId")   ?? "";
  const catSlug    = searchParams.get("catSlug")   ?? "";
  const groupSlug  = searchParams.get("groupSlug") ?? "";

  const [form,      setForm]      = useState(EMPTY);
  const [loading,   setLoading]   = useState(!isNew);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");

  // Load existing product for edit
  useEffect(() => {
    if (isNew) return;
    const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    fetch(`${BASE}/api/products/item/${id}`)
      .then((r) => r.json())
      .then((res) => {
        const d = res.data;
        setForm({
          name:         d.name         ?? "",
          image:        d.image        ?? "",
          imageAlt:     d.imageAlt     ?? "",
          features:     d.features?.length ? d.features : [""],
          applications: d.applications?.length ? d.applications : [""],
          badges:       d.badges       ?? [],
          order:        d.order        ?? 0,
          isActive:     d.isActive     ?? true,
        });
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setArr = (key: "features" | "applications", idx: number, val: string) =>
    setForm((f) => {
      const arr = [...f[key]];
      arr[idx] = val;
      return { ...f, [key]: arr };
    });

  const addArr = (key: "features" | "applications") =>
    setForm((f) => ({ ...f, [key]: [...f[key], ""] }));

  const removeArr = (key: "features" | "applications", idx: number) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const setBadge = (idx: number, field: keyof Badge, val: string) =>
    setForm((f) => {
      const badges = f.badges.map((b, i) => i === idx ? { ...b, [field]: val } : b);
      return { ...f, badges };
    });

  const addBadge    = () => setForm((f) => ({ ...f, badges: [...f.badges, { label: "", value: "" }] }));
  const removeBadge = (idx: number) => setForm((f) => ({ ...f, badges: f.badges.filter((_, i) => i !== idx) }));

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const ok = await confirmDialog("Product Delete Karo", `"${form.name}" permanently delete ho jayega.`, "Haan, Delete Karo");
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteProduct(id);
      toast.success("Product delete ho gaya");
      router.push(`/admin/products?catSlug=${catSlug}&groupSlug=${groupSlug}`);
    } catch (err: unknown) {
      toast.error("Delete nahi ho saka", err instanceof Error ? err.message : undefined);
      setDeleting(false);
    }
  };

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, "products");
      setForm((f) => ({ ...f, image: url, imageAlt: f.imageAlt || f.name }));
      toast.success("Image upload ho gayi!");
    } catch (err: unknown) {
      toast.error("Upload nahi ho saka", err instanceof Error ? err.message : undefined);
    } finally {
      setUploading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      ...form,
      productGroup: groupId || undefined,
      features:     form.features.filter(Boolean),
      applications: form.applications.filter(Boolean),
      badges:       form.badges.filter((b) => b.label),
    };
    try {
      if (isNew) {
        await createProduct(payload);
      } else {
        await updateProduct(id, payload);
      }
      router.push(`/admin/products?catSlug=${catSlug}&groupSlug=${groupSlug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400 text-sm">Loading…</div>;

  const backUrl = `/admin/products${catSlug ? `?catSlug=${catSlug}&groupSlug=${groupSlug}` : ""}`;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={backUrl} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
          <ArrowLeft size={17} />
        </Link>
        <h2 className="text-xl font-bold text-gray-800 font-outfit flex-1">
          {isNew ? "Add Product" : "Edit Product"}
        </h2>
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : "Delete Product"}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Name */}
        <Field label="Product Name *">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="e.g. SRVL Series"
            className={inputCls}
          />
        </Field>

        {/* Image */}
        <Field label="Product Image">
          <div className="space-y-2">
            {form.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="preview" className="h-32 rounded-lg object-cover border" />
            )}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#f26b31] hover:underline">
              <ImagePlus size={16} />
              {uploading ? "Uploading…" : "Upload Image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
            <input
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="Or paste image URL"
              className={inputCls}
            />
          </div>
        </Field>

        {/* Image Alt */}
        <Field label="Image Alt Text">
          <input
            value={form.imageAlt}
            onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))}
            placeholder="e.g. SRVL Series UPS"
            className={inputCls}
          />
        </Field>

        {/* Features */}
        <Field label="Features">
          <div className="space-y-2">
            {form.features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={f}
                  onChange={(e) => setArr("features", i, e.target.value)}
                  placeholder={`Feature ${i + 1}`}
                  className={`${inputCls} flex-1`}
                />
                {form.features.length > 1 && (
                  <button type="button" onClick={() => removeArr("features", i)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArr("features")} className="flex items-center gap-1 text-xs text-[#f26b31] hover:underline">
              <Plus size={13} /> Add Feature
            </button>
          </div>
        </Field>

        {/* Applications */}
        <Field label="Applications">
          <div className="space-y-2">
            {form.applications.map((a, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={a}
                  onChange={(e) => setArr("applications", i, e.target.value)}
                  placeholder={`Application ${i + 1}`}
                  className={`${inputCls} flex-1`}
                />
                {form.applications.length > 1 && (
                  <button type="button" onClick={() => removeArr("applications", i)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArr("applications")} className="flex items-center gap-1 text-xs text-[#f26b31] hover:underline">
              <Plus size={13} /> Add Application
            </button>
          </div>
        </Field>

        {/* Badges */}
        <Field label="Badges / Highlights">
          <div className="space-y-3">
            {form.badges.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={b.label}
                  onChange={(e) => setBadge(i, "label", e.target.value)}
                  placeholder="Badge label"
                  className={`${inputCls} flex-1`}
                />
                <input
                  value={b.value}
                  onChange={(e) => setBadge(i, "value", e.target.value)}
                  placeholder="Optional sub-text"
                  className={`${inputCls} flex-1`}
                />
                <button type="button" onClick={() => removeBadge(i)} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addBadge} className="flex items-center gap-1 text-xs text-[#f26b31] hover:underline">
              <Plus size={13} /> Add Badge
            </button>
          </div>
        </Field>

        {/* Order + Active */}
        <div className="flex gap-4 items-end">
          <Field label="Display Order" className="w-28">
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              className={inputCls}
            />
          </Field>
          <label className="flex items-center gap-2 mb-0.5 cursor-pointer text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="accent-[#f26b31] w-4 h-4"
            />
            Active (visible on site)
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </button>
          <Link
            href={backUrl}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] transition";
