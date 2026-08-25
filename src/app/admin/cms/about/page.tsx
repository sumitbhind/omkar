"use client";

import { useEffect, useState } from "react";
import { getCMSPage, updateCMSPage, uploadImage } from "@/lib/adminApi";
import { Save, Upload, X, Plus, Trash2, ImageIcon } from "lucide-react";
import { toast } from "@/lib/toast";

interface Stat { label: string; value: string }

interface AboutData {
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  description: string;
  image: string;
  imagePublicId: string;
  mission: string;
  vision: string;
  stats: Stat[];
}

const DEFAULT: AboutData = {
  heroTitle:    "About Us",
  heroSubtitle: "",
  intro:
    "Ramdas Power Innovations (RPI) is a trusted and professionally managed electrical solution provider based in Indore, Madhya Pradesh. As an Authorized Distributor of Schneider Electric Low Voltage Switchgears, we specialize in delivering high-quality, reliable, and energy-efficient electrical distribution products that meet global standards of safety and performance.",
  description:
    "With an unwavering commitment to excellence, strong industry experience, and a customer-first approach, RPI has become a preferred supplier for industries, commercial establishments, and infrastructure projects across the region.",
  vision:
    "To be the region's most reliable and preferred electrical solution provider by offering world-class Schneider Electric switchgear backed by service excellence.",
  mission:
    "To supply genuine, certified, and energy-efficient LV switchgear solutions\nTo ensure timely delivery, transparent dealings, and competitive pricing\nTo support customers with technical guidance and dependable after-sales service",
  image:        "",
  imagePublicId: "",
  stats:        [],
};

export default function AboutUsPage() {
  const [form, setForm] = useState<AboutData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    getCMSPage("about")
      .then((d) => setForm({ ...DEFAULT, ...(d as Partial<AboutData>) }))
      .catch(() => setErr("Data load nahi ho saka"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof AboutData, val: string) =>
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

  const addStat = () =>
    setForm((f) => ({ ...f, stats: [...f.stats, { label: "", value: "" }] }));

  const updateStat = (i: number, key: keyof Stat, val: string) =>
    setForm((f) => {
      const stats = [...f.stats];
      stats[i] = { ...stats[i], [key]: val };
      return { ...f, stats };
    });

  const removeStat = (i: number) =>
    setForm((f) => ({ ...f, stats: f.stats.filter((_, idx) => idx !== i) }));

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setErr(""); setSaved(false);
    try {
      await updateCMSPage("about", form as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("About Us update ho gayi!");
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
          <h2 className="text-xl font-bold text-gray-800">About Us Editor</h2>
          <p className="text-xs text-gray-400 mt-0.5">Website ke About Us page ka content edit karo</p>
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

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 text-sm border-b pb-2">Hero Section</h3>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Hero Title</label>
          <input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)}
            placeholder="About Ramdas Power Innovations"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Hero Subtitle</label>
          <input value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)}
            placeholder="Authorized Electrical Products Distributor"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]" />
        </div>
      </div>

      {/* About Image */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm border-b pb-2">About Image</h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {form.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={form.image} alt="about" className="w-full h-full object-cover" />
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
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Intro (short paragraph)</label>
          <textarea value={form.intro} onChange={(e) => set("intro", e.target.value)}
            rows={3} placeholder="Company ka short intro…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
            rows={5} placeholder="Detailed description…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none" />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-700 text-sm border-b pb-2">Mission & Vision</h3>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Mission</label>
          <textarea value={form.mission} onChange={(e) => set("mission", e.target.value)}
            rows={3} placeholder="Company mission…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Vision</label>
          <textarea value={form.vision} onChange={(e) => set("vision", e.target.value)}
            rows={3} placeholder="Company vision…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] resize-none" />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-semibold text-gray-700 text-sm">Stats (e.g. 15+ Years, 500+ Clients)</h3>
          <button type="button" onClick={addStat}
            className="flex items-center gap-1 text-xs text-[#f26b31] hover:underline font-semibold">
            <Plus size={13} /> Add Stat
          </button>
        </div>
        {form.stats.length === 0 && (
          <p className="text-xs text-gray-400 italic">Koi stat nahi hai. Add karo.</p>
        )}
        <div className="space-y-2">
          {form.stats.map((stat, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)}
                placeholder="15+" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] w-24" />
              <input value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)}
                placeholder="Years of Experience" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] flex-1" />
              <button type="button" onClick={() => removeStat(i)} className="p-1.5 text-gray-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
