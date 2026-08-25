"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Handshake } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface Brand {
  _id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  isActive: boolean;
}

export default function BrandsSlider() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    const loadBrands = () => {
      fetch(`${BACKEND}/api/brands`)
        .then((r) => r.json())
        .then((json) => {
          if (json.status === "success" && json.data) {
            setBrands(json.data.filter((b: Brand) => b.isActive));
          }
        })
        .catch(() => {});
    };
    loadBrands();
    window.addEventListener("focus", loadBrands);
    return () => window.removeEventListener("focus", loadBrands);
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#f9f9fb] border-y border-gray-100 font-inter">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-10">
          <h4 className="text-[#f26b31] text-xs font-bold uppercase tracking-widest mb-2 font-outfit">
            BRANDS WE DISTRIBUTE
          </h4>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-outfit">
            Our Authorized Partnerships
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1.2}
          loop={brands.length >= 3}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            480: { slidesPerView: 1.5, spaceBetween: 20 },
            640: { slidesPerView: 2.2, spaceBetween: 24 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="w-full pb-12"
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand._id} className="h-auto py-2">
              <div className="flex flex-col h-full bg-white border border-gray-200/60 hover:border-[#f26b31]/40 rounded-2xl p-6 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transform duration-300 min-h-[260px] justify-between">
                <div>
                  {/* Logo Container */}
                  <div className="h-16 w-full flex items-center justify-center mb-4 bg-gray-50 border border-gray-100/50 rounded-xl p-3 shrink-0">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Handshake className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  {/* Name and Description */}
                  <div className="text-center">
                    <h5 className="font-bold text-gray-900 text-[16px] mb-1.5 font-outfit tracking-wide">
                      {brand.name}
                    </h5>
                    {brand.description ? (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-inter mb-4">
                        {brand.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-4">
                        Authorized dealer & switchgear solution provider
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Web link */}
                <div className="text-center mt-2">
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 text-xs text-[#f26b31] font-bold hover:text-[#d4581f] transition-colors hover:underline"
                    >
                      Visit Website →
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Official Partner
                    </span>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
