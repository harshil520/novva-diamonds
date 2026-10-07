export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rate
  format: (amountInUSD: number) => string;
}

export const siteConfig = {
  brand: {
    name: "Novva Diamonds",
    tagline: "Certified Brilliance. Delivered Worldwide.",
    origin: "Surat, Gujarat, India",
    address: "Surat Diamond Bourse, Khajod, Surat, Gujarat 395007, India",
    description:
      "Direct-from-source certified natural and lab-grown loose diamond exporter based in Surat, Gujarat. Serving international private jewelers, bespoke designers, and discerning private clients worldwide.",
  },

  contact: {
    phone: "+91 98251 00000",
    whatsappNumber: "+919825100000", // International format without symbols
    whatsappDisplay: "+91 98251 00000",
    email: "concierge@novvadiamonds.com",
    workingHours: "Monday – Saturday: 09:30 – 19:30 IST (GMT+5:30)",
    averageResponseTime: "< 15 minutes during trading hours",
  },

  features: {
    showJewelry: false, // Flagged for future finished jewelry expansion
    showLanguageSelector: false,
    enable360Loupe: true,
  },

  shipping: {
    insuredCourier: "Brink's / Malca-Amit / Ferrari Express Global Armored Logistics",
    leadTimeDays: "3 to 5 business days worldwide door-to-door with tamper-evident seal",
    markets: [
      { name: "United States", code: "US", hub: "New York / Los Angeles" },
      { name: "Canada", code: "CA", hub: "Toronto / Vancouver" },
      { name: "Australia", code: "AU", hub: "Sydney / Melbourne" },
      { name: "Europe & UK", code: "EU", hub: "Antwerp / London / Zurich" },
      { name: "Kazakhstan & CIS", code: "KZ", hub: "Almaty / Astana" },
      { name: "India (Domestic)", code: "IN", hub: "Surat / Mumbai BDB" },
    ],
  },

  currencies: {
    USD: {
      code: "USD",
      symbol: "$",
      name: "US Dollar",
      rateToUSD: 1.0,
      format: (usd: number) => `$${Math.round(usd).toLocaleString("en-US")}`,
    },
    INR: {
      code: "INR",
      symbol: "₹",
      name: "Indian Rupee",
      rateToUSD: 86.8,
      format: (usd: number) => `₹${Math.round(usd * 86.8).toLocaleString("en-IN")}`,
    },
    EUR: {
      code: "EUR",
      symbol: "€",
      name: "Euro",
      rateToUSD: 0.94,
      format: (usd: number) => `€${Math.round(usd * 0.94).toLocaleString("de-DE")}`,
    },
    AUD: {
      code: "AUD",
      symbol: "A$",
      name: "Australian Dollar",
      rateToUSD: 1.55,
      format: (usd: number) => `A$${Math.round(usd * 1.55).toLocaleString("en-AU")}`,
    },
    CAD: {
      code: "CAD",
      symbol: "C$",
      name: "Canadian Dollar",
      rateToUSD: 1.42,
      format: (usd: number) => `C$${Math.round(usd * 1.42).toLocaleString("en-CA")}`,
    },
    KZT: {
      code: "KZT",
      symbol: "₸",
      name: "Kazakhstani Tenge",
      rateToUSD: 495.0,
      format: (usd: number) => `₸${Math.round(usd * 495.0).toLocaleString("ru-KZ")}`,
    },
  } as Record<string, CurrencyConfig>,

  defaultCurrency: "USD",

  web3forms: {
    endpoint: "https://api.web3forms.com/submit",
    defaultAccessKey: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "",
  },
};
