"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";

interface NavCategory { _id: string; name: string; slug: string }

export default function Header({
  categories = [],
  panelSections = [],
}: {
  categories?: NavCategory[];
  panelSections?: NavCategory[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const productLinks = [
    { name: "Cello Tape", href: "/cello-tape" },
    { name: "Printed Tape", href: "/printed-tape" },
    { name: "Stretch Film", href: "/stretch-film" },
    { name: "Bubble Roll", href: "/bubble-roll" },
    { name: "Paper Roll", href: "/paper-roll" },
    { name: "Corrugated Sheets", href: "/corrugated-sheets" },
    { name: "Corrugated Boxes", href: "/corrugated-boxes" },
  ];
  const panelBuilderLinks = panelSections.map((s) => ({ name: s.name, href: `/${s.slug}` }));

  const toggleSubmenu = (menu: string) => {
    if (activeSubmenu === menu) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(menu);
    }
  };

  return (
    <header
      className={`font-roboto transition-all duration-300 bg-white ${isScrolled
        ? "lg:fixed lg:top-0 lg:left-0 lg:w-full lg:z-[9999] lg:shadow-[0px_3px_15px_3px_rgba(33,33,34,0.125)]"
        : "lg:absolute lg:top-0 lg:left-0 lg:w-full lg:z-[1008] lg:shadow-none"
        } relative w-full z-[1008] lg:border-b-0`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[110px]">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center lg:-ml-[30px]">
            <Link href="/" className="flex py-2 relative">
              <Image
                src="/new-logo.png"
                alt="Company Logo"
                width={270}
                height={70}
                className="object-contain"
                style={{ height: "105px", width: "auto", maxHeight: "100%" }}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <Link
              href="/"
              className="text-[#f26b31] font-medium text-[18px] px-5 py-[30px] transition-colors duration-200 hover:text-[#f26b31]"
            >
              Home
            </Link>
            {/* About Us Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-[#f26b31] font-medium text-[18px] px-5 py-[30px] transition-colors duration-200 hover:text-[#f26b31] focus:outline-none cursor-pointer">
                <span>About Us</span>
                <ChevronRight className="ml-1 h-[15px] w-[15px] p-0.5 text-[#f26b31] transition-transform duration-200 transform group-hover:rotate-90" />
              </button>
              <div className="absolute left-0 top-full w-[220px] bg-black/45 backdrop-blur-[15px] -webkit-backdrop-blur-[10px] rounded-lg border border-white/15 shadow-[0_0_5px_rgba(0,0,0,0.1)] opacity-0 invisible translate-y-5 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 py-0 overflow-hidden">
                <div className="flex flex-col">
                  {[
                    { name: "About Us", href: "/about" },
                    { name: "Company Profile", href: "/company-profile" },
                  ].map((item, idx, arr) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-[15px] py-[9px] text-[14px] text-white hover:bg-[#f26b31] transition-all duration-200 ${idx < arr.length - 1 ? "border-b border-[#464646]" : ""
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Dropdown */}
            <div className="relative group">
              <button className="flex items-center text-[#f26b31] font-medium text-[18px] px-5 py-[30px] transition-colors duration-200 hover:text-[#f26b31] focus:outline-none cursor-pointer">
                <span>Products</span>
                <ChevronRight className="ml-1 h-[15px] w-[15px] p-0.5 text-[#f26b31] transition-transform duration-200 transform group-hover:rotate-90" />
              </button>
              <div className="absolute left-0 top-full w-[240px] bg-white/10 backdrop-blur-xl -webkit-backdrop-blur-xl rounded-lg border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] opacity-0 invisible translate-y-5 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50 py-0 overflow-hidden">
                <div className="flex flex-col">
                  {productLinks.map((item, idx) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-[15px] py-[10px] text-[15px] text-black hover:text-white font-medium hover:bg-[#f26b31] transition-all duration-200 ${idx < productLinks.length - 1 ? "border-b border-white/20" : ""
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>



            <Link
              href="/pricelist"
              className="text-[#f26b31] font-medium text-[18px] px-5 py-[30px] transition-colors duration-200 hover:text-[#f26b31]"
            >
              Pricelist
            </Link>
            <Link
              href="/contact"
              className="text-[#f26b31] font-medium text-[18px] px-5 py-[30px] transition-colors duration-200 hover:text-[#f26b31]"
            >
              Contact Us
            </Link>
          </nav>

          {/* Hamburger Menu Icon */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-[#f26b31] hover:bg-gray-200/50 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide-out */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#000] border-t border-white/20 z-50 shadow-xl">
          <div className="flex flex-col font-outfit uppercase py-2">
            <Link
              href="/"
              className="px-5 py-4 text-[14px] font-semibold text-white border-b border-white/10 hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {/* About Us Dropdown (Mobile) */}
            <div className="border-b border-white/10">
              <button
                onClick={() => toggleSubmenu("aboutUs")}
                className="w-full flex justify-between items-center px-5 py-4 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors uppercase cursor-pointer"
              >
                <span>About Us</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform duration-200 ${activeSubmenu === "aboutUs" ? "rotate-180" : ""
                    }`}
                />
              </button>
              {activeSubmenu === "aboutUs" && (
                <div className="bg-[#111111]/80 backdrop-blur-md pl-5 py-1">
                  {[
                    { name: "About Us", href: "/about" },
                    { name: "Company Profile", href: "/company-profile" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-5 py-3 text-xs text-white/80 hover:text-white hover:bg-white/10 uppercase transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Product Dropdown (Mobile) */}
            <div className="border-b border-white/10">
              <button
                onClick={() => toggleSubmenu("products")}
                className="w-full flex justify-between items-center px-5 py-4 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors uppercase cursor-pointer"
              >
                <span>Products</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform duration-200 ${activeSubmenu === "products" ? "rotate-180" : ""
                    }`}
                />
              </button>
              {activeSubmenu === "products" && (
                <div className="bg-white/10 backdrop-blur-xl border-y border-white/20 pl-5 py-1">
                  {productLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-5 py-3 text-xs text-white hover:bg-[#f26b31] uppercase transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>



            <Link
              href="/pricelist"
              className="px-5 py-4 text-[14px] font-semibold text-white border-b border-white/10 hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricelist
            </Link>
            <Link
              href="/contact"
              className="px-5 py-4 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
