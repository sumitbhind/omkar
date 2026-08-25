import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Roboto } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Ramdas Power Innovations | Authorized Schneider Electric Switchgear Distributor, Indore",
  description: "Ramdas Power Innovations (RPI) is the authorized distributor of Schneider Electric Low Voltage Switchgears in Indore, Madhya Pradesh.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${roboto.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
