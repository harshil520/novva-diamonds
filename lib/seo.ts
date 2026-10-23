import type { Metadata } from "next";
import { siteConfig } from "@/config/config";
import type { Diamond } from "@/types/diamond";

// Canonical origin for metadata, sitemap and structured data. Set NEXT_PUBLIC_SITE_URL per environment.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://novvadiamonds.com").replace(/\/+$/, "");

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Per-page title, description, self-canonical and matching Open Graph / Twitter tags. */
export function pageMetadata({ title, description, path, absoluteTitle = false }: { title: string; description: string; path: string; absoluteTitle?: boolean }): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.brand.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, type: "website", siteName: siteConfig.brand.name, locale: "en_US" },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}

export function originLabel(d: Diamond) {
  return d.origin === "Lab-Grown" ? "Lab-Grown" : "Natural";
}

/** "1.01 ct Round Natural Diamond, D VVS1" */
export function diamondName(d: Diamond) {
  return `${d.carat.toFixed(2)} ct ${d.shape} ${originLabel(d)} Diamond, ${d.color} ${d.clarity}`;
}

export function diamondDescription(d: Diamond) {
  return `${d.carat.toFixed(2)} carat ${d.shape.toLowerCase()} ${originLabel(d).toLowerCase()} diamond: ${d.color} colour, ${d.clarity} clarity, ${d.cut} cut. ${d.certification.laboratory} report ${d.certification.certificateNumber}. Insured worldwide shipping from Surat, India.`;
}

export function organizationJsonLd() {
  return {
    "@type": ["Organization", "JewelryStore"],
    "@id": ORG_ID,
    name: siteConfig.brand.name,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    image: absoluteUrl("/opengraph-image"),
    description: siteConfig.brand.description,
    slogan: siteConfig.brand.tagline,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Surat Diamond Bourse, Khajod",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      postalCode: "395007",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "19:30",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      availableLanguage: "English",
    },
    areaServed: siteConfig.shipping.markets.map((m) => m.name),
    paymentAccepted: "Bank Wire, RTGS, NEFT",
    knowsAbout: [
      "Loose diamonds",
      "Natural diamonds",
      "Lab-grown diamonds",
      "GIA diamond grading reports",
      "IGI diamond grading reports",
      "The 4Cs of diamonds",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.brand.name,
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function diamondJsonLd(d: Diamond) {
  const url = absoluteUrl(`/diamonds/${d.id}`);
  const prop = (name: string, value: string | number) => ({ "@type": "PropertyValue", name, value });
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: diamondName(d),
    description: d.description ? `${d.description} ${diamondDescription(d)}` : diamondDescription(d),
    sku: d.id,
    url,
    image: d.images.map((src) => absoluteUrl(src)),
    brand: { "@type": "Brand", name: siteConfig.brand.name },
    category: "Jewelry > Loose Diamonds",
    material: "Diamond",
    additionalProperty: [
      prop("Shape", d.shape),
      prop("Origin", originLabel(d)),
      prop("Carat weight", d.carat),
      prop("Colour grade", d.color),
      prop("Clarity grade", d.clarity),
      prop("Cut grade", d.cut),
      prop("Polish", d.polish || "Excellent"),
      prop("Symmetry", d.symmetry || "Excellent"),
      prop("Fluorescence", d.fluorescence || "None"),
      prop("Measurements (mm)", `${d.dimensions.length} x ${d.dimensions.width} x ${d.dimensions.depth}`),
      prop("Grading laboratory", d.certification.laboratory),
      prop("Report number", d.certification.certificateNumber),
    ],
    ...(d.certification.verificationUrl && { subjectOf: { "@type": "WebPage", name: `${d.certification.laboratory} report ${d.certification.certificateNumber}`, url: d.certification.verificationUrl } }),
  };
}

export function articleJsonLd({ headline, description, path, datePublished, dateModified }: { headline: string; description?: string; path: string; datePublished: string; dateModified?: string }) {
  return {
    "@type": "Article",
    headline,
    ...(description && { description }),
    mainEntityOfPage: absoluteUrl(path),
    image: absoluteUrl("/opengraph-image"),
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
