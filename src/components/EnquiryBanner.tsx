"use client";

import { useState, useEffect } from "react";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULTS = { phone: "+91 9522952256", email: "info@ramdaspower.com" };

export default function EnquiryBanner() {
  const [s, setS] = useState(DEFAULTS);

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${BACKEND}/api/settings`)
        .then((r) => r.json())
        .then((json) => {
          if (!json.data) return;
          setS({
            phone: json.data.phone || DEFAULTS.phone,
            email: json.data.email || DEFAULTS.email,
          });
        })
        .catch(() => {});
    };
    fetchSettings();
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, []);

  return (
    <section
      className="py-10 md:py-[60px] text-white font-outfit text-center"
      style={{ background: "linear-gradient(135deg, #f78b04, #ed1c24)" }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-bold mb-2 md:mb-[10px] tracking-wide text-white">
            Looking for Industrial Solutions?
          </h2>

          <p className="text-sm sm:text-base md:text-[18px] text-white font-inter mb-4 md:mb-[25px]">
            Get genuine, precise information and the right products for your application.
          </p>

          <div className="flex flex-row justify-center items-center gap-3 md:gap-[25px] flex-wrap">

            <div className="flex items-center gap-[10px] bg-white/15 px-4 py-3 md:px-[20px] md:py-[12px] rounded-[8px] backdrop-blur-[2px] transition-all duration-300 hover:bg-white/25">
              <Phone className="h-[20px] w-[20px] text-[#f9d423] fill-[#f9d423]" />
              <a
                href={`tel:${s.phone.replace(/\s/g, "")}`}
                className="font-inter font-medium text-sm md:text-[16px] text-white hover:underline"
              >
                {s.phone}
              </a>
            </div>

            <div className="flex items-center gap-[10px] bg-white/15 px-4 py-3 md:px-[20px] md:py-[12px] rounded-[8px] backdrop-blur-[2px] transition-all duration-300 hover:bg-white/25">
              <Mail className="h-[20px] w-[20px] text-[#f9d423] fill-[#f9d423]" />
              <a
                href={`mailto:${s.email}`}
                className="font-inter font-medium text-sm md:text-[16px] text-white hover:underline"
              >
                {s.email}
              </a>
            </div>

            <Link
              href="/contact"
              className="px-5 py-3 md:px-[25px] md:py-[12px] rounded-[8px] font-semibold text-sm md:text-[16px] text-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ background: "linear-gradient(135deg, #f78b04, #0fd8d8)" }}
            >
              Enquire Now
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
