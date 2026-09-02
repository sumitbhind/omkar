import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { staticProducts } from "@/data/products";

const BACKEND  = process.env.BACKEND_URL  || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ramdaspower.com";

interface Category    { _id: string; name: string; slug: string; description: string }
interface Group       { _id: string; name: string; slug: string; pageTitle: string }
interface PanelSection { _id: string; name: string; slug: string }
interface PanelItem   { _id: string; title: string; description: string }

async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${BACKEND}/api/categories/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === "success" ? json.data : null;
  } catch { return null; }
}

async function fetchGroups(categoryId: string): Promise<Group[]> {
  try {
    const res = await fetch(`${BACKEND}/api/product-groups?category=${categoryId}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function fetchPanelSection(slug: string): Promise<PanelSection | null> {
  try {
    const res = await fetch(`${BACKEND}/api/panel-sections`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    const list: PanelSection[] = json.data ?? [];
    return list.find((s) => s.slug === slug) ?? null;
  } catch { return null; }
}

async function fetchPanelItems(sectionSlug: string): Promise<PanelItem[]> {
  try {
    const res = await fetch(`${BACKEND}/api/panel-items?section=${sectionSlug}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

export async function generateMetadata(
  { params }: { params: Promise<{ categorySlug: string }> }
): Promise<Metadata> {
  const { categorySlug } = await params;

  if (staticProducts[categorySlug]) {
    const prod = staticProducts[categorySlug];
    return {
      title: prod.title,
      description: prod.seoDescription,
      keywords: prod.keywords,
      alternates: { canonical: `${SITE_URL}/${categorySlug}` },
      openGraph: {
        title: prod.title,
        description: prod.seoDescription,
        url: `${SITE_URL}/${categorySlug}`,
        images: [{ url: `${SITE_URL}${prod.bannerImage}`, alt: prod.name }],
      },
    };
  }

  const section = await fetchPanelSection(categorySlug);
  if (section) {
    return {
      title:       `${section.name} | Ramdas Power Innovations`,
      description: `Explore our ${section.name} range at Ramdas Power Innovations, Indore.`,
      alternates:  { canonical: `${SITE_URL}/${categorySlug}` },
    };
  }

  const category = await fetchCategory(categorySlug);
  if (!category) return { title: "Not Found | Ramdas Power Innovations" };

  const pageUrl    = `${SITE_URL}/${categorySlug}`;
  const description = category.description
    || `Explore Schneider Electric ${category.name} products at Ramdas Power Innovations, Indore. Authorized distributor in Madhya Pradesh.`;

  return {
    title:       `${category.name} | Ramdas Power Innovations`,
    description,
    alternates:  { canonical: pageUrl },
    openGraph: {
      title:    `${category.name} | Ramdas Power Innovations`,
      description,
      url:      pageUrl,
      siteName: "Ramdas Power Innovations",
      locale:   "en_IN",
      type:     "website",
    },
  };
}

export default async function CategoryPage(
  { params }: { params: Promise<{ categorySlug: string }> }
) {
  const { categorySlug } = await params;

  // ── Check Static Products first ─────────────────────────────────────────
  if (staticProducts[categorySlug]) {
    const prod = staticProducts[categorySlug];
    return (
      <div className="min-h-screen bg-white font-inter">
        {/* Product Banner */}
        <div className="relative overflow-hidden">
          <Image
            src={prod.bannerImage}
            alt={prod.name}
            width={1920}
            height={500}
            className="w-full block h-auto sm:h-[400px] md:h-[500px] object-cover object-center"
            style={{ width: "100%", height: "auto", maxHeight: "600px" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
          <div className="absolute inset-0 flex items-end z-10">
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-16 pb-8 sm:pb-[60px]">
              <h1 className="text-3xl sm:text-5xl md:text-[54px] font-extrabold text-white font-outfit mb-4 leading-tight shadow-sm drop-shadow-md">
                {prod.name}
              </h1>
              <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-white/90 drop-shadow">
                <Link href="/" className="hover:text-[#f26b31] transition-colors">Home</Link>
                <span className="text-white/60 font-bold text-xs">»»</span>
                <span className="text-white font-bold">{prod.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Content Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              
              {/* Left Column: Description */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111] font-outfit mb-6">
                  Overview
                </h2>
                <div className="w-16 h-1 bg-[#f26b31] rounded-full mb-6" />
                <p className="text-[#444] text-[16px] leading-[1.8] font-inter text-justify mb-8">
                  {prod.description}
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-[#f26b31] text-white px-8 py-3.5 rounded-md font-semibold text-[15px] tracking-wide hover:bg-[#d65a25] transition-colors shadow-md"
                >
                  Request a Quote
                </Link>
              </div>

              {/* Right Column: Features & Applications */}
              <div className="space-y-12">
                
                {/* Features */}
                <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-[#111] font-outfit mb-5">Key Features</h3>
                  <ul className="space-y-3">
                    {prod.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#f26b31]/10 flex items-center justify-center">
                          <svg className="w-3 h-3 text-[#f26b31]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        </div>
                        <span className="text-[#333] text-[15px] leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Applications */}
                <div className="bg-[#111] text-white p-8 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-white font-outfit mb-5">Ideal Applications</h3>
                  <ul className="space-y-3">
                    {prod.applications.map((app, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#f26b31] rounded-full"></div>
                        </div>
                        <span className="text-gray-300 text-[15px] leading-snug">{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
              
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Check panel section ─────────────────────────────────────────────
  const section = await fetchPanelSection(categorySlug);
  if (section) {
    const items = await fetchPanelItems(categorySlug);
    const words     = section.name.split(" ");
    const titleMain = words.slice(0, -1).join(" ");
    const titleLast = words.at(-1);

    return (
      <div className="min-h-screen bg-white font-inter">

        {/* Banner */}
        <div className="relative overflow-hidden">
          <Image
            src="/images/image-banner/about.png"
            alt=""
            aria-hidden="true"
            width={1920}
            height={420}
            className="w-full block h-auto sm:h-[300px] md:h-[360px] lg:h-[420px] sm:object-cover sm:object-center"
            style={{ width: "100%", height: "auto" }}
            priority
          />
          <div className="absolute inset-0 bg-white/55" />
          <div className="absolute inset-0 flex items-end z-10">
            <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-16 pb-4 sm:pb-[50px]">
              <h1 className="text-2xl sm:text-4xl md:text-[42px] font-bold text-gray-900 font-outfit mb-3 leading-tight">
                {titleMain && <span>{titleMain} </span>}
                <span className="text-[#f26b31]">{titleLast}</span>
              </h1>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Link href="/" className="hover:text-[#f26b31] transition-colors">Home</Link>
                <span className="text-gray-500 font-bold text-xs">»»</span>
                <span className="text-gray-800 font-bold">{section.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <section className="py-14 md:py-20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16">
            {items.length === 0 ? (
              <p className="text-center text-gray-400 py-16 text-lg">No items available yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:bg-[bisque] group"
                  >
                    <div className="p-6 text-center h-[200px] flex flex-col justify-center gap-4">
                      <h3 className="text-[20px] font-semibold text-[#111] group-hover:text-black font-outfit leading-snug">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-[14px] text-[#555] group-hover:text-black leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    );
  }

  // ── Check Schneider category ──────────────────────────────────────────────
  const category = await fetchCategory(categorySlug);
  if (!category) notFound();

  const groups = await fetchGroups(category._id);

  const words     = category.name.split(" ");
  const titleMain = words.slice(0, -1).join(" ");
  const titleLast = words.at(-1);

  return (
    <div className="min-h-screen bg-white font-inter">

      {/* Banner */}
      <div className="relative overflow-hidden">
        <Image
          src="/images/image-banner/about.png"
          alt=""
          aria-hidden="true"
          width={1920}
          height={420}
          className="w-full block h-auto sm:h-[300px] md:h-[360px] lg:h-[420px] sm:object-cover sm:object-center"
          style={{ width: "100%", height: "auto" }}
          priority
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 flex items-end z-10">
          <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-16 pb-4 sm:pb-[50px]">
            <h1 className="text-2xl sm:text-4xl md:text-[42px] font-bold text-gray-900 font-outfit mb-3 leading-tight">
              {titleMain && <span>{titleMain} </span>}
              <span className="text-[#f26b31]">{titleLast}</span>
            </h1>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Link href="/" className="hover:text-[#f26b31] transition-colors">Home</Link>
              <span className="text-gray-500 font-bold text-xs">»»</span>
              <span className="text-gray-800 font-bold">{category.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16">
          {groups.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-lg">
              No products available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups.map((group) => (
                <div
                  key={group._id}
                  className="bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] overflow-hidden transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="px-6 py-8 flex flex-col items-center justify-center text-center min-h-[125px] gap-6">
                    <h3 className="text-[20px] font-semibold text-[#111] font-outfit leading-snug">
                      {group.pageTitle || group.name}
                    </h3>
                    <Link
                      href={`/${categorySlug}/${group.slug}`}
                      className="px-6 py-2 bg-[#FF6A00] text-white text-sm rounded-md hover:bg-[#e65c00] transition-colors duration-200"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
