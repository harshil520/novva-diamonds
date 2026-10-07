import { Diamond } from "@/types/diamond";
import { siteConfig } from "@/config/config";

/**
 * Clean phone number for WhatsApp deep links
 */
export function getWhatsAppBaseUrl(): string {
  const phone = siteConfig.contact.whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}`;
}

/**
 * Builds a direct WhatsApp link with pre-filled message for an individual diamond
 */
export function getDiamondWhatsAppUrl(diamond: Diamond): string {
  const message = `Hello Novva Diamonds,

I am interested in the following diamond:

Shape: ${diamond.shape}
Origin: ${diamond.origin}
Carat: ${diamond.carat.toFixed(2)} ct
Cut: ${diamond.cut}
Color: ${diamond.color}
Clarity: ${diamond.clarity}
Certification: ${diamond.certification.laboratory}
Certificate No: ${diamond.certification.certificateNumber}
Diamond Reference: ${diamond.id}

Please share the current export price, high-resolution videos, and international delivery terms.

Thank you.`;

  return `${getWhatsAppBaseUrl()}?text=${encodeURIComponent(message)}`;
}

/**
 * Contextual WhatsApp message for catalog search or custom sourcing
 */
export function getConciergeWhatsAppUrl(context: {
  topic?: "catalog" | "sourcing" | "bulk" | "general" | "certification";
  shape?: string;
  carat?: string;
  budget?: string;
}): string {
  let message = "";

  switch (context.topic) {
    case "sourcing":
      message = `Hello Novva Diamonds,

I am seeking a specific certified diamond with the following parameters:
- Shape: ${context.shape || "Open"}
- Carat Range: ${context.carat || "Flexible"}
- Target Budget: ${context.budget || "Open"}

Could you please review your direct Surat Bourse inventory and suggest suitable stones?`;
      break;

    case "bulk":
      message = `Hello Novva Diamonds,

I am a jeweler / diamond merchant inquiring about bulk sourcing and parcel orders of certified diamonds from Surat. Please share your current wholesale list and export terms.`;
      break;

    case "catalog":
      message = `Hello Novva Diamonds,

I am browsing your certified loose diamond catalog and would appreciate personal assistance with selection and diamond inspection.`;
      break;

    case "certification":
      message = `Hello Novva Diamonds,

I have an inquiry regarding diamond certification standards (GIA / IGI) and verifying laser inscriptions before purchase.`;
      break;

    default:
      message = `Hello Novva Diamonds,

I would like to learn more about your certified diamond inventory and direct export from the Surat Diamond Bourse.`;
      break;
  }

  return `${getWhatsAppBaseUrl()}?text=${encodeURIComponent(message)}`;
}
