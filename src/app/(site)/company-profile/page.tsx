import Link from "next/link";
import EnquiryBanner from "@/components/EnquiryBanner";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000";

const DEFAULTS = {
  heroTitle: "Company Profile",
  heroSubtitle: "Ramdas Power Innovations",
  overview: "Ramdas Power Innovations (RPI) is a trusted and professionally managed electrical solution provider based in Indore, Madhya Pradesh. As an Authorized Distributor of Schneider Electric Low Voltage Switchgears, we specialize in delivering high-quality, reliable, and energy-efficient electrical distribution products.",
  history: "",
  whyChooseUs: [] as string[],
  infrastructure: "",
  image: "",
  stats: [] as { label: string; value: string }[],
};

async function getCompanyProfile() {
  try {
    const res = await fetch(`${BACKEND}/api/cms/company-profile`, { cache: "no-store" });
    if (!res.ok) return DEFAULTS;
    const json = await res.json();
    return { ...DEFAULTS, ...json.data };
  } catch {
    return DEFAULTS;
  }
}

export const metadata = {
  title: "Company Profile | Ramdas Power Innovations",
  description: "Learn about Ramdas Power Innovations — an authorized distributor of Schneider Electric LV switchgear products in Indore, Madhya Pradesh.",
  keywords: "company profile, Ramdas Power Innovations, Schneider Electric distributor Indore, electrical solutions",
};

export default async function CompanyProfilePage() {
  const data = await getCompanyProfile();

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Breadcrumb Banner */}
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
              {data.heroTitle}
            </h1>
            {data.heroSubtitle && (
              <p className="text-[#f26b31] font-semibold text-lg mb-3">{data.heroSubtitle}</p>
            )}
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Link href="/" className="hover:text-[#f26b31] transition-colors">Home</Link>
              <span className="text-gray-500 font-bold text-xs">»»</span>
              <span className="text-gray-800 font-bold">Company Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start mb-16">
            <div className="flex-1 text-gray-700 leading-relaxed text-[15px] md:text-[16px]">

              {/* Overview */}
              {data.overview && (
                <>
                  <h2 className="text-3xl md:text-[40px] font-extrabold text-gray-900 font-outfit mb-4">
                    Company <span className="text-[#f26b31]">Overview</span>
                  </h2>
                  <p className="text-justify font-semibold text-gray-800 text-[16px] mb-10 whitespace-pre-line">
                    {data.overview}
                  </p>
                </>
              )}

              {/* History */}
              {data.history && (
                <>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-outfit mb-4">
                    Our <span className="text-[#f26b31]">History</span>
                  </h3>
                  <p className="text-justify mb-10 whitespace-pre-line text-gray-600">
                    {data.history}
                  </p>
                </>
              )}

              {/* Why Choose Us */}
              {data.whyChooseUs && data.whyChooseUs.length > 0 && (
                <>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-outfit mb-4">
                    Why <span className="text-[#f26b31]">Choose Us</span>
                  </h3>
                  <ul className="space-y-3 mb-10">
                    {(data.whyChooseUs as string[]).map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-600">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[#f26b31] shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Infrastructure */}
              {data.infrastructure && (
                <>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-outfit mb-4">
                    Infrastructure &amp; <span className="text-[#f26b31]">Facilities</span>
                  </h3>
                  <p className="text-justify mb-10 whitespace-pre-line text-gray-600">
                    {data.infrastructure}
                  </p>
                </>
              )}
            </div>

            {/* Right: Image */}
            {data.image && (
              <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 mx-auto">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.image}
                    alt={data.heroTitle}
                    className="w-full h-auto rounded-xl object-cover max-h-[500px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          {data.stats && (data.stats as { value: string; label: string }[]).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-100 pt-12 mt-4">
              {(data.stats as { value: string; label: string }[]).map((stat, i) => (
                <div
                  key={i}
                  className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-[#f26b31] mb-2 font-outfit">
                    {stat.value}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold font-inter">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <EnquiryBanner />
    </div>
  );
}
