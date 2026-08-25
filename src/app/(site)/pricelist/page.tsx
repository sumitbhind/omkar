import Link from "next/link";
import Image from "next/image";
import { FileText } from "lucide-react";
import EnquiryBanner from "@/components/EnquiryBanner";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000";

interface PricelistItem {
  _id: string;
  title: string;
  brand: string;
  pdfUrl: string;
  thumbnailUrl: string;
  month: string;
  year: string;
}

async function getPricelist(): Promise<PricelistItem[]> {
  try {
    const res = await fetch(`${BACKEND}/api/pricelist`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Pricelist | Ramdas Power Innovations",
  description: "Download the latest price lists from Ramdas Power Innovations. Stay updated with competitive product pricing.",
  keywords: "price list, pricelist, Ramdas Power Innovations, download pricelist, switchgear pricing Indore",
};

export default async function PricelistPage() {
  const items = await getPricelist();

  return (
    <div className="min-h-screen bg-[#f9f9fb] font-inter">
      {/* Breadcrumb Banner */}
      <div className="relative overflow-hidden">
        <img
          src="/images/image-banner/pricelist.png"
          alt=""
          aria-hidden="true"
          className="w-full block h-auto sm:h-[300px] md:h-[360px] lg:h-[420px] sm:object-cover sm:object-center"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 flex items-end z-10">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pb-4 sm:pb-[50px] font-outfit">
            <h1 className="text-2xl sm:text-4xl md:text-[42px] font-bold text-gray-900 font-outfit mb-3 leading-tight">
              Price<span className="text-[#f26b31]">list</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700">
              <Link href="/" className="hover:text-[#f26b31] transition-colors">Home</Link>
              <span className="text-gray-500 font-bold text-xs">»»</span>
              <span className="text-gray-800 font-bold">Pricelist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto h-16 w-16 text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-500 font-outfit mb-2">No Pricelists Available</h2>
            <p className="text-gray-400">Please check back later or contact us for pricing information.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-[10px] overflow-hidden border border-gray-200 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                {/* Thumbnail / Preview Image */}
                {item.thumbnailUrl ? (
                  <div className="w-full overflow-hidden">
                    <Image
                      src={item.thumbnailUrl}
                      alt={`${item.title} preview`}
                      width={600}
                      height={400}
                      className="w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full bg-red-50 flex items-center justify-center py-12">
                    <FileText className="h-24 w-24 text-red-300" />
                  </div>
                )}

                {/* Card Body */}
                <div className="p-6 text-center flex flex-col justify-between flex-grow font-outfit">
                  <div className="mb-6">
                    {item.brand && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold mb-3 inline-block">
                        {item.brand}
                      </span>
                    )}
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-1 leading-tight">
                      {item.title}
                    </h3>
                    {(item.month || item.year) && (
                      <p className="text-sm text-gray-500 mt-2">
                        {[item.month, item.year].filter(Boolean).join(" ")}
                      </p>
                    )}
                  </div>

                  {item.pdfUrl ? (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-center rounded-[6px] bg-[#198754] hover:bg-[#157347] text-white px-8 py-3.5 font-semibold text-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 italic">PDF not available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EnquiryBanner />
    </div>
  );
}

