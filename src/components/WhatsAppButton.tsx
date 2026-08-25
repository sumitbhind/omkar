"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function WhatsAppButton({ whatsapp: initial }: { whatsapp?: string }) {
  const [whatsapp, setWhatsapp] = useState(initial || "919691708989");

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${BACKEND}/api/settings`)
        .then((r) => r.json())
        .then((json) => { if (json.data?.whatsapp) setWhatsapp(json.data.whatsapp); })
        .catch(() => {});
    };
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, []);

  const phone = whatsapp.replace(/[+\s]/g, "");

  return (
    <div className="fixed right-5 bottom-0 z-[999] hover:scale-110 transition-transform duration-200">
      <a
        href={`https://api.whatsapp.com/send?phone=${phone}&text=Hi,%20I%20would%20like%20to%20do%20enquire%20about%20your%20products`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
      >
        <Image
          src="/images/whatsapp-icon.png"
          alt="WhatsApp Floating Icon"
          width={40}
          height={40}
          className="w-10 h-10 object-contain"
        />
      </a>
    </div>
  );
}
