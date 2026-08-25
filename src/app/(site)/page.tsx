import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import AboutUs from "@/components/AboutUs";
import WhyChooseUs from "@/components/WhyChooseUs";
import EnquiryBanner from "@/components/EnquiryBanner";
import ContactSection from "@/components/ContactSection";

// Code-split Swiper-heavy component — it's below the fold
const ProductPortfolio = dynamic(() => import("@/components/ProductPortfolio"));

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

async function getCategories() {
  return [
    { _id: "1", name: "Cello Tape", slug: "cello-tape", description: "Strong adhesion transparent and brown BOPP tapes for secure carton sealing." },
    { _id: "2", name: "Printed Tape", slug: "printed-tape", description: "Custom printed tapes with your brand logo for secure and branded packaging." },
    { _id: "3", name: "Stretch Film", slug: "stretch-film", description: "High-stretch premium quality wrapping film for pallet load stability." },
    { _id: "4", name: "Bubble Roll", slug: "bubble-roll", description: "Superior cushioning air bubble rolls for fragile item protection." },
    { _id: "5", name: "Paper Roll", slug: "paper-roll", description: "Eco-friendly kraft paper rolls for wrapping and void filling." },
    { _id: "6", name: "Corrugated Sheets", slug: "corrugated-sheets", description: "Strong corrugated sheets for layer pads and structural support." },
    { _id: "7", name: "Corrugated Boxes", slug: "corrugated-boxes", description: "Durable multi-ply corrugated boxes for all your shipping needs." }
  ];
}

async function getHeroBanners() {
  try {
    const res = await fetch(`${BACKEND}/api/banners?position=hero`, { next: { revalidate: 60 } });
    const json = await res.json();
    if (json.status === "success" && json.data?.length > 0) return json.data;
    return [];
  } catch {
    return [];
  }
}

async function getHomepageCms() {
  try {
    const res = await fetch(`${BACKEND}/api/cms/homepage`, { next: { revalidate: 60 } });
    const json = await res.json();
    return (json.data ?? {}) as Record<string, string>;
  } catch {
    return {};
  }
}

async function getSettings() {
  try {
    const res = await fetch(`${BACKEND}/api/settings`, { next: { revalidate: 60 } });
    const json = await res.json();
    return (json.data ?? {}) as Record<string, string>;
  } catch {
    return {};
  }
}

export default async function Home() {
  const [categories, heroBanners, cmsData, settings] = await Promise.all([
    getCategories(),
    getHeroBanners(),
    getHomepageCms(),
    getSettings(),
  ]);

  return (
    <>
      <Hero initialSlides={heroBanners.length > 0 ? heroBanners : undefined} />
      <AboutUs
        initialData={{
          heroTitle: cmsData.heroTitle,
          heroSubtitle: cmsData.heroSubtitle,
          intro: cmsData.intro,
          description: cmsData.description,
          image: cmsData.image,
        }}
      />
      <WhyChooseUs />
      <ProductPortfolio categories={categories} />
      <ContactSection initialMapUrl={settings.mapEmbedUrl} />
      <EnquiryBanner />
    </>
  );
}
