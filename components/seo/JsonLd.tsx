/** Server-rendered JSON-LD. Accepts one node or several, wrapped in a single @graph. */
export default function JsonLd({ data }: { data: object | object[] }) {
  const graph = { "@context": "https://schema.org", "@graph": Array.isArray(data) ? data : [data] };
  // Escape "<" so a value can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />;
}
