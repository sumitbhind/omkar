"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface Slide {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  link: string;
  buttonText: string;
  position: string;
  isActive: boolean;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    _id: "default-1",
    title: "",
    subtitle: "",
    image: "/hero-banner.jpeg",
    bgColor: "#1a1a1a",
    link: "",
    buttonText: "",
    position: "hero",
    isActive: true,
  },
  {
    _id: "default-2",
    title: "",
    subtitle: "",
    image: "/hero-banner-2.jpeg",
    bgColor: "#1a1a1a",
    link: "",
    buttonText: "",
    position: "hero",
    isActive: true,
  },
  {
    _id: "default-3",
    title: "",
    subtitle: "",
    image: "/hero-banner-3.jpeg",
    bgColor: "#1a1a1a",
    link: "",
    buttonText: "",
    position: "hero",
    isActive: true,
  },
  {
    _id: "default-4",
    title: "",
    subtitle: "",
    image: "/hero-banner-4.jpeg",
    bgColor: "#1a1a1a",
    link: "",
    buttonText: "",
    position: "hero",
    isActive: true,
  },
];

export default function Hero({ initialSlides }: { initialSlides?: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides?.length ? initialSlides : DEFAULT_SLIDES
  );

  useEffect(() => {
    // Backend fetch disabled as per request to only show the single new image
    /*
    const fetchBanners = () => {
      fetch(`${BACKEND}/api/banners?position=hero`)
        .then((r) => r.json())
        .then((json) => {
          if (json.status === "success" && json.data && json.data.length > 0) {
            setSlides(json.data);
          }
        })
        .catch(() => { });
    };
    window.addEventListener("focus", fetchBanners);
    return () => window.removeEventListener("focus", fetchBanners);
    */
  }, []);

  return (
    <section className="relative w-full lg:mt-[96px] aspect-[1600/757] bg-gray-900 overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: ".swiper-pagination",
        }}
        loop={true}
        className="w-full h-full"
      >
        {slides.map((slide, index) => {
          const titleParts = slide.title
            ? slide.title
              .split(".")
              .map((p) => p.trim())
              .filter(Boolean)
            : [];
          return (
            <SwiperSlide key={slide._id || index} className="relative w-full h-full bg-gray-900">
              <div className="relative w-full h-full">
                {slide.image ? (
                  <>
                    <Image
                      src={slide.image}
                      alt={slide.title || `Hero Slide ${index + 1}`}
                      width={1920}
                      height={1083}
                      className="w-full h-full object-cover object-center absolute inset-0 hero-img"
                      style={{ width: "100%", height: "100%" }}
                      priority={index === 0}
                    />
                    {slide.link && (
                      <Link href={slide.link} className="absolute inset-0 z-10 block w-full h-full" />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full absolute inset-0" style={{ backgroundColor: slide.bgColor }} />
                )}
                <div className="absolute inset-0 bg-black/10" />

                {/* Slogan Text Overlay - Disabled permanently to prevent double-banner text overlap
                {titleParts.length > 0 && (
                  <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 w-full h-full relative z-20">
                    <div className="absolute left-5 sm:left-8 lg:left-12 top-[35%] sm:top-[30%] md:top-[25%] lg:top-[20%] flex flex-col space-y-3 md:space-y-4 max-w-[90%] sm:max-w-xl font-outfit">
                      {titleParts.map((part, pIdx) => (
                        <div
                          key={pIdx}
                          className="inline-block bg-[#3DAE4C] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-[5px] shadow-[0_4px_10px_rgba(0,0,0,0.15)] transform -skew-x-6 self-start hero-tag"
                        >
                          <h2 className="text-xl sm:text-3xl md:text-[40px] font-black tracking-wide uppercase italic transform skew-x-6 leading-none m-0">
                            {part}.
                          </h2>
                        </div>
                      ))}
                      {slide.subtitle && (
                        <div className="text-white bg-black/40 backdrop-blur-[5px] border border-white/10 px-3 py-1.5 rounded self-start font-semibold text-xs sm:text-sm tracking-wider uppercase font-inter hero-subtitle-badge">
                          {slide.subtitle}
                        </div>
                      )}
                      {slide.buttonText && slide.link && (
                        <a
                          href={slide.link}
                          className="inline-block bg-[#f26b31] hover:bg-[#d4581f] text-white px-6 py-3 rounded-lg text-sm font-semibold self-start transition-colors font-inter shadow-md hero-cta-btn"
                        >
                          {slide.buttonText}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                */}
              </div>
            </SwiperSlide>
          );
        })}

        {/* Custom Pagination container placed at bottom */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center">
          <div className="swiper-pagination"></div>
        </div>
      </Swiper>
    </section>
  );
}

