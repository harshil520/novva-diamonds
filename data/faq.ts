export interface FAQItem {
  id: string;
  category: "shipping" | "certification" | "bourse";
  question: string;
  answer: string;
  keyHighlight?: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "shipping-insurance",
    category: "shipping",
    question: "How is international shipping handled, and is my shipment 100% insured?",
    answer:
      "Every diamond dispatched by Novva Diamonds travels via licensed armored couriers — Brink’s Global Services, Malca-Amit, or Ferrari Express. Shipments are covered by 100% comprehensive CIF (Cost, Insurance, Freight) insurance until the package is physically signed for and handed to you or your designated custodian. If any transit anomaly occurs, you are fully indemnified.",
    keyHighlight: "100% Insured Door-to-Door via Brink’s & Malca-Amit",
  },
  {
    id: "shipping-timelines",
    category: "shipping",
    question: "What are the typical transit times to the United States, Europe, Australia, and worldwide?",
    answer:
      "Following customs inspection and international export clearance at our Surat facility, deliveries typically arrive within 3 to 5 business days to major international financial hubs (New York, Los Angeles, London, Antwerp, Dubai, Sydney, Toronto). You receive real-time armored tracking credentials upon airport tarmac handover.",
    keyHighlight: "3–5 Business Days Global Express Delivery",
  },
  {
    id: "shipping-customs",
    category: "shipping",
    question: "Who prepares the customs clearance and Kimberley Process paperwork?",
    answer:
      "Our compliance desk generates all required regulatory paperwork before physical dispatch, including official commercial proforma invoices, Kimberley Process Certification Scheme (KPCS) warrants, and harmonized tariff code filings. This ensures hassle-free entry with your local customs authority.",
    keyHighlight: "Compliant KPCS & International Customs Clearance",
  },
  {
    id: "cert-verification",
    category: "certification",
    question: "How do I independently verify the GIA or IGI grading report and laser inscription?",
    answer:
      "Every diamond in our inventory carries a genuine grading dossier from either the Gemological Institute of America (GIA) or the International Gemological Institute (IGI). The microscopic certificate number is laser-inscribed directly on the diamond’s girdle. We provide 40x macro digital loupe footage of the inscription, and you can cross-reference the report number immediately on the official GIA or IGI online report check portals.",
    keyHighlight: "Microscopic Girdle Laser Inscription & Online Database Matching",
  },
  {
    id: "cert-natural-lab",
    category: "certification",
    question: "Are natural and lab-grown diamonds strictly separated?",
    answer:
      "Yes, with absolute scientific rigor. We enforce a zero-contamination policy. Every parcel and single stone is spectroscopically tested using multi-spectral UV and photoluminescence devices before vault intake. Natural diamonds and lab-grown CVD/HPHT diamonds are cataloged in segregated databases and carry distinct laboratory certifications.",
    keyHighlight: "Zero-Contamination Scientific Spectroscopic Screening",
  },
  {
    id: "cert-cut-standards",
    category: "certification",
    question: "What cut standards and optical symmetry grades does Novva Diamonds prioritize?",
    answer:
      "We specialize in 'Triple Excellent' round brilliants (Excellent Cut, Polish, and Symmetry) and strictly curated fancy shapes with optimal length-to-width ratios, minimal bow-tie effect in ovals/pears, and crisp step-cut parallelism in emerald cuts. Each stone is audited for optical scintillation before being admitted into inventory.",
    keyHighlight: "Triple Excellent & Scintillation-Audited Inventory",
  },
  {
    id: "bourse-heritage",
    category: "bourse",
    question: "Why does sourcing directly from the Surat Diamond Bourse offer a price advantage?",
    answer:
      "Surat cuts and polishes over 90% of the world's diamonds. The Surat Diamond Bourse (SDB) is the world’s largest diamond trading complex, spanning 35.5 acres and housing over 4,000 trading suites. Sourcing directly from Novva at the source eliminates intermediate broker commissions, overseas distributor markups, and high retail overheads, giving you direct factory-to-buyer pricing.",
    keyHighlight: "Direct Factory Source: Over 90% of Global Diamonds Cut in Surat",
  },
  {
    id: "bourse-visiting",
    category: "bourse",
    question: "Can private buyers and international jewelers visit the physical vault in Surat?",
    answer:
      "Yes. We welcome credentialed jewelers, private family offices, and trade delegates to our private viewing suites in Tower 2 of the Surat Diamond Bourse. In-person appointments require a 24-hour advance security clearance notice. You will be provided with gemological stereo-microscopes, daylight D55 lamps, and calibrated master color stones for hands-on inspection.",
    keyHighlight: "Private Viewing Suites with Calibrated Gemological Loupes",
  },
  {
    id: "bourse-settlement",
    category: "bourse",
    question: "What international payment and escrow settlement methods are supported?",
    answer:
      "We accept international SWIFT bank wire transfers in USD, EUR, GBP, AUD, CAD, and AED, domestic RTGS/NEFT for Indian institutional partners, and third-party escrow arrangements for high-value collector parcels. All invoices are issued with formal trade documentation.",
    keyHighlight: "Multi-Currency SWIFT Wire & Third-Party Escrow Settlement",
  },
];
