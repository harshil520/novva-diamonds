export const siteConfig = {
  brand: {
    name: "Novva Diamonds",
    tagline: "Certified diamonds from Surat, shipped worldwide.",
    origin: "Surat, Gujarat, India",
    address: "Surat Diamond Bourse, Khajod, Surat, Gujarat 395007, India",
    description:
      "Certified natural and lab-grown loose diamonds from Surat, India. GIA and IGI certified, with insured worldwide shipping.",
  },

  contact: {
    phone: "+91 72111 74478",
    whatsappNumber: "+917211174478", // International format without symbols
    whatsappDisplay: "+91 72111 74478",
    email: "concierge@novvadiamonds.com",
    workingHours: "Mon – Sat, 9:30 am – 7:30 pm IST",
    averageResponseTime: "Usually within 15 minutes",
  },

  features: {
    showJewelry: false, // Flagged for future finished jewelry expansion
    showLanguageSelector: false,
    enable360Loupe: true,
  },

  shipping: {
    insuredCourier: "Brink's, Malca-Amit or Ferrari Express",
    leadTimeDays: "3 to 5 business days",
    markets: [
      { name: "United States", code: "US", hub: "New York / Los Angeles" },
      { name: "Canada", code: "CA", hub: "Toronto / Vancouver" },
      { name: "Australia", code: "AU", hub: "Sydney / Melbourne" },
      { name: "Europe & UK", code: "EU", hub: "Antwerp / London / Zurich" },
      { name: "Kazakhstan & CIS", code: "KZ", hub: "Almaty / Astana" },
      { name: "India", code: "IN", hub: "Surat / Mumbai" },
    ],
  },

  web3forms: {
    endpoint: "https://api.web3forms.com/submit",
    defaultAccessKey: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "",
  },
};
