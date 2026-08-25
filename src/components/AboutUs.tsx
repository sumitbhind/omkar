"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const DEFAULTS = {
  heroTitle: "About Omkar MFG Traders.",
  heroSubtitle: "Trusted Packaging Material Manufacturer & Supplier in Gwalior Since 2000",
  intro: "Omkar MFG Traders is a trusted Packaging Material Manufacturer & Supplier in Gwalior since 2000. We offer premium-quality Cello Tapes, Printed Tapes, Stretch Films, Bubble Rolls, Carry Bags, Paper Rolls, and other packaging materials at competitive prices.",
  description: "Our commitment to quality and timely delivery makes us a reliable packaging partner for businesses across India.",
  image: "/images/omt-about.jpg",
};

export default function AboutUs({ initialData }: { initialData?: Partial<typeof DEFAULTS> }) {
  const [data, setData] = useState({
    heroTitle:    initialData?.heroTitle    || DEFAULTS.heroTitle,
    heroSubtitle: initialData?.heroSubtitle || DEFAULTS.heroSubtitle,
    intro:        initialData?.intro        || DEFAULTS.intro,
    description:  initialData?.description  || DEFAULTS.description,
    image:        initialData?.image        || DEFAULTS.image,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const cmsRes = await fetch(`${BACKEND}/api/cms/homepage`);
        const cmsJson = await cmsRes.json();
        const cms = cmsJson.data || {};
        setData({
          heroTitle:    cms.heroTitle    || DEFAULTS.heroTitle,
          heroSubtitle: cms.heroSubtitle || DEFAULTS.heroSubtitle,
          intro:        cms.intro        || DEFAULTS.intro,
          description:  cms.description  || DEFAULTS.description,
          image:        cms.image        || DEFAULTS.image,
        });
      } catch {
        // Fallback to DEFAULTS
      }
    };

    // Only refresh on focus (admin CMS preview), not on mount — SSR provides initial data
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  return (
    <section id="about-us" className="py-12 sm:py-20 bg-[#f9f9fb] overflow-hidden font-inter">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

          {/* Left: Image */}
          <div className="w-full lg:w-1/2 relative group">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#f26b31]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200/50 bg-white p-2 transform group-hover:scale-[1.01] transition-transform duration-300">
              <Image
                src={data.image}
                alt={data.heroTitle}
                width={640}
                height={480}
                className="w-full rounded-xl object-cover max-h-[480px]"
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-1/2 text-left">

            {/* Section Label */}
            <p className="text-xs font-bold text-[#f26b31] tracking-[3px] uppercase mb-3 font-inter">
              ABOUT OUR COMPANY
            </p>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] font-outfit leading-tight mb-2">
              {data.heroTitle}
            </h2>

            {/* Orange underline accent */}
            <div className="w-14 h-1 bg-[#f26b31] rounded-full mb-5" />

            {data.heroSubtitle && (
              <h4 className="text-[15px] font-semibold text-[#2c3e50] border-l-4 border-[#3DAE4C] pl-4 mb-6 leading-relaxed font-inter">
                {data.heroSubtitle}
              </h4>
            )}

            <div className="space-y-4 font-inter text-[15px] leading-[1.85] text-justify">
              <p className="text-[#2c3e50] font-semibold whitespace-pre-line">
                {data.intro}
              </p>
              {data.description && (
                <p className="text-[#555] whitespace-pre-line">
                  {data.description}
                </p>
              )}
            </div>

            <div className="mt-8">
              <Link
                href="/about"
                className="relative inline-block overflow-hidden rounded-full bg-[#1a1a1a] text-white px-8 py-3.5 font-bold text-sm border border-[#1a1a1a] shadow-md tracking-wider transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-100 animate-shine font-inter"
              >
                Read More
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

