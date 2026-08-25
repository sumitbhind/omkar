"use client";
import { useState, useEffect, useCallback } from "react";
import { Save, RefreshCw, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { getCMSPage, updateCMSPage } from "@/lib/adminApi";
import Swal from "sweetalert2";

const DEFAULT_ROBOTS = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://ramdaspower.com/sitemap.xml

# Disallow admin paths
Disallow: /admin/
Disallow: /api/

# Allow important bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /
`;

export default function RobotsPage() {
  const [content, setContent]   = useState(DEFAULT_ROBOTS);
  const [original, setOriginal] = useState(DEFAULT_ROBOTS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [copied, setCopied]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCMSPage("robots-txt");
      const text = (data as { content?: string }).content || DEFAULT_ROBOTS;
      setContent(text);
      setOriginal(text);
    } catch {
      setContent(DEFAULT_ROBOTS);
      setOriginal(DEFAULT_ROBOTS);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCMSPage("robots-txt", { content });
      setOriginal(content);
      Swal.fire({ icon: "success", title: "Saved!", text: "Robots.txt content save ho gaya.", timer: 1500, showConfirmButton: false });
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Save failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setContent(original);
  };

  const isDirty = content !== original;

  // Basic validation
  const hasUserAgent = content.includes("User-agent:");
  const hasSitemap   = content.toLowerCase().includes("sitemap:");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Robots.txt Editor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Search engine crawlers ke liye rules set karo</p>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <button onClick={handleReset} className="flex items-center gap-2 border px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <RefreshCw size={15} /> Reset
            </button>
          )}
          <button onClick={handleCopy} className="flex items-center gap-2 border px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            {copied ? <CheckCircle size={15} className="text-green-600" /> : <Copy size={15} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] disabled:opacity-50 font-medium"
          >
            <Save size={15} />{saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Validation hints */}
      <div className="flex flex-wrap gap-3">
        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${hasUserAgent ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {hasUserAgent ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
          User-agent directive
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${hasSitemap ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-700"}`}>
          {hasSitemap ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
          Sitemap URL
        </div>
        {isDirty && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700">
            <AlertTriangle size={12} /> Unsaved changes
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Editor</p>
          {loading ? (
            <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-80 font-mono text-sm border rounded-xl px-4 py-3 focus:outline-none focus:border-[#f26b31] resize-y bg-gray-900 text-green-400"
              spellCheck={false}
            />
          )}
        </div>

        {/* Quick Templates */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Quick Templates</p>
          <div className="space-y-3">
            {[
              {
                label: "Allow All (Default)",
                desc: "Saare crawlers ko sab kuch allow",
                template: `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://ramdaspower.com/sitemap.xml\n`,
              },
              {
                label: "Block Aggressive Bots",
                desc: "Bad bots block karo, Google/Bing allow",
                template: `User-agent: *\nDisallow:\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: AhrefsBot\nDisallow: /\n\nUser-agent: MJ12bot\nDisallow: /\n\nSitemap: https://ramdaspower.com/sitemap.xml\n`,
              },
              {
                label: "Block All Crawlers",
                desc: "Under maintenance ya private site",
                template: `User-agent: *\nDisallow: /\n`,
              },
            ].map(t => (
              <div key={t.label} className="border rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </div>
                  <button
                    onClick={() => setContent(t.template)}
                    className="text-xs bg-[#f26b31]/10 text-[#f26b31] hover:bg-[#f26b31]/20 px-3 py-1.5 rounded-lg font-medium flex-shrink-0"
                  >
                    Use
                  </button>
                </div>
                <pre className="text-xs text-gray-500 bg-gray-50 px-2 py-1.5 rounded mt-2 whitespace-pre-wrap">{t.template}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
