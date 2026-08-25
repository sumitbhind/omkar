"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface Popup {
  _id: string;
  title: string;
  content: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  type: "announcement" | "discount" | "newsletter" | "exit-intent";
  triggerDelay: number;
  bgColor: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function PopupDisplay() {
  const [popup, setPopup]     = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenerRef           = useRef<((e: MouseEvent) => void) | null>(null);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    fetch(`${BACKEND}/api/popups`)
      .then(r => r.json())
      .then(json => {
        const list: Popup[] = Array.isArray(json.data) ? json.data : [];
        const now = Date.now();

        const found = list.find(p => {
          if (!p.isActive) return false;
          if (p.startDate && new Date(p.startDate).getTime() > now) return false;
          if (p.endDate   && new Date(p.endDate).getTime()   < now) return false;
          return true;
        });

        if (!found) return;
        setPopup(found);

        if (found.type === "exit-intent") {
          const handler = (e: MouseEvent) => {
            if (e.clientY <= 10) {
              setVisible(true);
              document.removeEventListener("mouseleave", handler);
            }
          };
          listenerRef.current = handler;
          document.addEventListener("mouseleave", handler);
        } else {
          const ms = Math.max(0, found.triggerDelay ?? 3) * 1000;
          timerRef.current = setTimeout(() => setVisible(true), ms);
        }
      })
      .catch(() => {});

    return () => {
      if (timerRef.current)    clearTimeout(timerRef.current);
      if (listenerRef.current) document.removeEventListener("mouseleave", listenerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, dismiss]);

  if (!popup || !visible) return null;

  const bg      = popup.bgColor || "#ffffff";
  const isLight = isLightColor(bg);
  const textClr = isLight ? "#111827" : "#ffffff";
  const subClr  = isLight ? "#4b5563" : "rgba(255,255,255,0.82)";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.62)" }}
      onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: bg, animation: "popupIn 0.28s cubic-bezier(.34,1.56,.64,1)" }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{
            background: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.25)",
            color: textClr,
          }}
        >
          <X size={15} />
        </button>

        {/* Image — full width, no max-height cap */}
        {popup.image && (
          <div className="w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={popup.image}
              alt={popup.title}
              className="w-full object-cover block"
              style={{ maxHeight: 260 }}
            />
          </div>
        )}

        {/* Text body */}
        <div className="px-6 pt-5 pb-6">
          {/* Type badge */}
          {popup.type !== "announcement" && (
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-3"
              style={{
                background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.2)",
                color: textClr,
              }}
            >
              {popup.type === "discount"
                ? "Special Offer"
                : popup.type === "newsletter"
                ? "Newsletter"
                : "Exit Offer"}
            </span>
          )}

          <h2
            className="text-xl font-bold leading-snug pr-6"
            style={{ color: textClr }}
          >
            {popup.title}
          </h2>

          {popup.content && (
            <p className="text-sm leading-relaxed mt-2 mb-5" style={{ color: subClr }}>
              {popup.content}
            </p>
          )}

          {popup.buttonText && (
            <a
              href={popup.buttonLink || "#"}
              target={popup.buttonLink?.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              onClick={dismiss}
              className="mt-4 block w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
              style={{
                backgroundColor: isLight ? "#f26b31" : "#ffffff",
                color:           isLight ? "#ffffff"  : "#111827",
              }}
            >
              {popup.buttonText}
            </a>
          )}

          <button
            onClick={dismiss}
            className="mt-3 block w-full text-center text-xs py-1 transition-opacity hover:opacity-60"
            style={{ color: subClr }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
