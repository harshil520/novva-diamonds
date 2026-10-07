/**
 * Bakes the source GLB diamond models (assets/diamond-models/*.glb) into compact,
 * render-ready binaries at public/models/diamonds/<shape>.bin.
 *
 * Why: each source GLB stores every facet as its own primitive (65–258 draw calls
 * per stone), sits ~6mm in size and off-origin. We merge everything into one
 * non-indexed Float32 triangle buffer, centre it, normalise the girdle radius to 1,
 * and force outward winding so flat normals and BVH ray tracing are correct.
 * If the Pear source model is ever missing, a brilliant-cut pear is generated instead.
 *
 * Run: node scripts/bake-diamond-models.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "assets", "diamond-models");
const outDir = path.join(root, "public", "models", "diamonds");
fs.mkdirSync(outDir, { recursive: true });

const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function readGlb(file) {
  const buf = fs.readFileSync(file);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
  const binStart = 20 + jsonLen + 8;
  const binLen = buf.readUInt32LE(20 + jsonLen);
  const bin = buf.subarray(binStart, binStart + binLen);
  return { json, bin };
}

function readAccessor({ json, bin }, index) {
  const acc = json.accessors[index];
  const view = json.bufferViews[acc.bufferView];
  const comps = COMPONENTS[acc.type];
  const base = (view.byteOffset || 0) + (acc.byteOffset || 0);
  const out = new Array(acc.count * comps);
  const size = { 5126: 4, 5125: 4, 5123: 2, 5121: 1 }[acc.componentType];
  const stride = view.byteStride || size * comps;
  for (let i = 0; i < acc.count; i++) {
    for (let c = 0; c < comps; c++) {
      const o = base + i * stride + c * size;
      out[i * comps + c] =
        acc.componentType === 5126
          ? bin.readFloatLE(o)
          : acc.componentType === 5125
          ? bin.readUInt32LE(o)
          : acc.componentType === 5123
          ? bin.readUInt16LE(o)
          : bin.readUInt8(o);
    }
  }
  return out;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Returns triangles as [[p0,p1,p2], ...] with winding matching stored normals. */
function trianglesFromGlb(file) {
  const glb = readGlb(file);
  const tris = [];
  let flipped = 0;
  for (const mesh of glb.json.meshes) {
    for (const prim of mesh.primitives) {
      if (prim.mode !== undefined && prim.mode !== 4) continue;
      const pos = readAccessor(glb, prim.attributes.POSITION);
      const nrm = prim.attributes.NORMAL !== undefined ? readAccessor(glb, prim.attributes.NORMAL) : null;
      const idx =
        prim.indices !== undefined
          ? readAccessor(glb, prim.indices)
          : Array.from({ length: pos.length / 3 }, (_, i) => i);
      for (let i = 0; i < idx.length; i += 3) {
        const v = [idx[i], idx[i + 1], idx[i + 2]].map((k) => [pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]]);
        const fn = cross(sub(v[1], v[0]), sub(v[2], v[0]));
        if (Math.hypot(...fn) < 1e-14) continue; // degenerate
        if (nrm) {
          const k = idx[i];
          const sn = [nrm[k * 3], nrm[k * 3 + 1], nrm[k * 3 + 2]];
          if (dot(fn, sn) < 0) {
            v.reverse();
            flipped++;
          }
        }
        tris.push(v);
      }
    }
  }
  return { tris, flipped };
}

/** Brilliant-cut pear generated from a teardrop outline (convex, outward wound). */
function generatePear() {
  const N = 32;
  const outline = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    // Teardrop: point at t=0 (+z), round shoulder at t=PI (-z)
    const x = Math.sin(t) * Math.pow(Math.abs(Math.sin(t / 2)), 0.9) * 0.82;
    const z = Math.cos(t);
    outline.push([x, z]);
  }
  // Centre the outline on its area centroid so scaled rings stay inside the girdle
  const cx = outline.reduce((s, p) => s + p[0], 0) / N;
  const cz = outline.reduce((s, p) => s + p[1], 0) / N;
  const ring = (scale, y, i) => {
    const p = outline[((i % N) + N) % N];
    return [cx + (p[0] - cx) * scale, y, cz + (p[1] - cz) * scale];
  };
  const W = 1.3; // approx. width of the outline (L/W ≈ 1.55)
  const crownH = 0.15 * W;
  const girdle = 0.018 * W;
  const pav = 0.43 * W;

  const T = Array.from({ length: 8 }, (_, j) => ring(0.56, crownH, 4 * j));
  const S = Array.from({ length: 8 }, (_, j) => ring(0.79, crownH * 0.53, 4 * j + 2));
  const G = Array.from({ length: N }, (_, i) => ring(1, girdle / 2, i));
  const B = Array.from({ length: N }, (_, i) => ring(1, -girdle / 2, i));
  const R = Array.from({ length: 16 }, (_, k) => ring(0.47, -pav * 0.55, 2 * k));
  const tableCentre = [cx, crownH, cz];
  const culet = [cx, -pav, cz];

  const tris = [];
  for (let j = 0; j < 8; j++) {
    const jn = (j + 1) % 8;
    const jp = (j + 7) % 8;
    tris.push([tableCentre, T[j], T[jn]]); // table
    tris.push([T[j], T[jn], S[j]]); // star
    tris.push([T[j], S[jp], G[4 * j]], [T[j], G[4 * j], S[j]]); // bezel kite
    for (let k = 0; k < 4; k++) tris.push([S[j], G[(4 * j + k) % N], G[(4 * j + k + 1) % N]]); // upper girdle
  }
  for (let i = 0; i < N; i++) {
    const n = (i + 1) % N;
    tris.push([G[i], B[i], B[n]], [G[i], B[n], G[n]]); // girdle band
  }
  for (let k = 0; k < 16; k++) {
    const kn = (k + 1) % 16;
    tris.push([R[k], B[2 * k], B[2 * k + 1]], [R[k], B[2 * k + 1], R[kn]], [R[kn], B[2 * k + 1], B[(2 * k + 2) % N]]);
    tris.push([culet, R[k], R[kn]]);
  }
  // Orient outward relative to the solid's centroid (shape is convex)
  const c = [cx, (crownH - pav) / 2, cz];
  return tris.map((v) => {
    const fn = cross(sub(v[1], v[0]), sub(v[2], v[0]));
    const fc = [(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3, (v[0][2] + v[1][2] + v[2][2]) / 3];
    return dot(fn, sub(fc, c)) < 0 ? [v[0], v[2], v[1]] : v;
  });
}

function normaliseAndWrite(name, tris) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const t of tris) for (const p of t) for (let a = 0; a < 3; a++) {
    min[a] = Math.min(min[a], p[a]);
    max[a] = Math.max(max[a], p[a]);
  }
  const centre = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  // Unit girdle: the larger of width (x) / length (z) spans 2 units
  const scale = 2 / Math.max(max[0] - min[0], max[2] - min[2]);
  const data = new Float32Array(tris.length * 9);
  let o = 0;
  for (const t of tris) for (const p of t) {
    data[o++] = (p[0] - centre[0]) * scale;
    data[o++] = (p[1] - centre[1]) * scale;
    data[o++] = (p[2] - centre[2]) * scale;
  }
  fs.writeFileSync(path.join(outDir, `${name}.bin`), Buffer.from(data.buffer));
  const dims = [0, 1, 2].map((a) => +((max[a] - min[a]) * scale).toFixed(3));
  return { triangles: tris.length, bytes: data.byteLength, dims };
}

const manifest = {};
for (const file of fs.readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith(".glb"))) {
  const name = path.basename(file, path.extname(file)).toLowerCase();
  const { tris, flipped } = trianglesFromGlb(path.join(srcDir, file));
  manifest[name] = normaliseAndWrite(name, tris);
  console.log(name.padEnd(9), manifest[name], flipped ? `(re-wound ${flipped})` : "");
}
// Fallback only: generate a brilliant pear if no PEAR.glb source model is present
if (!manifest.pear) {
  manifest.pear = normaliseAndWrite("pear", generatePear());
  console.log("pear".padEnd(9), manifest.pear, "(generated)");
}
