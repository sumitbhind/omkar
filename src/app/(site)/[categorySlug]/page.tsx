import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

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

  // ── Check panel section first ─────────────────────────────────────────────
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
