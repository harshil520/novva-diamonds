export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "shipping-insurance",
    question: "Is shipping insured?",
    answer:
      "Yes. We ship with Brink's, Malca-Amit or Ferrari Express. Your diamond is insured for its full value until you sign for it.",
  },
  {
    id: "shipping-timelines",
    question: "How long does delivery take?",
    answer: "Usually 3 to 5 business days to most countries, including the US, UK, Europe, Canada and Australia.",
  },
  {
    id: "shipping-customs",
    question: "Who handles customs paperwork?",
    answer: "We do. Every shipment includes the invoice and Kimberley Process papers needed for customs.",
  },
  {
    id: "cert-verification",
    question: "How can I check the certificate?",
    answer:
      "Every diamond has a GIA or IGI report. Enter the report number on the lab's website to confirm the details. The same number is laser-engraved on the diamond.",
  },
  {
    id: "cert-natural-lab",
    question: "Do you keep natural and lab-grown diamonds separate?",
    answer: "Yes. Every diamond is tested before it enters our stock, and each type has its own certificate.",
  },
  {
    id: "bourse-settlement",
    question: "How do I pay?",
    answer: "By international bank transfer. Indian buyers can also pay by RTGS or NEFT. You get a proper invoice with every order.",
  },
  {
    id: "bourse-visiting",
    question: "Can I see the diamonds in person?",
    answer: "Yes. You can visit our office at the Surat Diamond Bourse. Please book at least 24 hours ahead.",
  },
];
