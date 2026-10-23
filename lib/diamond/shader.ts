import { BVHShaderGLSL } from "three-mesh-bvh";

/**
 * Physically-motivated diamond shader.
 *
 * - Light enters through the facet, refracts at the IOR of diamond (2.417) and is
 *   traced through real internal reflections against a BVH of the stone's facets.
 *   Total internal reflection is what makes a diamond look like a diamond (and not
 *   glass), so the bounce loop is the heart of the look.
 * - The studio environment is analytic and grayscale: a bright white light tent
 *   with softboxes, exactly how jewellers photograph stones. A well-cut diamond
 *   returns almost all light through its crown, so it reads bright white; black is
 *   kept to small, crisp accents (the viewer's head / camera and tent seams).
 * - Fire: light leaving the stone is split by diamond's dispersion (0.044, IOR
 *   2.407 red → 2.451 blue), giving spectral flashes at the edges of the lights.
 * - Scintillation comes from very tight white glints of a few key lights, on the
 *   crown surface and on light leaving the pavilion.
 */
export const diamondVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const diamondFragmentShader = /* glsl */ `
  precision highp isampler2D;
  precision highp usampler2D;

  ${BVHShaderGLSL.common_functions}
  ${BVHShaderGLSL.bvh_struct_definitions}
  ${BVHShaderGLSL.bvh_ray_functions}

  #define MAX_BOUNCES 7

  // Spread of diamond's index around its yellow value (2.407 red, 2.451 blue)
  const vec3 DISPERSION = vec3(-0.010, 0.0, 0.034);

  uniform BVH bvh;
  uniform mat4 uModel;
  uniform mat4 uModelInverse;
  uniform float uIor;
  uniform float uDispersion;
  uniform int uBounces;
  uniform float uExposure;
  uniform float uEnvSpin;
  uniform float uOpacity;

  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  vec3 spinY(vec3 d, float a) {
    float c = cos(a), s = sin(a);
    return vec3(c * d.x + s * d.z, d.y, -s * d.x + c * d.z);
  }

  // Soft-edged circular softbox
  float softbox(vec3 d, vec3 axis, float radius, float soft) {
    float c = dot(d, normalize(axis));
    return smoothstep(cos(radius + soft), cos(radius), c);
  }

  // Grayscale jeweller's light tent. Viewer looks along -Z (camera on +Z).
  // The tent and the white table under the stone are bright everywhere; contrast
  // comes only from thin seams and the camera port — the small black accents seen
  // in real diamond photography, never large dark areas.
  float studio(vec3 dir) {
    vec3 d = spinY(dir, uEnvSpin);
    float y = d.y;
    float lum = mix(0.4, 1.0, smoothstep(-0.2, 0.7, y));          // white tent walls

    // Overhead diffuser broken into a window grid, so the table shows structure
    vec2 top = d.xz / max(y, 0.2);
    float gx = abs(fract(top.x * 1.6) - 0.5);
    float gz = abs(fract(top.y * 1.6 + 0.25) - 0.5);
    float grid = smoothstep(0.05, 0.1, gx) * smoothstep(0.05, 0.1, gz);
    lum += smoothstep(0.62, 0.8, y) * mix(-0.3, 2.0, grid);

    lum += softbox(d, vec3(0.0, 0.3, -1.0), 0.45, 0.1) * 1.8;     // back softbox
    lum += softbox(d, vec3(-0.9, 0.15, -0.45), 0.16, 0.05) * 2.4; // rear left flag
    lum += softbox(d, vec3(0.95, 0.25, -0.3), 0.13, 0.05) * 2.4;  // rear right flag
    lum += softbox(d, vec3(-0.55, 0.55, 0.62), 0.11, 0.04) * 3.0; // front keys
    lum += softbox(d, vec3(0.6, 0.42, 0.68), 0.08, 0.03) * 2.5;

    // Tent seams / support poles: thin dark verticals give facets their crisp edges
    float az = atan(d.z, d.x);
    float seam = abs(fract(az * 1.27324 + 0.25) - 0.5);           // 8 seams (4/PI)
    float band = smoothstep(-0.3, -0.05, y) * (1.0 - smoothstep(0.45, 0.62, y));
    lum *= 1.0 - (1.0 - smoothstep(0.02, 0.04, seam)) * band * 0.85;

    // Camera port / viewer's head in front of the stone: the crisp dark "obstruction"
    // accents real stones show, plus faint folds of the tent behind the photographer
    lum *= 1.0 - softbox(d, vec3(0.0, 0.08, 1.0), 0.13, 0.08) * 0.95;
    float folds = 0.5 + 0.5 * sin(y * 26.0 + d.x * 9.0);              // soft fabric folds
    lum *= 1.0 - softbox(d, vec3(0.0, -0.1, 1.0), 0.45, 0.4) * (0.15 + 0.2 * folds);

    // Ring light overhead: fine concentric bands break the table into living structure
    float theta = acos(clamp(y, -1.0, 1.0));
    float rings = smoothstep(0.25, 0.75, 0.5 + 0.5 * sin(theta * 70.0));
    lum = mix(lum, lum * (0.3 + 1.0 * rings), smoothstep(0.82, 0.93, y));
    lum *= mix(0.22, 1.0, smoothstep(-0.6, -0.05, y));            // shaded table, never black
    return max(lum, 0.0);
  }

  float glints(vec3 d) {
    vec3 s = spinY(d, uEnvSpin);
    float g = pow(max(dot(s, normalize(vec3(-0.55, 0.55, 0.62))), 0.0), 1400.0) * 14.0;
    g += pow(max(dot(s, normalize(vec3(0.6, 0.42, 0.68))), 0.0), 1800.0) * 10.0;
    g += pow(max(dot(s, normalize(vec3(0.1, 0.95, 0.25))), 0.0), 900.0) * 8.0;
    return g;
  }

  // Light arriving from a model-space direction leaving the stone
  float exitLight(vec3 modelDir) {
    vec3 w = normalize(mat3(uModel) * modelDir);
    return studio(w) + glints(w) * 0.8;
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(vWorldPosition - cameraPosition);

    // Crown surface reflection (Schlick, F0 of diamond ≈ 0.172)
    float cosT = clamp(dot(-V, N), 0.0, 1.0);
    float F = 0.172 + 0.828 * pow(1.0 - cosT, 5.0);
    vec3 R = reflect(V, N);
    float surface = studio(R) + glints(R);

    // Refract into the stone and trace internal reflections in model space
    vec3 rd = normalize((uModelInverse * vec4(refract(V, N, 1.0 / uIor), 0.0)).xyz);
    vec3 ro = (uModelInverse * vec4(vWorldPosition, 1.0)).xyz + rd * 0.0015;
    float throughput = 1.0;
    bool escaped = false;
    vec3 dirR = rd;
    vec3 dirB = rd;
    vec3 iors = uIor + DISPERSION * uDispersion;

    for (int i = 0; i < MAX_BOUNCES; i++) {
      if (i >= uBounces) break;
      uvec4 faceIndices = uvec4(0u);
      vec3 faceNormal = vec3(0.0, 0.0, 1.0);
      vec3 barycoord = vec3(0.0);
      float side = 1.0;
      float dist = 0.0;
      bool hit = bvhIntersectFirstHit(bvh, ro, rd, faceIndices, faceNormal, barycoord, side, dist);
      if (!hit) break;

      vec3 hitPos = ro + rd * dist;
      // Outward facet normal, flipped to oppose the ray travelling inside the stone
      vec3 n = normalize(faceNormal);
      if (dot(n, rd) > 0.0) n = -n;

      vec3 exitDir = refract(rd, n, uIor);
      if (dot(exitDir, exitDir) > 0.0) {
        // Partial reflection back inside at exit (Fresnel) keeps light alive longer
        float c = clamp(dot(-rd, n), 0.0, 1.0);
        float Fi = 0.172 + 0.828 * pow(1.0 - c, 5.0);
        rd = exitDir;
        throughput *= (1.0 - Fi * 0.5);
        // Fire: each wavelength bends by its own index on the way out
        vec3 exitR = refract(rd, n, iors.r);
        vec3 exitB = refract(rd, n, iors.b);
        dirR = dot(exitR, exitR) > 0.0 ? exitR : exitDir;
        dirB = dot(exitB, exitB) > 0.0 ? exitB : exitDir;
        escaped = true;
        break;
      }
      rd = reflect(rd, n);
      ro = hitPos + rd * 0.0015;
      throughput *= 0.985;
    }

    vec3 body;
    if (escaped) {
      // The centre sample is neutral and the red/blue samples carry the colour; the
      // weights sum to white, so the stone never tints and fire flashes orange or blue
      body = (exitLight(dirR) * vec3(0.67, 0.27, 0.0)
            + exitLight(rd)   * vec3(0.33)
            + exitLight(dirB) * vec3(0.0, 0.4, 0.67)) * throughput;
    } else {
      // Still bouncing after the traced budget: a well-cut stone sends this light back
      // out through the crown, so it reads as the tent's glow rather than going dark
      body = vec3(0.95 * throughput);
    }

    vec3 col = mix(body, vec3(surface), F);
    col = 1.0 - exp(-col * uExposure);                            // neutral filmic shoulder
    col = mix(col, col * col * (3.0 - 2.0 * col), 0.5);          // gentle S-curve: crisp facets

    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }
`;
