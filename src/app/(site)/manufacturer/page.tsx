import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manufacturer | Ramdas Power Innovations",
  description:
    "We manufacture Power Control Centres, Motor Control Centres, Lighting & Power Distribution Panels, DG Synchronization Panels, VFD, APFC, PLC Based Panels, and Bus Ducts.",
};

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

interface PanelItem { _id: string; title: string; description: string }

async function fetchItems(): Promise<PanelItem[]> {
  try {
    const res = await fetch(`${BACKEND}/api/panel-items?section=manufacturer`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

const galleryImages = Array.from({ length: 11 }, (_, i) => i + 1);

export default async function ManufacturerPage() {
  const panels = await fetchItems();

  return (
    <div className="min-h-screen bg-white font-inter">

      {/* Banner */}
      <div className="relative overflow-hidden">
        <img
          src="/images/image-banner/about.png"
          alt=""
          aria-hidden="true"
          className="w-full block h-auto sm:h-[300px] md:h-[360px] lg:h-[420px] sm:object-cover sm:object-center"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 flex items-end z-10">
          <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-16 pb-4 sm:pb-[50px]">
            <h1 className="text-2xl sm:text-4xl md:text-[42px] font-bold text-gray-900 font-outfit mb-3 leading-tight">
              Manufacturer
            </h1>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Link href="/" className="hover:text-[#f26b31] transition-colors">Home</Link>
              <span className="text-gray-500 font-bold text-xs">»»</span>
              <span className="text-gray-800 font-bold">Manufacturer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Text */}
      <section className="bg-[#f5f7fa] py-8 px-4 sm:px-6 lg:px-16">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-[18px] sm:text-[20px] font-semibold text-[#3c3c3c] leading-[1.9] tracking-wide text-justify">
            We provide a comprehensive range of electrical products engineered for performance, safety, and long-term reliability. Our solutions cater to industrial, commercial, and infrastructure sectors with a focus on quality and efficiency.
          </p>
        </div>
      </section>

      {/* Product Cards */}
      {panels.length > 0 && (
        <section className="py-10 md:py-14">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {panels.map((panel) => (
                <div
                  key={panel._id}
                  className="bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:bg-[bisque] group"
                >
                  <div className="p-6 text-center h-[200px] flex flex-col justify-center gap-4">
                    <h3 className="text-[20px] font-semibold text-[#111] group-hover:text-black font-outfit leading-snug">
                      {panel.title}
                    </h3>
                    {panel.description && (
                      <p className="text-[14px] text-[#555] group-hover:text-black leading-relaxed">
                        {panel.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      <section className="pb-14 md:pb-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16">
          <div
            className="grid gap-8"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))" }}
          >
            {galleryImages.map((num) => (
              <div key={num} className="overflow-hidden shadow-[0.3rem_0.4rem_0.4rem_rgba(0,0,0,0.4)]">
                <Image
                  src={`/images/we_manufacture_img/${num}.jpg`}
                  alt={`Manufacturer gallery image ${num}`}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-[400ms] ease-out hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
