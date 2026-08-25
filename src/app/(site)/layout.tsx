import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSocialBar from "@/components/FloatingSocialBar";
import PopupDisplay from "@/components/PopupDisplay";
import type { SiteSettings } from "@/lib/types";
import Script from "next/script";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

const DEFAULT_SETTINGS: SiteSettings = {
  businessName: "Omkar MFG Traders",
  tagline: "",
  phone: "+91 9691708989",
  whatsapp: "919691708989",
  email: "",
  address: "B-72, Om Residency, Tansen Nagar",
  city: "Gwalior, Madhya Pradesh (M.P.)",
  state: "Madhya Pradesh",
  pincode: "474002",
  instagram: "",
  facebook: "",
  twitter: "",
  youtube: "",
  linkedin: "",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.0282384149446!2d78.1761250746619!3d26.228271989170217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c70014f49549%3A0x6a7bececea3dbcec!2sOm%20Residency!5e0!3m2!1sen!2sin!4v1785324555204!5m2!1sen!2sin",
};

async function getNavCategories(): Promise<{ _id: string; name: string; slug: string }[]> {
  try {
    const res = await fetch(`${BACKEND}/api/categories`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getPanelSections(): Promise<{ _id: string; name: string; slug: string }[]> {
  try {
    const res = await fetch(`${BACKEND}/api/panel-sections`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.data ?? [];
  } catch { return []; }
}

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${BACKEND}/api/settings`, { next: { revalidate: 60 } });
    const json = await res.json();
    return { ...DEFAULT_SETTINGS, ...(json.data ?? {}) };
  } catch { return DEFAULT_SETTINGS; }
}

async function getAnalyticsConfig(): Promise<{
  ga4MeasurementId?: string;
  gtmContainerId?: string;
  fbPixelId?: string;
  hotjarSiteId?: string;
  clarityProjectId?: string;
  enableAnalytics?: boolean;
  enableGtm?: boolean;
  enableFbPixel?: boolean;
} | null> {
  try {
    const res = await fetch(`${BACKEND}/api/cms/analytics-config`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch { return null; }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, panelSections, settings, analyticsConfig] = await Promise.all([
    getNavCategories(),
    getPanelSections(),
    getSiteSettings(),
    getAnalyticsConfig(),
  ]);

  const showAnalytics = analyticsConfig?.enableAnalytics !== false;
  const ga4Id = analyticsConfig?.ga4MeasurementId || "G-JJ0LQ5C8LK";
  
  const showGtm = !!analyticsConfig?.enableGtm;
  const gtmId = analyticsConfig?.gtmContainerId;

  const showFbPixel = !!analyticsConfig?.enableFbPixel;
  const fbPixelId = analyticsConfig?.fbPixelId;

  const hotjarId = analyticsConfig?.hotjarSiteId;
  const clarityId = analyticsConfig?.clarityProjectId;

  return (
    <div className="font-inter min-h-screen flex flex-col justify-between">
      {/* ─── Google Analytics 4 (GA4) ─── */}
      {showAnalytics && ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `}
          </Script>
        </>
      )}

      {/* ─── Google Tag Manager (GTM) ─── */}
      {showGtm && gtmId && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* ─── Facebook Pixel ─── */}
      {showFbPixel && fbPixelId && (
        <>
          <Script id="fb-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {/* ─── Hotjar ─── */}
      {hotjarId && (
        <Script id="hotjar" strategy="lazyOnload">
          {`
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${hotjarId},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}

      {/* ─── Microsoft Clarity ─── */}
      {clarityId && (
        <Script id="clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      )}

      <Header categories={categories} panelSections={panelSections} />
      <main className="flex-grow">{children}</main>
      <PopupDisplay />
      <FloatingSocialBar settings={settings} />
      <Footer settings={settings} />
    </div>
  );
}
