import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailLayout from "@/components/ProductDetailLayout";

const BACKEND  = process.env.BACKEND_URL  || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ramdaspower.com";

interface Product {
  _id: string;
  name: string;
  image: string;
  imageAlt: string;
  features: string[];
  applications: string[];
  badges: { label: string; value?: string }[];
}

interface PageData {
  pageTitle: string;
  category: { name: string; slug: string };
  group:    { name: string; slug: string };
  data:     Product[];
}

async function fetchPageData(categorySlug: string, groupSlug: string): Promise<PageData | null> {
  try {
    const res = await fetch(
      `${BACKEND}/api/products/${categorySlug}/${groupSlug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === "success" ? (json as PageData) : null;
  } catch {
    return null;
  }
}

async function fetchSettings(): Promise<{ phone: string; whatsapp: string; email: string }> {
  try {
    const res = await fetch(`${BACKEND}/api/settings`, { cache: "no-store" });
    const json = await res.json();
    return {
      phone:     json.data?.phone     || "",
      whatsapp:  json.data?.whatsapp  || "",
      email:     json.data?.email     || "",
    };
  } catch {
    return { phone: "", whatsapp: "", email: "" };
  }
}

// ── SEO Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ categorySlug: string; groupSlug: string }> }
): Promise<Metadata> {
  const { categorySlug, groupSlug } = await params;
  const data = await fetchPageData(categorySlug, groupSlug);
  if (!data) return { title: "Product Not Found | Ramdas Power Innovations" };

  const { pageTitle, category, data: products } = data;
  const pageUrl = `${SITE_URL}/${categorySlug}/${groupSlug}`;

  // Build description from first product's features
  const firstProduct = products[0];
  const featureSnippet = firstProduct?.features?.slice(0, 2).join(". ") ?? "";
  const description = `Explore ${pageTitle} products by Schneider Electric at Ramdas Power Innovations, Indore. ${featureSnippet}. Authorized Schneider Electric distributor in Madhya Pradesh.`;

  // Keywords from product names + category
  const productNames = products.map((p) => p.name).join(", ");
  const keywords = `${pageTitle}, Schneider Electric ${pageTitle}, ${productNames}, ${category.name}, Ramdas Power Innovations, Indore, Madhya Pradesh`;

  return {
    title:       `${pageTitle} | Ramdas Power Innovations`,
    description: description.slice(0, 160),
    keywords,
    alternates:  { canonical: pageUrl },
    openGraph: {
      title:       `${pageTitle} | Ramdas Power Innovations`,
      description: description.slice(0, 160),
      url:         pageUrl,
      siteName:    "Ramdas Power Innovations",
      locale:      "en_IN",
      type:        "website",
      images: firstProduct?.image
        ? [{ url: firstProduct.image.startsWith("http") ? firstProduct.image : `${SITE_URL}${firstProduct.image}`, alt: firstProduct.imageAlt || pageTitle }]
        : [{ url: `${SITE_URL}/images/image-banner/about.png`, alt: "Ramdas Power Innovations" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${pageTitle} | Ramdas Power Innovations`,
      description: description.slice(0, 160),
    },
  };
}

// ── JSON-LD structured data ───────────────────────────────────────────────────
function buildJsonLd(data: PageData, categorySlug: string, groupSlug: string) {
  const pageUrl = `${SITE_URL}/${categorySlug}/${groupSlug}`;

  const itemListElements = data.data.map((product, i) => ({
    "@type":    "ListItem",
    position:  i + 1,
    name:      product.name,
    description: product.features.slice(0, 3).join(". "),
    ...(product.image && {
      image: product.image.startsWith("http") ? product.image : `${SITE_URL}${product.image}`,
    }),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type":       "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",                  item: SITE_URL },
          { "@type": "ListItem", position: 2, name: data.category.name,      item: `${SITE_URL}/${data.category.slug}` },
          { "@type": "ListItem", position: 3, name: data.pageTitle,           item: pageUrl },
        ],
      },
      {
        "@type":           "ItemList",
        name:              `${data.pageTitle} Products`,
        description:       `Schneider Electric ${data.pageTitle} products available at Ramdas Power Innovations, Indore.`,
        url:               pageUrl,
        numberOfItems:     data.data.length,
        itemListElement:   itemListElements,
      },
      {
        "@type":        "Organization",
        name:           "Ramdas Power Innovations",
        url:            SITE_URL,
        address: {
          "@type":           "PostalAddress",
          addressLocality:   "Indore",
          addressRegion:     "Madhya Pradesh",
          addressCountry:    "IN",
        },
      },
    ],
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function ProductGroupPage(
  { params }: { params: Promise<{ categorySlug: string; groupSlug: string }> }
) {
  const { categorySlug, groupSlug } = await params;
  const [data, settings] = await Promise.all([
    fetchPageData(categorySlug, groupSlug),
    fetchSettings(),
  ]);
  if (!data) notFound();

  const breadcrumbs = [
    { label: "Home",             href: "/" },
    { label: data.category.name, href: `/${data.category.slug}` },
    { label: data.pageTitle,     href: "#" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(data, categorySlug, groupSlug)) }}
      />
      <ProductDetailLayout
        pageTitle={data.pageTitle}
        breadcrumbs={breadcrumbs}
        products={data.data}
        phone={settings.phone}
        whatsapp={settings.whatsapp}
        email={settings.email}
      />
    </>
  );
}
