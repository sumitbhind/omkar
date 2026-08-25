"use client";
import { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle, Copy, AlertTriangle, BarChart2, ExternalLink } from "lucide-react";
import { getCMSPage, updateCMSPage } from "@/lib/adminApi";
import Swal from "sweetalert2";

interface AnalyticsConfig {
  ga4MeasurementId:  string;
  gtmContainerId:    string;
  fbPixelId:         string;
  hotjarSiteId:      string;
  clarityProjectId:  string;
  enableAnalytics:   boolean;
  enableGtm:         boolean;
  enableFbPixel:     boolean;
}

const EMPTY: AnalyticsConfig = {
  ga4MeasurementId: "",
  gtmContainerId:   "",
  fbPixelId:        "",
  hotjarSiteId:     "",
  clarityProjectId: "",
  enableAnalytics:  true,
  enableGtm:        false,
  enableFbPixel:    false,
};

interface FieldDef {
  key: keyof Pick<AnalyticsConfig, "ga4MeasurementId" | "gtmContainerId" | "fbPixelId" | "hotjarSiteId" | "clarityProjectId">;
  toggleKey: keyof Pick<AnalyticsConfig, "enableAnalytics" | "enableGtm" | "enableFbPixel"> | null;
  label: string;
  placeholder: string;
  pattern: string;
  hint: string;
  docsUrl: string;
  color: string;
}

const FIELDS: FieldDef[] = [
  {
    key: "ga4MeasurementId", toggleKey: "enableAnalytics",
    label: "Google Analytics 4 (GA4)", placeholder: "G-XXXXXXXXXX",
    pattern: "^G-[A-Z0-9]+$", hint: "GA4 Property ka Measurement ID. Format: G-XXXXXXXXXX",
    docsUrl: "https://support.google.com/analytics/answer/9539598",
    color: "#E37400",
  },
  {
    key: "gtmContainerId", toggleKey: "enableGtm",
    label: "Google Tag Manager (GTM)", placeholder: "GTM-XXXXXXX",
    pattern: "^GTM-[A-Z0-9]+$", hint: "GTM Container ID. Format: GTM-XXXXXXX",
    docsUrl: "https://tagmanager.google.com",
    color: "#4285F4",
  },
  {
    key: "fbPixelId", toggleKey: "enableFbPixel",
    label: "Facebook / Meta Pixel", placeholder: "1234567890123456",
    pattern: "^[0-9]+$", hint: "Facebook Pixel ID — sirf numbers",
    docsUrl: "https://business.facebook.com/events_manager",
    color: "#1877F2",
  },
  {
    key: "hotjarSiteId", toggleKey: null,
    label: "Hotjar", placeholder: "1234567",
    pattern: "^[0-9]+$", hint: "Hotjar Site ID — sirf numbers",
    docsUrl: "https://insights.hotjar.com",
    color: "#F8461C",
  },
  {
    key: "clarityProjectId", toggleKey: null,
    label: "Microsoft Clarity", placeholder: "abc123xyz",
    pattern: "", hint: "Clarity Project ID",
    docsUrl: "https://clarity.microsoft.com",
    color: "#00B4D8",
  },
];

function validateId(value: string, pattern: string): boolean {
  if (!value || !pattern) return true;
  return new RegExp(pattern).test(value);
}

export default function AnalyticsSettingsPage() {
  const [config, setConfig]   = useState<AnalyticsConfig>(EMPTY);
  const [original, setOriginal] = useState<AnalyticsConfig>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [copied, setCopied]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCMSPage("analytics-config");
      const merged = { ...EMPTY, ...(data as Partial<AnalyticsConfig>) };
      setConfig(merged);
      setOriginal(merged);
    } catch {
      setConfig(EMPTY);
      setOriginal(EMPTY);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCMSPage("analytics-config", config as unknown as Record<string, unknown>);
      setOriginal(config);
      Swal.fire({ icon: "success", title: "Saved!", text: "Analytics settings save ho gaye.", timer: 1500, showConfirmButton: false });
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Save failed", text: err instanceof Error ? err.message : "Error" });
    } finally { setSaving(false); }
  };

  const handleCopy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const isDirty = JSON.stringify(config) !== JSON.stringify(original);
  const activeCount = FIELDS.filter(f => config[f.key]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Google Analytics & Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeCount}/{FIELDS.length} tracking tools configured</p>
        </div>
        <button form="analytics-form" type="submit" disabled={saving || !isDirty}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] disabled:opacity-50 font-medium">
          <Save size={15} />{saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-700">
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Important Note</p>
          <p>Yeh IDs save karne ke baad, website ke frontend mein Next.js layout mein manually add karne honge (Script tag mein). Sirf admin panel mein save karne se tracking automatically activate nahi hogi.</p>
        </div>
      </div>

      <form id="analytics-form" onSubmit={handleSave} className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white border rounded-xl p-5"><div className="h-16 bg-gray-100 rounded animate-pulse" /></div>)
        ) : FIELDS.map(field => {
          const value = config[field.key];
          const isValid = validateId(value, field.pattern);
          const toggle = field.toggleKey;
          const isEnabled = toggle ? config[toggle] : true;

          return (
            <div key={field.key} className={`bg-white border rounded-xl p-5 transition-all ${value && isValid ? "border-l-4" : ""}`}
              style={value && isValid ? { borderLeftColor: field.color } : {}}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: field.color }} />
                  <span className="font-semibold text-gray-800 text-sm">{field.label}</span>
                  {value && isValid && <CheckCircle size={14} className="text-green-600" />}
                </div>
                <div className="flex items-center gap-3">
                  {toggle && (
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={isEnabled}
                        onChange={e => setConfig(c => ({ ...c, [toggle]: e.target.checked }))} className="rounded" />
                      Enable
                    </label>
                  )}
                  <a href={field.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Docs <ExternalLink size={11} />
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  value={value}
                  onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none ${!isValid ? "border-red-400 focus:border-red-400" : "focus:border-[#f26b31]"}`}
                />
                {value && (
                  <button type="button" onClick={() => handleCopy(value, field.key)}
                    className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    {copied === field.key ? <CheckCircle size={15} className="text-green-600" /> : <Copy size={15} />}
                  </button>
                )}
              </div>
              <p className={`text-xs mt-1.5 ${!isValid ? "text-red-600" : "text-gray-400"}`}>
                {!isValid ? `Invalid format. Expected: ${field.placeholder}` : field.hint}
              </p>
            </div>
          );
        })}
      </form>

      {/* Script snippet */}
      {config.ga4MeasurementId && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><BarChart2 size={15} /> GA4 Script Snippet</p>
          <div className="bg-gray-900 rounded-xl p-4 relative">
            <pre className="text-green-400 text-xs overflow-auto whitespace-pre-wrap">{`<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${config.ga4MeasurementId}');
</script>`}</pre>
            <button
              onClick={() => handleCopy(`<script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}"></script>`, "snippet")}
              className="absolute top-3 right-3 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg"
            >
              {copied === "snippet" ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Yeh snippet website ke <code className="bg-gray-100 px-1 rounded">frontend/src/app/layout.tsx</code> mein &lt;head&gt; ke andar add karo.</p>
        </div>
      )}
    </div>
  );
}
