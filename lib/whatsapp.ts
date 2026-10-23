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

Please share the price, a video and delivery details.

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

I am looking for a diamond:
- Shape: ${context.shape || "Open"}
- Carat: ${context.carat || "Flexible"}
- Budget: ${context.budget || "Open"}

Can you suggest some options?`;
      break;

    case "bulk":
      message = `Hello Novva Diamonds,

I am a jeweller and would like to buy diamonds in bulk. Please share your list and terms.`;
      break;

    case "catalog":
      message = `Hello Novva Diamonds,

I am looking at your diamonds and would like some help choosing.`;
      break;

    case "certification":
      message = `Hello Novva Diamonds,

I have a question about GIA / IGI certificates.`;
      break;

    default:
      message = `Hello Novva Diamonds,

I would like to know more about your diamonds.`;
      break;
  }

  return `${getWhatsAppBaseUrl()}?text=${encodeURIComponent(message)}`;
}
