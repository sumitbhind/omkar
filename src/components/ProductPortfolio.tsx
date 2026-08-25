"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Link from "next/link";
import {
  ShieldCheck, Settings, Network, LineChart, Factory, Home, Package, Box, Layers, Archive
} from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

interface Category { _id: string; name: string; slug: string; description: string }

const ICON_MAP: Record<string, React.ElementType> = {
  "cello-tape":              Package,
  "printed-tape":            Package,
  "stretch-film":            Layers,
  "bubble-roll":             Package,
  "paper-roll":              Layers,
  "corrugated-sheets":       Layers,
  "corrugated-boxes":        Archive,
};

export default function ProductPortfolio({ categories }: { categories: Category[] }) {
  return (
    <section className="py-12 sm:py-20 bg-brand-light font-outfit overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">

        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f26b31] relative inline-block pb-3 uppercase tracking-wide">
            Our Product Portfolio
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#efad05] rounded-full" />
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 font-inter max-w-xl mx-auto">
            Complete packaging solutions including premium tapes, stretch films, and durable corrugated boxes.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-gray-400">No categories available.</p>
        ) : (
          <div className="relative pb-16">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true, el: ".swiper-portfolio-pagination" }}
              loop={categories.length > 1}
              breakpoints={{
                0:    { slidesPerView: 1 },
                640:  { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="w-full"
            >
              {categories.map((cat) => {
                const IconComponent = ICON_MAP[cat.slug] ?? Package;
                return (
                  <SwiperSlide key={cat._id} className="h-auto">
                    <div className="h-full flex flex-col justify-between items-center text-center bg-white p-8 rounded-[10px] border border-gray-100 shadow-[0_10px_25px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:border-b-4 hover:border-b-[#f26b31] transition-all duration-300 ease-in-out group min-h-[420px]">

                      <div className="flex flex-col items-center w-full">
                        <div className="w-14 h-14 bg-brand-dark rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-white group-hover:scale-110 group-hover:shadow-[rgba(100,100,111,0.2)_0px_7px_29px_0px]">
                          <IconComponent className="h-6 w-6 text-white transition-colors duration-300 group-hover:text-[#f26b31]" />
                        </div>

                        <h4 className="text-xl font-bold text-[#f26b31] group-hover:text-black mb-4 min-h-[55px] flex items-center justify-center transition-colors duration-300">
                          {cat.name}
                        </h4>

                        <p className="text-sm font-inter text-gray-500 group-hover:text-black leading-relaxed mb-6 line-clamp-4 transition-colors duration-300">
                          {cat.description || `Explore our high-quality ${cat.name} for your packaging needs.`}
                        </p>
                      </div>

                      <div className="w-full flex justify-center mt-auto">
                        <Link
                          href={`/${cat.slug}`}
                          className="inline-block px-6 py-2.5 bg-[#f26b31] text-white hover:bg-[#e05a20] font-semibold text-xs rounded-md tracking-wider shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-md"
                        >
                          Explore Now
                        </Link>
                      </div>

                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <div className="absolute bottom-4 left-0 right-0 z-30 w-full flex justify-center">
              <div className="swiper-portfolio-pagination flex justify-center gap-2 w-full"></div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
