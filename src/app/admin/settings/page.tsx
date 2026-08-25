"use client";

import { useEffect, useState } from "react";
import {
  getSettings,
  updateSettings,
  changePassword,
  changeUsername,
  saveToken,
} from "@/lib/adminApi";
import { User, Lock, Building2, CheckCircle, AlertCircle } from "lucide-react";

type Tab = "account" | "business";

interface SiteSettings {
  businessName: string;
  tagline: string;
  gstNo: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  linkedin: string;
  mapEmbedUrl: string;
}

const EMPTY_SETTINGS: SiteSettings = {
  businessName: "", tagline: "", gstNo: "", phone: "", whatsapp: "",
  email: "", address: "", city: "", state: "", pincode: "",
  instagram: "", facebook: "", twitter: "", youtube: "", linkedin: "",
  mapEmbedUrl: "",
};

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("account");

  // ── Account state ──
  const [newUsername,      setNewUsername]      = useState("");
  const [currentPassword,  setCurrentPassword]  = useState("");
  const [newPassword,      setNewPassword]      = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");

  // ── Site settings state ──
  const [settings, setSettings] = useState<SiteSettings>(EMPTY_SETTINGS);
  const [loading,  setLoading]  = useState(true);

  // ── Feedback ──
  const [msg, setMsg] = useState<{ text: string; ok: boolean; showRefresh?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((r) => { if (r.data) setSettings({ ...EMPTY_SETTINGS, ...r.data }); })
      .finally(() => setLoading(false));
  }, []);

  const notify = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  // ── Handlers ──
  const handleUsernameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setSaving(true);
    try {
      const r = await changeUsername(newUsername.trim());
      if (r.token) saveToken(r.token);
      setNewUsername("");
      notify("Username updated successfully");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed", false);
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { notify("New passwords do not match", false); return; }
    if (newPassword.length < 8)          { notify("Password must be at least 8 characters", false); return; }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      notify("Password changed successfully");
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed", false);
    } finally { setSaving(false); }
  };

  const handleSettingsSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await updateSettings(settings);
      setSettings({ ...EMPTY_SETTINGS, ...r.data });
      setMsg({ text: "Settings saved!", ok: true, showRefresh: true });
      setTimeout(() => setMsg(null), 6000);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : "Failed", false);
    } finally { setSaving(false); }
  };

  const set = (field: keyof SiteSettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setSettings((prev) => ({ ...prev, [field]: e.target.value }));

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "account",  label: "Account",       icon: <User size={15} /> },
    { key: "business", label: "Business Info",  icon: <Building2 size={15} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h2 className="text-xl font-bold text-gray-800 font-outfit">Settings</h2>

      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col gap-1 px-4 py-3 rounded-lg text-sm font-semibold shadow-lg max-w-[280px]
          ${msg.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          <div className="flex items-center gap-2">
            {msg.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {msg.text}
          </div>
          {msg.showRefresh && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/80 underline underline-offset-2 hover:text-white pl-6"
            >
              Website open karein to changes dekhein →
            </a>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors
                ${tab === key
                  ? "border-b-2 border-[#f26b31] text-[#f26b31] bg-orange-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ── ACCOUNT TAB ── */}
        {tab === "account" && (
          <div className="p-6 space-y-8">
            {/* Change username */}
            <form onSubmit={handleUsernameChange} className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User size={15} className="text-[#f26b31]" /> Change Username
              </h3>
              <Field label="New Username">
                <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username" required minLength={3} className={inp} />
              </Field>
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving ? "Saving…" : "Update Username"}
              </button>
            </form>

            <hr />

            {/* Change password */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Lock size={15} className="text-[#f26b31]" /> Change Password
              </h3>
              <Field label="Current Password">
                <input type="password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••" required className={inp} />
              </Field>
              <Field label="New Password">
                <input type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters" required minLength={8} className={inp} />
              </Field>
              <Field label="Confirm New Password">
                <input type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password" required className={inp} />
              </Field>
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving ? "Saving…" : "Change Password"}
              </button>
            </form>
          </div>
        )}

        {/* ── BUSINESS INFO TAB ── */}
        {tab === "business" && (
          <form onSubmit={handleSettingsSave} className="p-6 space-y-4">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Business Name">
                    <input value={settings.businessName} onChange={set("businessName")} placeholder="Ramdas Power Innovations" className={inp} />
                  </Field>
                  <Field label="GST Number">
                    <input value={settings.gstNo} onChange={set("gstNo")} placeholder="e.g. 23XXXXX0000X1Z5" className={inp} />
                  </Field>
                  <Field label="Phone">
                    <input value={settings.phone} onChange={set("phone")} placeholder="+91 98765 43210" className={inp} />
                  </Field>
                  <Field label="WhatsApp Number">
                    <input value={settings.whatsapp} onChange={set("whatsapp")} placeholder="+91 98765 43210" className={inp} />
                  </Field>
                  <Field label="Email">
                    <input type="email" value={settings.email} onChange={set("email")} placeholder="info@ramdaspower.com" className={inp} />
                  </Field>
                  <Field label="City">
                    <input value={settings.city} onChange={set("city")} placeholder="Indore" className={inp} />
                  </Field>
                  <Field label="State">
                    <input value={settings.state} onChange={set("state")} placeholder="Madhya Pradesh" className={inp} />
                  </Field>
                  <Field label="Pincode">
                    <input value={settings.pincode} onChange={set("pincode")} placeholder="452001" className={inp} />
                  </Field>
                </div>
                <Field label="Tagline">
                  <input value={settings.tagline} onChange={set("tagline")} placeholder="Authorized Schneider Electric Distributor" className={inp} />
                </Field>
                <Field label="Full Address">
                  <textarea value={settings.address} onChange={set("address")} rows={3}
                    placeholder="Shop No., Street, Area, City" className={`${inp} resize-none`} />
                </Field>
                <Field label="Google Maps Embed URL">
                  <input value={settings.mapEmbedUrl} onChange={set("mapEmbedUrl")} placeholder="https://maps.google.com/..." className={inp} />
                </Field>
                <button type="submit" disabled={saving} className={btnPrimary}>
                  {saving ? "Saving…" : "Save Business Info"}
                </button>
              </>
            )}
          </form>
        )}


      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] transition";
const btnPrimary = "px-5 py-2.5 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors";
