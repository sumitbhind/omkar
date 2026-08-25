"use client";
import { useState, useEffect, useCallback } from "react";
import { Save, ExternalLink, Globe } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/adminApi";
import Swal from "sweetalert2";

interface SocialLinks {
  facebook:  string;
  instagram: string;
  twitter:   string;
  youtube:   string;
  linkedin:  string;
  whatsapp:  string;
}

const EMPTY: SocialLinks = {
  facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "", whatsapp: "",
};

const PLATFORMS: { key: keyof SocialLinks; label: string; placeholder: string; color: string }[] = [
  { key: "facebook",  label: "Facebook",         placeholder: "https://facebook.com/yourpage",    color: "#1877F2" },
  { key: "instagram", label: "Instagram",         placeholder: "https://instagram.com/yourhandle", color: "#E1306C" },
  { key: "twitter",   label: "X (Twitter)",       placeholder: "https://x.com/yourhandle",         color: "#000000" },
  { key: "youtube",   label: "YouTube",           placeholder: "https://youtube.com/@yourchannel", color: "#FF0000" },
  { key: "linkedin",  label: "LinkedIn",          placeholder: "https://linkedin.com/company/...", color: "#0A66C2" },
  { key: "whatsapp",  label: "WhatsApp Business", placeholder: "https://wa.me/919XXXXXXXXX",       color: "#25D366" },
];

export default function SocialSettingsPage() {
  const [links, setLinks]       = useState<SocialLinks>(EMPTY);
  const [original, setOriginal] = useState<SocialLinks>(EMPTY);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      const data = res.data as Partial<SocialLinks>;
      const merged: SocialLinks = {
        facebook:  data.facebook  ?? "",
        instagram: data.instagram ?? "",
        twitter:   data.twitter   ?? "",
        youtube:   data.youtube   ?? "",
        linkedin:  data.linkedin  ?? "",
        whatsapp:  data.whatsapp  ?? "",
      };
      setLinks(merged);
      setOriginal(merged);
    } catch {
      setLinks(EMPTY);
      setOriginal(EMPTY);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(links);
      setOriginal(links);
      Swal.fire({ icon: "success", title: "Saved!", text: "Social media links save ho gaye. UI mein turant reflect honge.", timer: 2000, showConfirmButton: false });
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Save failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const isDirty = JSON.stringify(links) !== JSON.stringify(original);
  const filledCount = Object.values(links).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Social Media Links</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filledCount}/{PLATFORMS.length} platforms connected</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] disabled:opacity-50 font-medium"
        >
          <Save size={15} />{saving ? "Saving..." : "Save Links"}
        </button>
      </div>

      {/* Connected count bar */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Connected Platforms</span>
          <span className="text-[#f26b31] font-bold">{filledCount} / {PLATFORMS.length}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-[#f26b31] h-2 rounded-full transition-all" style={{ width: `${(filledCount / PLATFORMS.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-xl p-4">
              <div className="h-4 bg-gray-100 rounded animate-pulse mb-2 w-24" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          ))
        ) : PLATFORMS.map(p => {
          const value = links[p.key];
          return (
            <div key={p.key} className={`bg-white border rounded-xl p-4 transition-all ${value ? "border-l-4" : ""}`}
              style={value ? { borderLeftColor: p.color } : {}}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  {p.label}
                </label>
                {value && (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={value}
                onChange={e => setLinks(l => ({ ...l, [p.key]: e.target.value }))}
                placeholder={p.placeholder}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
              />
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-2">
        <Globe size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">WhatsApp link kaise banayein?</p>
          <p>Format: <code className="bg-blue-100 px-1 py-0.5 rounded">https://wa.me/919876543210</code> — Country code (91) + number (no spaces or dashes)</p>
        </div>
      </div>
    </div>
  );
}
