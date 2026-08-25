"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, verifyOtp, saveToken, isLoggedIn } from "@/lib/adminApi";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

type Step = "credentials" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep]         = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [otpMsg, setOtpMsg]     = useState(""); // hint message from server
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [resendCd, setResendCd] = useState(0); // countdown seconds

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isLoggedIn()) router.replace("/admin/dashboard");
  }, [router]);

  // Resend countdown
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setTimeout(() => setResendCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCd]);

  // ── Step 1: send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (loading) return;
    if (!username.trim() || !password.trim()) {
      setError("Username aur password dono fill karo");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await requestOtp(username.trim(), password);
      setOtpMsg(res.message);
      setStep("otp");
      setResendCd(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ───────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (loading) return;
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      setError("6-digit OTP enter karo");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(username.trim(), otpStr);
      saveToken(res.token, res.refreshToken);
      router.replace("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input box handling ────────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyOtp();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCd > 0 || loading) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      const res = await requestOtp(username.trim(), password);
      setOtpMsg(res.message);
      setResendCd(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Resend failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="bg-[#1a1a2e] px-8 py-6 text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${
              step === "otp" ? "bg-green-500" : "bg-[#f26b31]"
            }`}>
              {step === "otp"
                ? <ShieldCheck size={22} className="text-white" />
                : <Lock size={22} className="text-white" />}
            </div>
            <h1 className="text-white font-bold text-lg font-outfit">
              {step === "otp" ? "OTP Verification" : "CMS Admin Panel"}
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              {step === "otp" ? "Registered number par OTP bheja gaya hai" : "Ramdas Power Innovations"}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-7 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* ── STEP 1: Credentials ── */}
            {step === "credentials" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Username
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      autoComplete="username"
                      placeholder="admin"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#f26b31] focus:ring-1 focus:ring-[#f26b31] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-2.5 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><RefreshCw size={14} className="animate-spin" /> OTP bhej rahe hain…</>
                  ) : (
                    <><ShieldCheck size={15} /> Send OTP</>
                  )}
                </button>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <>
                {otpMsg && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 text-center">
                    {otpMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide text-center">
                    6-Digit OTP Enter Karo
                  </label>
                  {/* OTP boxes */}
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKey(i, e)}
                        className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-lg focus:outline-none transition-colors ${
                          digit
                            ? "border-[#f26b31] bg-orange-50 text-[#f26b31]"
                            : "border-gray-200 focus:border-[#f26b31]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.join("").length < 6}
                  className="w-full py-2.5 bg-[#f26b31] hover:bg-[#d85720] disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><RefreshCw size={14} className="animate-spin" /> Verify ho raha hai…</>
                  ) : (
                    <><ShieldCheck size={15} /> Verify &amp; Login</>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep("credentials"); setError(""); setOtp(["","","","","",""]); }}
                    className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCd > 0 || loading}
                    className="flex items-center gap-1 text-[#f26b31] hover:text-[#d85720] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <RefreshCw size={12} />
                    {resendCd > 0 ? `Resend in ${resendCd}s` : "Resend OTP"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
