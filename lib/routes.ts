/** Delivery corridors from the Surat Diamond Bourse, shared by the 3D globe and its static fallback. */
export interface Hub {
  name: string;
  lat: number;
  lon: number;
}

export const SURAT: Hub = { name: "Surat Diamond Bourse", lat: 21.17, lon: 72.83 };

export const HUBS: Hub[] = [
  { name: "New York", lat: 40.71, lon: -74.0 },
  { name: "Los Angeles", lat: 34.05, lon: -118.24 },
  { name: "Toronto", lat: 43.65, lon: -79.38 },
  { name: "Vancouver", lat: 49.28, lon: -123.12 },
  { name: "London", lat: 51.5, lon: -0.13 },
  { name: "Antwerp", lat: 51.22, lon: 4.4 },
  { name: "Zurich", lat: 47.37, lon: 8.54 },
  { name: "Almaty", lat: 43.24, lon: 76.89 },
  { name: "Astana", lat: 51.17, lon: 71.45 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
  { name: "Melbourne", lat: -37.81, lon: 144.96 },
  { name: "Mumbai", lat: 19.08, lon: 72.88 },
];

/**
 * Cities labelled on the globe (one per cluster so names never collide), in the
 * order the globe reports their screen positions. Every hub still gets a marker and a route.
 */
const LABELLED = ["New York", "Los Angeles", "Vancouver", "London", "Almaty", "Sydney"];
export const GLOBE_LABELS: Hub[] = [SURAT, ...HUBS.filter((h) => LABELLED.includes(h.name))];
