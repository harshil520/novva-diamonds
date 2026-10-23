import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/config";
import { SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import SmoothScroll from "@/components/providers/SmoothScroll";
import ToastProvider from "@/components/providers/ToastProvider";
import UIProvider from "@/components/providers/UIProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConciergeButton from "@/components/layout/ConciergeButton";
import Preloader from "@/components/layout/Preloader";
import RouteProgress from "@/components/layout/RouteProgress";

// Titles
const display = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Body copy, labels and details
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Novva Diamonds | Certified Loose Diamonds from Surat, India",
    template: "%s | Novva Diamonds",
  },
  description:
    "Buy GIA and IGI certified natural and lab-grown loose diamonds direct from the Surat Diamond Bourse. 1 ct and above, with fully insured worldwide shipping.",
  applicationName: siteConfig.brand.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.brand.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f4ef",
  colorScheme: "light",
};

// Runs before first paint: returning visitors in this session skip the intro curtain.
const introScript = `try{if(sessionStorage.getItem("novva_intro")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-seen","")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="flex min-h-screen flex-col bg-ivory text-ink antialiased" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to content
        </a>
        <ToastProvider>
          <SmoothScroll>
            <UIProvider>
              <Preloader />
              <Suspense fallback={null}>
                <RouteProgress />
              </Suspense>
              <Header />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
              <ConciergeButton />
            </UIProvider>
          </SmoothScroll>
        </ToastProvider>
      </body>
    </html>
  );
}
