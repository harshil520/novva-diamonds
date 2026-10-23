import { siteConfig } from "@/config/config";
import { diamondsData } from "@/data/diamonds";
import { FAQ_ITEMS } from "@/data/faq";
import { absoluteUrl, diamondName } from "@/lib/seo";

export const dynamic = "force-static";

// Plain-text brief for AI assistants and agents (https://llmstxt.org), built from the same data as the site.
export function GET() {
  const { brand, contact, shipping } = siteConfig;
  const stones = diamondsData.filter((d) => d.availability !== "Sold");

  const body = `# ${brand.name}

> ${brand.description}

${brand.name} is a diamond dealer based at the ${brand.address}. It sells loose diamonds of 1 carat and above, natural and lab-grown, each with a GIA or IGI grading report. Buyers enquire by WhatsApp, phone or email and receive a price, video and delivery details for the specific stone.

## Key facts

- Location: ${brand.address}
- Products: certified loose diamonds, natural and lab-grown, 1 ct and above
- Shapes: Round, Oval, Pear, Marquise, Emerald, Princess, Cushion, Radiant, Asscher, Heart
- Grading labs: GIA (Gemological Institute of America) and IGI (International Gemological Institute); every report number can be checked on the lab's website and is laser-inscribed on the stone
- Pricing: quoted per stone on request
- Shipping: fully insured via ${shipping.insuredCourier}, ${shipping.leadTimeDays}
- Markets served: ${shipping.markets.map((m) => m.name).join(", ")}
- Customs: invoice and Kimberley Process paperwork included with every shipment
- Payment: international bank transfer; RTGS or NEFT for buyers in India
- Viewing: in person at the Surat Diamond Bourse by appointment (24 hours' notice)
- Contact: WhatsApp ${contact.whatsappDisplay}, email ${contact.email}, ${contact.workingHours}

## Pages

- [Diamond catalog](${absoluteUrl("/diamonds")}): all available certified diamonds with filters for shape, carat, colour, clarity, cut and lab
- [The 4Cs of diamonds](${absoluteUrl("/education/4cs")}): cut, colour, clarity and carat explained
- [Diamond certificates](${absoluteUrl("/education/certification")}): what GIA and IGI reports contain and how to verify one
- [Natural vs lab-grown diamonds](${absoluteUrl("/education/natural-vs-lab-grown")}): how the two differ
- [About ${brand.name}](${absoluteUrl("/about")})
- [Contact](${absoluteUrl("/contact")})

## Current inventory

${stones
  .map((d) => `- [${diamondName(d)}](${absoluteUrl(`/diamonds/${d.id}`)}): ${d.cut} cut, ${d.certification.laboratory} report ${d.certification.certificateNumber}, ${d.availability ?? "Available"}`)
  .join("\n")}

## FAQ

${FAQ_ITEMS.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
