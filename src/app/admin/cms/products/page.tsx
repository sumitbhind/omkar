"use client";

import { useEffect, useState } from "react";
import { getCMSPage, updateCMSPage } from "@/lib/adminApi";
import { Save } from "lucide-react";
import { toast } from "@/lib/toast";

interface ProductsPageData {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
}

const DEFAULT: ProductsPageData = {
  heroTitle: "Our Product",
  heroSubtitle: "",
  intro: "We provide a comprehensive range of electrical products engineered for performance, safety, and long-term reliability. Our solutions cater to industrial, commercial, and infrastructure sectors with a focus on quality and efficiency.",
};

export default function ProductsPageCMSEditor() {
  const [form, setForm]     = useState<ProductsPageData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [err, setErr]         = useState("");

  useEffect(() => {
    getCMSPage("products-page")
      .then((d) => setForm({ ...DEFAULT, ...(d as Partial<ProductsPageData>) }))
      .catch(() => setErr("Data load nahi ho saka"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof ProductsPageData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(""); setSaved(false);
    try {
      await updateCMSPage("products-page", form as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Products page update ho gayi!");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400 animate-pulse text-sm">Loading…</div>;

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Products Page Editor</h2>
          <p className="text-xs text-gray-400 mt-0.5">Our Products page ka hero text aur intro edit karo</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg transition-colors ${
            saved ? "bg-green-500 text-white" : "bg-[#f26b31] hover:bg-[#d85720] text-white disabled:opacity-60"
          }`}
        >
          <Save size={15} />
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{err}</div>}

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 text-sm border-b pb-2">Page Header</h3>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Page Title</label>
          <input
            value={form.heroTitle}
            onChange={(e) => set("heroTitle", e.target.value)}
            placeholder="Our Products"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
          />
          <p className="text-xs text-gray-400 mt-1">Banner aur page ke heading mein dikhta hai</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Subtitle (optional)</label>
          <input
            value={form.heroSubtitle}
            onChange={(e) => set("heroSubtitle", e.target.value)}
            placeholder="Authorized Electrical Products Distributor"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
          />
        </div>
      </div>

      {/* Intro Text */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 text-sm border-b pb-2">Intro Text</h3>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Introduction Paragraph
          </label>
          <textarea
            value={form.intro}
            onChange={(e) => set("intro", e.target.value)}
            rows={5}
            placeholder="Products page ka intro paragraph…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Product cards ke upar orange background mein dikhega
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-600">
        <strong>Note:</strong> Product cards (panel items) ko manage karne ke liye{" "}
        <a href="/admin/cms/homepage" className="underline font-semibold hover:text-blue-800">
          Homepage → Panel Builder
        </a>{" "}
        mein jayein aur &quot;our-products&quot; section select karein.
      </div>
    </form>
  );
}
