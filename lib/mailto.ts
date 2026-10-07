import type { Diamond } from "@/types/diamond";

/** Pre-filled email to the vault desk about one stone. */
export function stoneMailto(d: Diamond) {
  return `mailto:vault@novvadiamonds.com?subject=Inquiry%20Regarding%20Stone%20${d.id}&body=Hello%20Novva%20Diamonds%20Team,%0A%0AI%20am%20inquiring%20about%20the%20following%20certified%20stone:%0A-%20Stock%20ID:%20${d.id}%0A-%20Shape:%20${d.shape}%0A-%20Carat:%20${d.carat}%20CT%0A-%20Color:%20${d.color}%0A-%20Clarity:%20${d.clarity}%0A-%20Certificate:%20${d.certification.laboratory}%20${d.certification.certificateNumber}%0A%0APlease%20provide%20final%20CIF%20quote%20and%20microscope%20video.%0A%0AThank%20you.`;
}
