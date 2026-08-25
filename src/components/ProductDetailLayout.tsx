import Image from "next/image";
import Link from "next/link";

interface Badge {
  label: string;
  value?: string;
}

interface Product {
  name: string;
  image: string;
  imageAlt: string;
  features: string[];
  applications: string[];
  badges: Badge[];
}

interface Breadcrumb {
  label: string;
  href: string;
}

interface ProductDetailLayoutProps {
  pageTitle: string;
  breadcrumbs: Breadcrumb[];
  products: Product[];
  phone?: string;
  whatsapp?: string;
  email?: string;
}

function IconCircle() {
  return (
    <div className="w-[45px] h-[45px] min-w-[45px] bg-[#3DAE4C] text-white rounded-full flex items-center justify-center mr-3 font-bold text-sm">
      ✓
    </div>
  );
}

export default function ProductDetailLayout({
  pageTitle,
  breadcrumbs,
  products,
  phone = "",
  whatsapp = "",
  email = "",
}: ProductDetailLayoutProps) {
  return (
    <div className="min-h-screen bg-white font-inter">

      {/* ── Breadcrumb Banner ── */}
      <div className="relative overflow-hidden">
        <img
          src="/images/image-banner/about.png"
          alt=""
          aria-hidden="true"
          className="w-full block h-auto sm:h-[300px] md:h-[360px] lg:h-[420px] sm:object-cover sm:object-center"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 flex items-end z-10">
          <div className="w-full max-w-[1600px] mx-auto
                          px-4 sm:px-6 lg:px-16
                          pb-4 sm:pb-10 md:pb-14 lg:pb-[60px]">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[42px]
                           font-bold text-gray-900 font-outfit mb-2 sm:mb-3 leading-tight">
              {pageTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2
                            text-xs sm:text-sm font-semibold text-gray-700">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5 sm:gap-2">
                  {i > 0 && <span className="text-gray-500 text-xs">»»</span>}
                  {i < breadcrumbs.length - 1 ? (
                    <Link href={crumb.href} className="hover:text-[#f26b31] transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-800 font-bold">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <section className="py-10 md:py-16 bg-[#f8f9fb]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 space-y-8">
          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              Products coming soon. Please check back later.
            </div>
          )}
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-white rounded-[10px] p-6 md:p-8 shadow-[rgba(60,64,67,0.3)_0px_1px_2px_0px,rgba(60,64,67,0.15)_0px_2px_6px_2px]"
            >
              <div className="flex flex-col md:flex-row gap-8">

                {/* Left: Image + Enquire Now */}
                <div className="md:w-[33%] flex flex-col items-center text-center">
                  <div className="w-full rounded-[10px] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      width={400}
                      height={280}
                      className="w-full h-[220px] object-contain rounded-[10px] bg-white p-2"
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-2 w-full">
                    {whatsapp ? (
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=Hi, I'm interested in ${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-2 bg-[#FF6A00] text-white text-sm font-medium rounded-[10px] hover:bg-[#e65c00] transition-colors duration-200"
                      >
                        Enquire Now
                      </a>
                    ) : (
                      <Link
                        href="/contact"
                        className="inline-block px-6 py-2 bg-[#FF6A00] text-white text-sm font-medium rounded-[10px] hover:bg-[#e65c00] transition-colors duration-200"
                      >
                        Enquire Now
                      </Link>
                    )}
                    {phone && (
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="text-xs text-gray-500 hover:text-[#FF6A00] transition-colors"
                      >
                        📞 {phone}
                      </a>
                    )}
                    {email && (
                      <a
                        href={`mailto:${email}?subject=Enquiry: ${encodeURIComponent(product.name)}`}
                        className="text-xs text-gray-500 hover:text-[#FF6A00] transition-colors"
                      >
                        ✉ {email}
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: Content */}
                <div className="md:w-[67%]">
                  <h2 className="text-xl md:text-2xl font-bold text-[#f26b31] font-outfit border-b border-gray-200 pb-3 mb-5">
                    {product.name}
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-6">

                    {/* Features + Applications */}
                    <div className={product.badges.length > 0 ? "flex-1" : "w-full"}>
                      <ul className="space-y-2 text-sm text-gray-700 mb-5">
                        {product.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#3DAE4C] mt-0.5 text-base leading-none">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <h5 className="font-semibold text-gray-800 mb-3">Application</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        {product.applications.map((app, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span className="text-[#3DAE4C] text-base leading-none mt-0.5">✓</span>
                            <span>{app}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Badges */}
                    {product.badges.length > 0 && (
                      <div className="sm:w-[42%] space-y-4">
                        {product.badges.map((badge, i) => (
                          <div key={i} className="flex items-start">
                            <IconCircle />
                            <div className="text-sm text-gray-700 leading-snug">
                              <strong>{badge.label}</strong>
                              {badge.value && (
                                <>
                                  <br />
                                  <span>{badge.value}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
