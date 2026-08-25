"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";


const DEFAULTS: SiteSettings = {
  businessName: "Ramdas Power Innovations",
  tagline: "",
  phone: "+91 9691708989",
  whatsapp: "919691708989",
  email: "",
  address: "B-72, Om Residency, Tansen Nagar",
  city: "Gwalior, Madhya Pradesh (M.P.)",
  state: "Madhya Pradesh",
  pincode: "474002",
  instagram: "",
  facebook: "",
  twitter: "",
  youtube: "",
  linkedin: "",
  mapEmbedUrl: "",
};

export default function Footer({ settings: initialSettings }: { settings?: Partial<SiteSettings> }) {
  const [s, setS] = useState<SiteSettings>({ ...DEFAULTS, ...initialSettings });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSettings = () => {
      fetch(`${BACKEND}/api/settings`)
        .then((r) => r.json())
        .then((json) => { if (json.data) setS({ ...DEFAULTS, ...json.data }); })
        .catch(() => { });
    };
    // Re-fetch when user switches back to this tab (e.g., after saving in admin)
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, []);

  const renderAddress = () => {
    const addr = s.address || "";
    const cityPin = s.city && s.pincode
      ? `${s.city} – ${s.pincode}`
      : s.city || s.pincode || "";

    if (addr.includes("Siddharth Farms,")) {
      const parts = addr.split("Siddharth Farms,");
      const line1 = parts[0] + "Siddharth Farms,";
      const line2 = parts[1].trim();
      return (
        <>
          {line1}
          <br />
          {line2}{cityPin ? `, ${cityPin}` : ""}
        </>
      );
    }
    return [addr, cityPin].filter(Boolean).join(", ");
  };

  return (
    <>
      <footer className="bg-[#111214] text-white font-outfit py-10 md:py-[60px] relative z-10 w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">

            {/* Column 1: Logo and About */}
            <div className="md:col-span-5 flex flex-col items-start lg:-ml-[30px]">
              <Link href="/" className="inline-block mb-4 bg-white p-3 rounded-lg">
                <Image
                  src="/new-logo.png"
                  alt="Company Logo"
                  width={280}
                  height={80}
                  className="object-contain"
                  style={{ height: "80px", width: "auto", maxHeight: "100%" }}
                  priority
                />
              </Link>

              {/* Orange Separator Line */}
              <div className="w-[80px] h-[2px] bg-[#f26b31] mb-6 mt-1 ml-[10px]" />

              <p className="text-white font-inter text-sm leading-relaxed text-justify max-w-[400px] ml-[10px]">
                Omkar MFG Traders is a trusted Packaging Material Manufacturer &amp;
                Supplier based in Gwalior, Madhya Pradesh, serving businesses across
                India since 2000.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 md:pl-10 md:mt-[20px]">
              <h3 className="relative text-[20px] font-medium text-white font-roboto pl-[10px] mb-[20px] before:content-[''] before:absolute before:left-0 before:top-[2px] before:w-[2px] before:h-[22px] before:bg-[#f26b31] capitalize">
                Quick Links
              </h3>
              <ul className="space-y-[7px] font-inter text-sm text-white">
                <li>
                  <Link href="/" className="hover:text-[#f26b31] transition-colors">Home</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#f26b31] transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#f26b31] transition-colors">Schneider</Link>
                </li>
                <li>
                  <Link href="/pricelist" className="hover:text-[#f26b31] transition-colors">Pricelist</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#f26b31] transition-colors">Contact Us</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div className="md:col-span-4 md:mt-[20px]">
              <h3 className="relative text-[20px] font-medium text-white font-roboto pl-[10px] mb-[20px] before:content-[''] before:absolute before:left-0 before:top-[2px] before:w-[2px] before:h-[22px] before:bg-[#f26b31] capitalize">
                Contact Info
              </h3>

              <ul className="space-y-[10px] font-inter text-[15px] text-white mb-[15px]">
                {s.phone && (
                  <li className="flex items-center">
                    <Phone className="h-[16px] w-[16px] text-[#fea52c] mr-[10px] flex-shrink-0" />
                    <a
                      href={`tel:${s.phone.replace(/\s/g, "")}`}
                      className="hover:text-[#f26b31] transition-colors"
                    >
                      {s.phone}
                    </a>
                  </li>
                )}
                {s.email && (
                  <li className="flex items-center">
                    <Mail className="h-[16px] w-[16px] text-[#fea52c] mr-[10px] flex-shrink-0" />
                    <a
                      href={`mailto:${s.email}`}
                      className="hover:text-[#f26b31] transition-colors"
                    >
                      {s.email}
                    </a>
                  </li>
                )}
              </ul>

              {s.address && (
                <div className="flex items-start text-[14px] text-white leading-[1.6] mb-4">
                  <MapPin className="h-[18px] w-[18px] text-[#fea52c] mr-[10px] flex-shrink-0 mt-[3px]" />
                  <span className="text-justify leading-relaxed">{renderAddress()}</span>
                </div>
              )}

            </div>

          </div>
        </div>
      </footer>

      {/* Copyright Banner */}
      <div className="bg-[#000] text-white py-[15px] relative z-10 w-full font-inter border-t border-gray-900/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm md:text-[15px] text-white leading-normal inline-block">
            Copyright © {currentYear}{" "}
            <Link href="/" className="text-[#fea52c] hover:text-[#fea52c]/90 transition-colors font-semibold">
              {s.businessName}
            </Link>
            . Developed by{" "}
            <a
              href="https://www.bdminfotech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block align-middle transition-opacity hover:opacity-95"
            >
              <img
                src="/images/bdm_logo_footer.png"
                alt="BDM Logo"
                className="inline-block w-[90px] sm:w-[120px] md:w-[150px] h-auto align-middle ml-1"
              />
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
