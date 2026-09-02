import Link from "next/link";
import { Check } from "lucide-react";
import EnquiryBanner from "@/components/EnquiryBanner";


const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000";

const DEFAULTS = {
  heroTitle:   "About Omkar MFG Traders",
  heroSubtitle: "Trusted Packaging Material Manufacturer & Supplier Since 2000",
  intro:       "Established in 2000, Omkar MFG Traders is a trusted Manufacturer, Supplier, and Wholesaler of Packaging Materials based in Gwalior, Madhya Pradesh, India. With over 25 years of experience, we provide high-quality packaging solutions that help businesses protect their products during storage, transportation, and delivery.",
  description: "We manufacture and supply a wide range of packaging products, including Cello Tapes, Printed Tapes, Brown Tapes, Masking Tapes, Double Sided Tapes, Electrical Tapes, Stretch Films, Bubble Rolls, Paper Rolls, Carry Bags, and other packaging materials. Every product is made using premium-quality raw materials to ensure strong adhesion, durability, and reliable performance.\n\nAt Omkar MFG Traders, we combine modern manufacturing techniques with strict quality standards to deliver packaging products that meet the needs of industries, retailers, wholesalers, logistics companies, e-commerce businesses, and commercial organizations. Our focus on quality, competitive pricing, and on-time delivery has helped us build long-term relationships with customers across India.\n\nWe believe that good packaging not only protects products but also creates a strong brand impression. Our goal is to provide reliable, affordable, and customized packaging solutions that add value to every business we serve.",
  vision:      "",
  mission:     "Established in 2000 with 25+ years of industry experience\nTrusted Manufacturer & Supplier of Packaging Materials\nWide Range of High-Quality Packaging Products\nPremium Raw Materials for Better Strength & Performance\nCompetitive Prices with Bulk Order Support\nCustomized Printed Tape & Packaging Solutions\nStrict Quality Control at Every Stage\nFast & On-Time Delivery Across India\nDedicated Customer Support & Quick Response\nTrusted by Businesses Across Multiple Industries",
  image:       "/images/omt-about-new.jpg",
  stats:       [] as { label: string; value: string }[],
  industries:  [
    "E-commerce & Retail",
    "Logistics & Courier",
    "Manufacturing Industries",
    "Warehouses",
    "Food & Beverage",
    "Pharmaceuticals",
    "Electronics",
    "FMCG",
    "Packaging & Printing",
    "Industrial & Commercial Businesses",
  ] as string[],
};

async function getAboutData() {
  try {
    const res = await fetch(`${BACKEND}/api/cms/about`, { cache: "no-store" });
    if (!res.ok) return DEFAULTS;
    const json = await res.json();
    return { ...DEFAULTS, ...json.data };
  } catch {
    return DEFAULTS;
  }
}

export const metadata = {
  title: "About Us | Omkar MFG Traders",
  description:
    "Omkar MFG Traders is a trusted Manufacturer, Supplier, and Wholesaler of Packaging Materials based in Gwalior, Madhya Pradesh, serving businesses across India since 2000.",
  keywords:
    "Omkar MFG Traders, OMT Packaging Solution, packaging material manufacturer Gwalior, cello tape supplier, stretch film, bubble roll, printed tape",
};

export default async function AboutPage() {
  const data = await getAboutData();

  return (
    <div className="min-h-screen bg-white font-inter">

      {/* ── Breadcrumb / Hero Banner ── */}
      <div className="relative overflow-hidden">
        <img
          src="/images/image-banner/about.png"
          alt=""
          aria-hidden="true"
          className="w-full block h-auto sm:h-[300px] md:h-[360px] lg:h-[420px] sm:object-cover sm:object-center"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 flex items-end z-10">
          <div className="w-full max-w-[1320px] mx-auto
                          px-4 sm:px-8 lg:px-12
                          pb-4 sm:pb-10 md:pb-14 lg:pb-[60px]">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[42px]
                           font-bold text-gray-900 font-outfit mb-2 sm:mb-3 leading-tight">
              About <span className="text-[#f26b31]">Us</span>
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2
                            text-xs sm:text-sm font-semibold text-gray-700">
              <Link href="/" className="hover:text-[#f26b31] transition-colors">
                Home
              </Link>
              <span className="text-gray-500 font-bold text-xs">»»</span>
              <span className="text-gray-800 font-bold">About Us</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-10 lg:gap-14 items-start mb-10 sm:mb-14 lg:mb-16">

            {/* Left: Text Content */}
            <div className="flex-1 text-gray-700 leading-relaxed text-[15px] md:text-[16px]">

              {/* Section Label */}
              <p className="text-xs font-bold text-[#f26b31] tracking-[3px] uppercase mb-3 font-inter">
                OUR STORY
              </p>

              {/* Main Title */}
              <h2 className="text-2xl sm:text-3xl md:text-[38px] font-extrabold text-[#1a1a1a] font-outfit mb-2 leading-tight">
                {data.heroTitle}
              </h2>

              {/* Orange underline accent */}
              <div className="w-16 h-1 bg-[#f26b31] rounded-full mb-5" />

              {data.heroSubtitle && (
                <h4 className="text-base font-semibold text-[#2c3e50] border-l-4 border-[#3DAE4C] pl-4 mb-6 leading-relaxed font-inter">
                  {data.heroSubtitle}
                </h4>
              )}

              {data.intro && (
                <p className="text-justify font-semibold text-[#2c3e50] text-[15px] leading-[1.85] mb-5">
                  {data.intro}
                </p>
              )}

              {data.description && (
                <p className="text-justify text-[#555] text-[15px] leading-[1.85] mb-10 whitespace-pre-line">
                  {data.description}
                </p>
              )}

              {/* Our Vision */}
              {data.vision && (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] font-outfit mb-3 mt-8 flex items-center gap-2">
                    <span className="inline-block w-1 h-6 bg-[#f26b31] rounded-full" />
                    Our <span className="text-[#f26b31] ml-1">Vision</span>
                  </h3>
                  <p className="text-justify text-[#555] text-[15px] leading-[1.85] mb-8 whitespace-pre-line">
                    {data.vision}
                  </p>
                </>
              )}

              {/* Why Choose Us */}
              {data.mission && (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] font-outfit mb-3 mt-8 flex items-center gap-2">
                    <span className="inline-block w-1 h-6 bg-[#f26b31] rounded-full" />
                    Why Choose <span className="text-[#f26b31] ml-1">Omkar MFG Traders?</span>
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[#555] text-[15px] leading-[1.85]">
                    {data.mission.split("\n").map((line: string, i: number) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      return (
                        <p key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#f26b31] flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </span>
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right: About Image */}
            {data.image && (
              <div className="w-full sm:w-[80%] sm:mx-auto lg:mx-0 lg:w-[320px] xl:w-[380px] shrink-0">
                <div className="lg:sticky lg:top-24 rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white p-2">
                  <img
                    src={data.image}
                    alt={data.heroTitle}
                    className="w-full h-auto rounded-xl object-cover max-h-[320px] sm:max-h-[400px] lg:max-h-[480px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Industries We Serve */}
          {data.industries && data.industries.length > 0 && (
            <div className="border-t border-gray-100 pt-8 sm:pt-12 mt-2 sm:mt-4">
              <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] font-outfit mb-6 flex items-center gap-2">
                <span className="inline-block w-1 h-6 bg-[#f26b31] rounded-full" />
                Industries <span className="text-[#f26b31] ml-1">We Serve</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {data.industries.map((industry: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2.5 rounded-full bg-[#f9f9fb] border border-gray-200 text-[#2c3e50] text-sm font-semibold font-inter hover:bg-[#f26b31] hover:text-white hover:border-[#f26b31] transition-colors"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section */}
          {data.stats && data.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 border-t border-gray-100 pt-8 sm:pt-12 mt-2 sm:mt-4">
              {data.stats.map((stat: { value: string; label: string }, i: number) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#f26b31] mb-2 font-outfit">
                    {stat.value}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-[#555] font-semibold font-inter">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── Enquiry Banner ── */}
      <EnquiryBanner />

    </div>
  );
}

