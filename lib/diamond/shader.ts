import { BVHShaderGLSL } from "three-mesh-bvh";

/**
 * Physically-motivated diamond shader.
 *
 * - Light enters through the facet, refracts at the IOR of diamond (2.417) and is
 *   traced through real internal reflections against a BVH of the stone's facets.
 *   Total internal reflection is what makes a diamond look like a diamond (and not
 *   glass), so the bounce loop is the heart of the look.
 * - The studio environment is analytic and strictly grayscale: softboxes, strip
 *   lights and a dark camera zone, exactly how jewellers photograph stones. No
 *   texture, no colour — reflections can only ever be white, gray or black.
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

  uniform BVH bvh;
  uniform mat4 uModel;
  uniform mat4 uModelInverse;
  uniform float uIor;
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
  // The tent itself is white; contrast comes from its seams, the dark floor and
  // the camera port — exactly the black accents seen in real diamond photography.
  float studio(vec3 dir) {
    vec3 d = spinY(dir, uEnvSpin);
    float y = d.y;
    float lum = mix(0.42, 0.95, smoothstep(-0.15, 0.75, y));      // white tent walls

    // Overhead diffuser broken into a window grid, so the table shows structure
    vec2 top = d.xz / max(y, 0.2);
    float gx = abs(fract(top.x * 1.6) - 0.5);
    float gz = abs(fract(top.y * 1.6 + 0.25) - 0.5);
    float grid = smoothstep(0.05, 0.1, gx) * smoothstep(0.05, 0.1, gz);
    lum += smoothstep(0.62, 0.8, y) * mix(-0.7, 2.2, grid);

    lum += softbox(d, vec3(0.0, 0.3, -1.0), 0.45, 0.1) * 1.8;     // back softbox
    lum += softbox(d, vec3(-0.9, 0.15, -0.45), 0.16, 0.05) * 2.4; // rear left flag
    lum += softbox(d, vec3(0.95, 0.25, -0.3), 0.13, 0.05) * 2.4;  // rear right flag
    lum += softbox(d, vec3(-0.55, 0.55, 0.62), 0.11, 0.04) * 3.0; // front keys
    lum += softbox(d, vec3(0.6, 0.42, 0.68), 0.08, 0.03) * 2.5;

    // Tent seams / support poles: thin dark verticals give facets their crisp edges
    float az = atan(d.z, d.x);
    float seam = abs(fract(az * 1.27324 + 0.25) - 0.5);           // 8 seams (4/PI)
    float band = smoothstep(-0.3, -0.05, y) * (1.0 - smoothstep(0.45, 0.62, y));
    lum *= 1.0 - (1.0 - smoothstep(0.02, 0.04, seam)) * band * 0.92;

    // Camera port in front of the stone and the photographer behind it
    lum *= 1.0 - softbox(d, vec3(0.0, 0.08, 1.0), 0.12, 0.12) * 0.8;
    float folds = 0.5 + 0.5 * sin(y * 26.0 + d.x * 9.0);              // soft fabric folds
    lum *= 1.0 - softbox(d, vec3(0.0, -0.1, 1.0), 0.5, 0.45) * (0.22 + 0.25 * folds);

    // Ring light overhead: fine concentric bands break the table into living structure
    float theta = acos(clamp(y, -1.0, 1.0));
    float rings = smoothstep(0.25, 0.75, 0.5 + 0.5 * sin(theta * 70.0));
    lum = mix(lum, lum * (0.18 + 1.1 * rings), smoothstep(0.82, 0.93, y));
    lum *= mix(0.03, 1.0, smoothstep(-0.5, -0.08, y));            // dark floor
    return max(lum, 0.0);
  }

  float glints(vec3 d) {
    vec3 s = spinY(d, uEnvSpin);
    float g = pow(max(dot(s, normalize(vec3(-0.55, 0.55, 0.62))), 0.0), 1400.0) * 14.0;
    g += pow(max(dot(s, normalize(vec3(0.6, 0.42, 0.68))), 0.0), 1800.0) * 10.0;
    g += pow(max(dot(s, normalize(vec3(0.1, 0.95, 0.25))), 0.0), 900.0) * 8.0;
    return g;
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
        break;
      }
      rd = reflect(rd, n);
      ro = hitPos + rd * 0.0015;
      throughput *= 0.985;
    }

    vec3 exitWorld = normalize(mat3(uModel) * rd);
    float body = (studio(exitWorld) + glints(exitWorld) * 0.8) * throughput;

    float lum = mix(body, surface, F);
    lum = 1.0 - exp(-lum * uExposure);                            // neutral filmic shoulder

    gl_FragColor = vec4(vec3(lum), uOpacity);
    #include <colorspace_fragment>
  }
`;
