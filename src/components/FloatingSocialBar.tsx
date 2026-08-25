"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

interface SocialItem {
  label: string;
  href: string;
  color: string;
  Icon: React.ComponentType;
  external: boolean;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/* ── SVG Icons with direct path fills ───────────────────────────── */
const IcoFacebook = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IcoWhatsApp = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]">
    <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const IcoInstagram = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]">
    <defs>
      <linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path fill="url(#ig-g)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const IcoLinkedIn = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]">
    <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IcoTwitter = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]">
    <path fill="#000000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IcoYouTube = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]">
    <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/* ── Per-button component (handles hover state for smooth slide) ── */
function SocialButton({ label, href, color, Icon, external }: SocialItem & { external: boolean }) {
  const inner = (
    <div className="flex items-center justify-end h-[46px] group cursor-pointer">
      {/* Label slides in — ONLY on sm and up (desktop) */}
      <div
        className="h-full overflow-hidden flex items-center rounded-l-full w-0 sm:group-hover:w-[154px] transition-[width] duration-300 ease-in-out"
        style={{ backgroundColor: color }}
      >
        <span className="px-4 text-white text-[13px] font-semibold whitespace-nowrap select-none">
          {label}
        </span>
      </div>
      {/* Icon circle — always visible */}
      <div className="w-[46px] h-[46px] rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.18)] border border-gray-100">
        <Icon />
      </div>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={label}>
      {inner}
    </Link>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function FloatingSocialBar({
  settings: initial,
}: {
  settings?: Partial<SiteSettings>;
}) {
  const [s, setS] = useState<Partial<SiteSettings>>(initial ?? {});
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${BACKEND}/api/settings`)
        .then((r) => r.json())
        .then((json) => { if (json.data) setS(json.data); })
        .catch(() => {});
    };
    fetchSettings();
    window.addEventListener("focus", fetchSettings);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("focus", fetchSettings);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const wa = (s.whatsapp || "919691708989").replace(/[+\s]/g, "");
  const waHref = `https://api.whatsapp.com/send?phone=${wa}&text=Hi%2C%20I%20would%20like%20to%20do%20enquire%20about%20your%20products.`;

  /* Same order as reference: Facebook, WhatsApp, Instagram, LinkedIn, Quote, Pricelist */
  const items = [
    { show: !!s.facebook,  label: "Facebook",        href: s.facebook ?? "#", color: "#1877F2", Icon: IcoFacebook,  external: true  },
    { show: true,          label: "WhatsApp",         href: waHref,             color: "#25D366", Icon: IcoWhatsApp,  external: true  },
    { show: !!s.instagram, label: "Instagram",        href: s.instagram ?? "#", color: "#E1306C", Icon: IcoInstagram, external: true  },
    { show: !!s.linkedin,  label: "LinkedIn",         href: s.linkedin ?? "#",  color: "#0A66C2", Icon: IcoLinkedIn,  external: true  },
    { show: !!s.twitter,   label: "Twitter / X",      href: s.twitter ?? "#",  color: "#111111", Icon: IcoTwitter,   external: true  },
    { show: !!s.youtube,   label: "YouTube",          href: s.youtube ?? "#",  color: "#FF0000", Icon: IcoYouTube,   external: true  },
  ].filter((i) => i.show) as SocialItem[];

  return (
    <div className="fixed right-0 bottom-5 z-[999] flex flex-col gap-[5px] w-[46px] sm:w-[200px] overflow-visible items-end pr-0">
      {items.map((item) => (
        <SocialButton key={item.label} {...item} />
      ))}
      
      {/* Scroll to Top Arrow Button - aligned in the same stack */}
      <button
        onClick={scrollToTop}
        className={`w-[46px] h-[46px] rounded-full bg-[#f26b31] hover:bg-[#333] flex-shrink-0 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.18)] text-white cursor-pointer transition-all duration-500 border border-orange-500/20 ${
          showScroll
            ? "opacity-100 scale-100 mt-8"
            : "opacity-0 scale-75 pointer-events-none h-0 mt-0 overflow-hidden border-none shadow-none"
        }`}
        aria-label="Scroll to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
    </div>
  );
}
