import type { Diamond } from "@/types/diamond";

/** Pre-filled email about one diamond. */
export function stoneMailto(d: Diamond) {
  return `mailto:vault@novvadiamonds.com?subject=Enquiry%20about%20diamond%20${d.id}&body=Hello%20Novva%20Diamonds,%0A%0AI%20am%20interested%20in%20this%20diamond:%0A-%20ID:%20${d.id}%0A-%20Shape:%20${d.shape}%0A-%20Carat:%20${d.carat}%20CT%0A-%20Color:%20${d.color}%0A-%20Clarity:%20${d.clarity}%0A-%20Certificate:%20${d.certification.laboratory}%20${d.certification.certificateNumber}%0A%0APlease%20share%20the%20price,%20a%20video%20and%20delivery%20details.%0A%0AThank%20you.`;
}
