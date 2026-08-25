"use client";

import { useEffect, useState } from "react";
import { getCMSPage, updateCMSPage, uploadImage } from "@/lib/adminApi";
import { Save, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "@/lib/toast";

interface HomepageData {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  description: string;
  image: string;
  imagePublicId: string;
}

const DEFAULT: HomepageData = {
  heroTitle:    "Welcome To Ramdas Power Innovations.",
  heroSubtitle: "Authorized Schneider Electric Distributor for Low Voltage Switchgears",
  intro:
    "Ramdas Power Innovations (RPI) is a trusted and professionally managed electrical solution provider based in Indore, Madhya Pradesh. As an Authorized Distributor of Schneider Electric Low Voltage Switchgears, we specialize in delivering high-quality, reliable, and energy-efficient electrical distribution products that meet global standards of safety and performance.",
  description:
    "With an unwavering commitment to excellence, strong industry experience, and a customer-first approach, RPI has become a preferred supplier for industries, commercial establishments, and infrastructure projects across the region.",
  image:        "/ramdas.jpg",
  imagePublicId: "",
};

export default function HomepageCMSPage() {
  const [form, setForm]         = useState<HomepageData>(DEFAULT);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [err, setErr]           = useState("");

  useEffect(() => {
    getCMSPage("homepage")
      .then((d) => setForm({ ...DEFAULT, ...(d as Partial<HomepageData>) }))
      .catch(() => setErr("Data load nahi ho saka"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof HomepageData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const { url, publicId } = await uploadImage(file, "cms");
      setForm((f) => ({ ...f, image: url, imagePublicId: publicId }));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setErr(""); setSaved(false);
    try {
      await updateCMSPage("homepage", form as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Homepage update ho gayi!");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400 animate-pulse text-sm">Loading…</div>;

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Homepage About Section</h2>
          <p className="text-xs text-gray-400 mt-0.5">Homepage par dikhne wala About Us section edit karo</p>
        </div>
        <button
          type="submit"
          disabled={saving || uploading}
          className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg transition-colors ${
            saved ? "bg-green-500 text-white" : "bg-[#f26b31] hover:bg-[#d85720] text-white disabled:opacity-60"
          }`}
        >
          <Save size={15} />
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{err}</div>}

      {/* Title & Subtitle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 text-sm border-b pb-2">Heading</h3>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Main Title</label>
          <input
            value={form.heroTitle}
            onChange={(e) => set("heroTitle", e.target.value)}
            placeholder="Welcome To Ramdas Power Innovations."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Subtitle</label>
          <input
            value={form.heroSubtitle}
            onChange={(e) => set("heroSubtitle", e.target.value)}
            placeholder="Authorized Schneider Electric Distributor for Low Voltage Switchgears"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
          />
        </div>
      </div>

      {/* Company Image */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm border-b pb-2">Company Image</h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {form.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={form.image} alt="company" className="w-full h-full object-cover" />
              : <ImageIcon size={28} className="text-gray-300" />}
          </div>
          <div className="flex-1 space-y-2">
            <label className={`flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:border-[#f26b31] hover:text-[#f26b31] transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
              <Upload size={14} />
              {uploading ? "Uploading…" : "Image upload karo"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.image && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, image: "", imagePublicId: "" }))}
                className="flex items-center gap-1 text-xs text-red-400 hover:underline">
                <X size={11} /> Remove image
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 text-sm border-b pb-2">Content</h3>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Intro Paragraph</label>
          <textarea
            value={form.intro}
            onChange={(e) => set("intro", e.target.value)}
            rows={4}
            placeholder="Company ka intro paragraph…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Description Paragraph</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Additional description…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none"
          />
        </div>
      </div>

    </form>
  );
}
