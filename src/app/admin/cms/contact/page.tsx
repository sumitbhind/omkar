"use client";

import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/adminApi";
import { Save, MapPin, Phone, Mail, Map, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface ContactSettings {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mapEmbedUrl: string;
}

const DEFAULT: ContactSettings = {
  phone: "", whatsapp: "", email: "", address: "",
  city: "", state: "", pincode: "", mapEmbedUrl: "",
};

const DEFAULT_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3678.545001896599!2d75.90596457497008!3d22.782260879343053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39631da62f44dfe1%3A0xb76224f845182eed!2sSiddharth%20Farms!5e0!3m2!1sen!2sin!4v1772870805758!5m2!1sen!2sin";

export default function ContactCMSPage() {
  const [form, setForm] = useState<ContactSettings>(DEFAULT);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [mapPreview, setMapPreview] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    getSettings()
      .then((r) => {
        if (r.data) {
          const d = r.data as Partial<ContactSettings>;
          setForm({ ...DEFAULT, ...d });
          setMapPreview(d.mapEmbedUrl || DEFAULT_MAP);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof ContactSettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      setMapPreview(form.mapEmbedUrl || DEFAULT_MAP);
      setMsg({ text: "Contact info saved!", ok: true });
      setTimeout(() => setMsg(null), 4000);
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : "Save failed", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const handleMapPreview = () => {
    if (form.mapEmbedUrl.trim()) setMapPreview(form.mapEmbedUrl.trim());
  };

  if (loading) return <div className="py-20 text-center text-gray-400 animate-pulse text-sm">Loading…</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold shadow-lg
          ${msg.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {msg.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Contact Us Editor</h2>
            <p className="text-xs text-gray-400 mt-0.5">Contact page ki info aur map location change karo</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <Save size={15} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm border-b pb-2 flex items-center gap-2">
            <Phone size={14} className="text-[#f26b31]" /> Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number</label>
              <input
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91 99999 99999"
                className={inp}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">WhatsApp Number</label>
              <input
                value={form.whatsapp}
                onChange={set("whatsapp")}
                placeholder="+91 99999 99999"
                className={inp}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              <Mail size={11} className="inline mr-1" />Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="info@ramdaspower.com"
              className={inp}
            />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm border-b pb-2 flex items-center gap-2">
            <MapPin size={14} className="text-[#f26b31]" /> Address
          </h3>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Street / Full Address</label>
            <textarea
              value={form.address}
              onChange={set("address")}
              rows={2}
              placeholder="54/2/16, Siddharth Farms, Lasudia Mori, Dewas Naka"
              className={`${inp} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">City</label>
              <input value={form.city} onChange={set("city")} placeholder="Indore" className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">State</label>
              <input value={form.state} onChange={set("state")} placeholder="Madhya Pradesh" className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Pincode</label>
              <input value={form.pincode} onChange={set("pincode")} placeholder="452010" className={inp} />
            </div>
          </div>
        </div>

        {/* Map Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm border-b pb-2 flex items-center gap-2">
            <Map size={14} className="text-[#f26b31]" /> Google Map Location
          </h3>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Map Embed URL kaise milega?</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
              <li>Google Maps par apni location search karo</li>
              <li>Share button click karo → &quot;Embed a map&quot; tab select karo</li>
              <li>Copy karo sirf <strong>src=&quot;...&quot;</strong> ke andar ka URL</li>
              <li>Neeche paste karo aur Preview dekho</li>
            </ol>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline mt-1"
            >
              Google Maps open karo <ExternalLink size={11} />
            </a>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Map Embed URL</label>
            <div className="flex gap-2">
              <input
                value={form.mapEmbedUrl}
                onChange={set("mapEmbedUrl")}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className={`${inp} flex-1`}
              />
              <button
                type="button"
                onClick={handleMapPreview}
                className="shrink-0 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Preview
              </button>
            </div>
          </div>

          {/* Live Map Preview */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Map Preview</p>
            <div className="rounded-xl overflow-hidden border border-gray-200 h-64 bg-gray-100">
              {mapPreview ? (
                <iframe
                  src={mapPreview}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  <div className="text-center">
                    <Map size={32} className="mx-auto mb-2 text-gray-200" />
                    Map URL enter karo preview dekhne ke liye
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] transition";
