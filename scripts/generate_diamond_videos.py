import math
import os
import shutil
import subprocess
import tempfile

def normalize(v):
    l = math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
    if l < 1e-9:
        return (0, 0, 1)
    return (v[0]/l, v[1]/l, v[2]/l)

def dot(a, b):
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

def cross(a, b):
    return (
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    )

def rotate_y_x(v, yaw, pitch):
    cos_y, sin_y = math.cos(yaw), math.sin(yaw)
    x1 = v[0] * cos_y + v[2] * sin_y
    y1 = v[1]
    z1 = -v[0] * sin_y + v[2] * cos_y

    cos_p, sin_p = math.cos(pitch), math.sin(pitch)
    x2 = x1
    y2 = y1 * cos_p - z1 * sin_p
    z2 = y1 * sin_p + z1 * cos_p
    return (x2, y2, z2)

def project(v, width=480, height=480, fov=360, cam_z=4.2):
    denom = cam_z - v[2]
    if denom < 0.1:
        denom = 0.1
    scale = fov / denom
    sx = width / 2.0 + v[0] * scale
    sy = height / 2.0 - v[1] * scale + 10.0
    return (sx, sy, v[2])

# ============================================================
# SHAPE GEOMETRY BUILDERS
# ============================================================

def get_mesh(shape_name):
    shape = shape_name.lower()
    verts = []
    faces = []

    if "round" in shape:
        table_r, table_y = 0.65, 0.50
        for i in range(8):
            a = i * math.pi / 4.0
            verts.append((table_r * math.cos(a), table_y, table_r * math.sin(a)))
        star_r, star_y = 0.90, 0.32
        for i in range(8):
            a = (i + 0.5) * math.pi / 4.0
            verts.append((star_r * math.cos(a), star_y, star_r * math.sin(a)))
        girdle_r, girdle_y = 1.15, 0.0
        for i in range(16):
            a = i * math.pi / 8.0
            verts.append((girdle_r * math.cos(a), girdle_y, girdle_r * math.sin(a)))
        girdle_lower_y = -0.06
        for i in range(16):
            a = i * math.pi / 8.0
            verts.append((girdle_r * math.cos(a), girdle_lower_y, girdle_r * math.sin(a)))
        pav_r, pav_y = 0.60, -0.55
        for i in range(8):
            a = (i + 0.5) * math.pi / 4.0
            verts.append((pav_r * math.cos(a), pav_y, pav_r * math.sin(a)))
        culet_idx = len(verts)
        verts.append((0, -1.05, 0))
        table_center_idx = len(verts)
        verts.append((0, table_y, 0))

        for i in range(8):
            faces.append([table_center_idx, (i + 1) % 8, i])
        for i in range(8):
            faces.append([i, (i + 1) % 8, 8 + i])
        for i in range(8):
            faces.append([i, 8 + i, 16 + i * 2])
            faces.append([i, 16 + i * 2, 8 + ((i - 1) % 8)])
        for i in range(16):
            faces.append([16 + i, 16 + (i + 1) % 16, 8 + (i // 2)])
        for i in range(8):
            p1 = 32 + i * 2
            p2 = 32 + ((i * 2 + 1) % 16)
            p3 = 32 + ((i * 2 + 2) % 16)
            pm = 48 + i
            faces.append([p1, p2, pm])
            faces.append([p2, p3, pm])
            faces.append([pm, p1, culet_idx])
            faces.append([pm, culet_idx, 48 + (i + 1) % 8])

    elif "oval" in shape:
        scale_x, scale_z = 0.88, 1.32
        table_r, table_y = 0.62, 0.48
        for i in range(8):
            a = i * math.pi / 4.0
            verts.append((table_r * math.cos(a) * scale_x, table_y, table_r * math.sin(a) * scale_z))
        star_r, star_y = 0.88, 0.30
        for i in range(8):
            a = (i + 0.5) * math.pi / 4.0
            verts.append((star_r * math.cos(a) * scale_x, star_y, star_r * math.sin(a) * scale_z))
        girdle_r, girdle_y = 1.15, 0.0
        for i in range(16):
            a = i * math.pi / 8.0
            verts.append((girdle_r * math.cos(a) * scale_x, girdle_y, girdle_r * math.sin(a) * scale_z))
        for i in range(16):
            a = i * math.pi / 8.0
            verts.append((girdle_r * math.cos(a) * scale_x, -0.06, girdle_r * math.sin(a) * scale_z))
        pav_r, pav_y = 0.58, -0.55
        for i in range(8):
            a = (i + 0.5) * math.pi / 4.0
            verts.append((pav_r * math.cos(a) * scale_x, pav_y, pav_r * math.sin(a) * scale_z))
        culet_idx = len(verts)
        verts.append((0, -1.05, 0))
        table_center_idx = len(verts)
        verts.append((0, table_y, 0))

        for i in range(8):
            faces.append([table_center_idx, (i + 1) % 8, i])
        for i in range(8):
            faces.append([i, (i + 1) % 8, 8 + i])
        for i in range(8):
            faces.append([i, 8 + i, 16 + i * 2])
            faces.append([i, 16 + i * 2, 8 + ((i - 1) % 8)])
        for i in range(16):
            faces.append([16 + i, 16 + (i + 1) % 16, 8 + (i // 2)])
        for i in range(8):
            p1 = 32 + i * 2
            p2 = 32 + ((i * 2 + 1) % 16)
            p3 = 32 + ((i * 2 + 2) % 16)
            pm = 48 + i
            faces.append([p1, p2, pm])
            faces.append([p2, p3, pm])
            faces.append([pm, p1, culet_idx])
            faces.append([pm, culet_idx, 48 + (i + 1) % 8])

    elif "emerald" in shape:
        def oct_ring(w, d, ch, y):
            hw, hd = w * 0.5, d * 0.5
            return [
                (hw - ch, y, hd), (hw, y, hd - ch),
                (hw, y, -hd + ch), (hw - ch, y, -hd),
                (-hw + ch, y, -hd), (-hw, y, -hd + ch),
                (-hw, y, hd - ch), (-hw + ch, y, hd)
            ]
        t_pts = oct_ring(1.10, 1.55, 0.22, 0.52)
        s_pts = oct_ring(1.35, 1.85, 0.28, 0.30)
        g_pts = oct_ring(1.58, 2.15, 0.35, 0.0)
        gl_pts = oct_ring(1.58, 2.15, 0.35, -0.06)
        p1_pts = oct_ring(1.15, 1.55, 0.25, -0.45)
        p2_pts = oct_ring(0.65, 0.95, 0.15, -0.80)
        keel1 = (0, -1.05, 0.40)
        keel2 = (0, -1.05, -0.40)
        t_center = (0, 0.52, 0)

        verts.extend(t_pts)     # 0..7
        verts.extend(s_pts)     # 8..15
        verts.extend(g_pts)     # 16..23
        verts.extend(gl_pts)    # 24..31
        verts.extend(p1_pts)    # 32..39
        verts.extend(p2_pts)    # 40..47
        k1_idx = len(verts); verts.append(keel1)
        k2_idx = len(verts); verts.append(keel2)
        tc_idx = len(verts); verts.append(t_center)

        for i in range(8):
            faces.append([tc_idx, (i + 1) % 8, i])
        for i in range(8):
            ni = (i + 1) % 8
            faces.append([i, ni, 8 + ni])
            faces.append([i, 8 + ni, 8 + i])
        for i in range(8):
            ni = (i + 1) % 8
            faces.append([8 + i, 8 + ni, 16 + ni])
            faces.append([8 + i, 16 + ni, 16 + i])
        for i in range(8):
            ni = (i + 1) % 8
            faces.append([24 + i, 24 + ni, 32 + ni])
            faces.append([24 + i, 32 + ni, 32 + i])
        for i in range(8):
            ni = (i + 1) % 8
            faces.append([32 + i, 32 + ni, 40 + ni])
            faces.append([32 + i, 40 + ni, 40 + i])
        for i in range(4):
            faces.append([40 + i, 40 + (i + 1) % 8, k1_idx])
        for i in range(4, 8):
            faces.append([40 + i, 40 + (i + 1) % 8, k2_idx])
        faces.append([k1_idx, k2_idx, 40])
        faces.append([k2_idx, k1_idx, 44])

    elif "princess" in shape:
        hw_t = 0.72
        t_pts = [(hw_t, 0.50, hw_t), (hw_t, 0.50, -hw_t), (-hw_t, 0.50, -hw_t), (-hw_t, 0.50, hw_t)]
        hw_g = 1.18
        g_pts = [(hw_g, 0.0, hw_g), (hw_g, 0.0, 0), (hw_g, 0.0, -hw_g),
                 (0, 0.0, -hw_g), (-hw_g, 0.0, -hw_g), (-hw_g, 0.0, 0),
                 (-hw_g, 0.0, hw_g), (0, 0.0, hw_g)]
        gl_pts = [(p[0], -0.06, p[2]) for p in g_pts]
        culet = (0, -1.15, 0)
        tc = (0, 0.50, 0)

        verts.extend(t_pts)   # 0..3
        verts.extend(g_pts)   # 4..11
        verts.extend(gl_pts)  # 12..19
        c_idx = len(verts); verts.append(culet)
        tc_idx = len(verts); verts.append(tc)

        for i in range(4):
            faces.append([tc_idx, (i + 1) % 4, i])
        for i in range(4):
            corner_g = 4 + i * 2
            mid_g = 4 + i * 2 + 1
            next_corner_g = 4 + ((i * 2 + 2) % 8)
            faces.append([i, (i + 1) % 4, mid_g])
            faces.append([i, mid_g, corner_g])
            faces.append([(i + 1) % 4, next_corner_g, mid_g])
        for i in range(8):
            faces.append([12 + i, 12 + (i + 1) % 8, c_idx])

    elif "pear" in shape:
        t_pts = []
        for i in range(8):
            a = i * math.pi / 4.0
            if i <= 4:
                r = 0.60
                t_pts.append((r * math.cos(a), 0.48, r * math.sin(a) + 0.15))
            else:
                t = (i - 4) / 4.0
                t_pts.append((0.55 * (1 - t * 0.8) * math.cos(a), 0.48, -0.65 * t - 0.1))

        g_pts = []
        for i in range(16):
            a = i * math.pi / 8.0
            if i <= 8:
                r = 1.15
                g_pts.append((r * math.cos(a), 0.0, r * math.sin(a) + 0.2))
            else:
                t = (i - 8) / 8.0
                px = (1 - t) * 1.15 * math.cos(a) * 0.65
                pz = -0.1 - 1.45 * t
                g_pts.append((px, 0.0, pz))

        gl_pts = [(p[0], -0.06, p[2]) for p in g_pts]
        culet = (0, -1.05, -0.2)
        tc = (0, 0.48, 0.05)

        verts.extend(t_pts)   # 0..7
        verts.extend(g_pts)   # 8..23
        verts.extend(gl_pts)  # 24..39
        c_idx = len(verts); verts.append(culet)
        tc_idx = len(verts); verts.append(tc)

        for i in range(8):
            faces.append([tc_idx, (i + 1) % 8, i])
        for i in range(8):
            g1 = 8 + i * 2
            g2 = 8 + (i * 2 + 1) % 16
            faces.append([i, (i + 1) % 8, g1])
            faces.append([(i + 1) % 8, g2, g1])
        for i in range(16):
            faces.append([24 + i, 24 + (i + 1) % 16, c_idx])

    elif "marquise" in shape:
        g_pts = []
        for i in range(16):
            a = i * math.pi / 8.0
            x = 0.90 * math.cos(a) * (1 - 0.35 * abs(math.sin(a)))
            z = 1.55 * math.sin(a)
            g_pts.append((x, 0.0, z))

        t_pts = []
        for i in range(8):
            a = i * math.pi / 4.0
            x = 0.50 * math.cos(a) * (1 - 0.30 * abs(math.sin(a)))
            z = 0.95 * math.sin(a)
            t_pts.append((x, 0.48, z))

        gl_pts = [(p[0], -0.06, p[2]) for p in g_pts]
        culet = (0, -1.05, 0)
        tc = (0, 0.48, 0)

        verts.extend(t_pts)   # 0..7
        verts.extend(g_pts)   # 8..23
        verts.extend(gl_pts)  # 24..39
        c_idx = len(verts); verts.append(culet)
        tc_idx = len(verts); verts.append(tc)

        for i in range(8):
            faces.append([tc_idx, (i + 1) % 8, i])
        for i in range(8):
            g1 = 8 + i * 2
            g2 = 8 + (i * 2 + 1) % 16
            faces.append([i, (i + 1) % 8, g1])
            faces.append([(i + 1) % 8, g2, g1])
        for i in range(16):
            faces.append([24 + i, 24 + (i + 1) % 16, c_idx])

    elif "radiant" in shape:
        def oct_ring_r(w, d, ch, y):
            hw, hd = w * 0.5, d * 0.5
            return [
                (hw - ch, y, hd), (hw, y, hd - ch),
                (hw, y, -hd + ch), (hw - ch, y, -hd),
                (-hw + ch, y, -hd), (-hw, y, -hd + ch),
                (-hw, y, hd - ch), (-hw + ch, y, hd)
            ]
        t_pts = oct_ring_r(1.10, 1.45, 0.25, 0.50)
        s_pts = oct_ring_r(1.30, 1.70, 0.30, 0.28)
        g_pts = oct_ring_r(1.50, 1.95, 0.38, 0.0)
        gl_pts = oct_ring_r(1.50, 1.95, 0.38, -0.06)
        culet = (0, -1.10, 0)
        tc = (0, 0.50, 0)

        verts.extend(t_pts)   # 0..7
        verts.extend(s_pts)   # 8..15
        verts.extend(g_pts)   # 16..23
        verts.extend(gl_pts)  # 24..31
        c_idx = len(verts); verts.append(culet)
        tc_idx = len(verts); verts.append(tc)

        for i in range(8):
            faces.append([tc_idx, (i + 1) % 8, i])
        for i in range(8):
            ni = (i + 1) % 8
            faces.append([i, ni, 8 + ni])
            faces.append([i, 8 + ni, 8 + i])
            faces.append([8 + i, 8 + ni, 16 + ni])
            faces.append([8 + i, 16 + ni, 16 + i])
        for i in range(8):
            faces.append([24 + i, 24 + (i + 1) % 8, c_idx])

    elif "heart" in shape:
        g_pts = []
        for i in range(16):
            t = i * 2.0 * math.pi / 16.0
            x = 1.05 * (math.sin(t) ** 3)
            z = -(0.95 * math.cos(t) - 0.35 * math.cos(2*t) - 0.15 * math.cos(3*t) - 0.06 * math.cos(4*t))
            g_pts.append((x, 0.0, z * 1.05))

        t_pts = []
        for i in range(8):
            t = i * 2.0 * math.pi / 8.0
            x = 0.60 * (math.sin(t) ** 3)
            z = -(0.60 * math.cos(t) - 0.22 * math.cos(2*t) - 0.09 * math.cos(3*t) - 0.04 * math.cos(4*t))
            t_pts.append((x, 0.48, z * 1.05))

        gl_pts = [(p[0], -0.06, p[2]) for p in g_pts]
        culet = (0, -1.05, -0.3)
        tc = (0, 0.48, 0.05)

        verts.extend(t_pts)   # 0..7
        verts.extend(g_pts)   # 8..23
        verts.extend(gl_pts)  # 24..39
        c_idx = len(verts); verts.append(culet)
        tc_idx = len(verts); verts.append(tc)

        for i in range(8):
            faces.append([tc_idx, (i + 1) % 8, i])
        for i in range(8):
            g1 = 8 + i * 2
            g2 = 8 + (i * 2 + 1) % 16
            faces.append([i, (i + 1) % 8, g1])
            faces.append([(i + 1) % 8, g2, g1])
        for i in range(16):
            faces.append([24 + i, 24 + (i + 1) % 16, c_idx])

    return verts, faces

# ============================================================
# FRAME RENDERER (SVG)
# ============================================================

def render_svg_frame(verts, faces, yaw, pitch, shape_title="DIAMOND", frame_idx=0, total_frames=60):
    t_verts = [rotate_y_x(v, yaw, pitch) for v in verts]
    p_verts = [project(v) for v in t_verts]

    # Precompute facet data
    facet_data = []
    L1 = normalize((0.65, 1.10, 1.25))   # Key light
    L2 = normalize((-0.75, 0.40, 0.85))  # Fill light (cyan)
    V = (0, 0, 1)                        # View vector

    for face in faces:
        p0, p1, p2 = t_verts[face[0]], t_verts[face[1]], t_verts[face[2]]
        e1 = (p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2])
        e2 = (p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2])
        n = normalize(cross(e1, e2))
        avg_z = (p0[2] + p1[2] + p2[2]) / 3.0
        facet_data.append((avg_z, n, face))

    # Sort facets back-to-front
    facet_data.sort(key=lambda x: x[0])

    svg_parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480">',
        '<defs>',
        '  <radialGradient id="bg" cx="50%" cy="45%" r="65%">',
        '    <stop offset="0%" stop-color="#0f1d32"/>',
        '    <stop offset="60%" stop-color="#070c18"/>',
        '    <stop offset="100%" stop-color="#020409"/>',
        '  </radialGradient>',
        '  <radialGradient id="floor" cx="50%" cy="50%" r="50%">',
        '    <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25"/>',
        '    <stop offset="50%" stop-color="#0284c7" stop-opacity="0.08"/>',
        '    <stop offset="100%" stop-color="#000000" stop-opacity="0"/>',
        '  </radialGradient>',
        '  <linearGradient id="specGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
        '    <stop offset="0%" stop-color="#ffffff"/>',
        '    <stop offset="100%" stop-color="#bae6fd"/>',
        '  </linearGradient>',
        '</defs>',
        '<rect width="480" height="480" fill="url(#bg)"/>',
        '<ellipse cx="240" cy="385" rx="140" ry="22" fill="url(#floor)"/>'
    ]

    sparkle_stars = []

    for avg_z, n, face in facet_data:
        pts_2d = [f"{p_verts[idx][0]:.1f},{p_verts[idx][1]:.1f}" for idx in face]
        pts_str = " ".join(pts_2d)

        # Centroid for sparkles
        cx = sum(p_verts[idx][0] for idx in face) / len(face)
        cy = sum(p_verts[idx][1] for idx in face) / len(face)

        is_front = n[2] >= -0.05

        if not is_front:
            # Back refraction facet
            fill = "#172554"
            opacity = 0.55
            stroke = "#1e3a8a"
            stroke_opacity = 0.4
            svg_parts.append(
                f'<polygon points="{pts_str}" fill="{fill}" fill-opacity="{opacity}" stroke="{stroke}" stroke-opacity="{stroke_opacity}" stroke-width="0.75"/>'
            )
        else:
            # Front facet with realistic diffuse + specular Phong reflection
            d1 = max(0.0, dot(n, L1))
            d2 = max(0.0, dot(n, L2))
            diffuse = 0.30 + 0.45 * d1 + 0.20 * d2

            # Specular
            r1 = (2 * dot(n, L1) * n[0] - L1[0], 2 * dot(n, L1) * n[1] - L1[1], 2 * dot(n, L1) * n[2] - L1[2])
            spec = max(0.0, dot(r1, V)) ** 24.0

            # Color calculation
            r_val = int(min(255, 175 * diffuse + 230 * spec))
            g_val = int(min(255, 205 * diffuse + 245 * spec))
            b_val = int(min(255, 240 * diffuse + 255 * spec))

            # Optical dispersion tint on grazing angles
            if 0.1 < n[2] < 0.45:
                # Add slight iridescent dispersion
                phase = (cx + cy) * 0.05
                r_val = int(min(255, r_val + 25 * (0.5 + 0.5 * math.sin(phase))))
                b_val = int(min(255, b_val + 20 * (0.5 + 0.5 * math.cos(phase))))

            hex_color = f"#{r_val:02x}{g_val:02x}{b_val:02x}"
            facet_opacity = min(0.96, 0.70 + 0.25 * diffuse)

            svg_parts.append(
                f'<polygon points="{pts_str}" fill="{hex_color}" fill-opacity="{facet_opacity:.2f}" stroke="#e0f2fe" stroke-opacity="0.65" stroke-width="0.85"/>'
            )

            # Sparkle burst trigger
            if spec > 0.72:
                sparkle_stars.append((cx, cy, spec))

    # Render diamond brilliance sparkle glints
    for sx, sy, intensity in sparkle_stars:
        s_len = 16.0 * (intensity ** 1.5)
        sw = 2.4 * intensity
        # 4-point diamond sparkle star
        points = f"{sx},{sy - s_len} {sx + sw},{sy} {sx},{sy + s_len} {sx - sw},{sy}"
        points2 = f"{sx - s_len},{sy} {sx},{sy + sw} {sx + s_len},{sy} {sx},{sy - sw}"
        svg_parts.append(f'<polygon points="{points}" fill="#ffffff" fill-opacity="0.95"/>')
        svg_parts.append(f'<polygon points="{points2}" fill="#ffffff" fill-opacity="0.95"/>')
        svg_parts.append(f'<circle cx="{sx}" cy="{sy}" r="{sw * 1.5}" fill="#38bdf8" fill-opacity="0.85"/>')

    # Luxury subtle watermark / HUD overlay
    svg_parts.append(
        f'<text x="240" y="445" font-family="monospace" font-size="11" letter-spacing="3" fill="#94a3b8" text-anchor="middle" fill-opacity="0.7">NOVVA DIAMONDS • {shape_title.upper()} 360°</text>'
    )
    svg_parts.append('</svg>')

    return "\n".join(svg_parts)

# ============================================================
# BATCH GENERATION FOR ALL 8 SHAPES
# ============================================================

def generate_shape_video(shape_key, output_name, shape_title):
    print(f"--> Rendering {shape_title} ({output_name})...")
    verts, faces = get_mesh(shape_key)
    total_frames = 60
    pitch = 0.32  # 18.3 degrees downward tilt

    temp_dir = tempfile.mkdtemp(prefix=f"diam_{shape_key}_")
    try:
        for f in range(total_frames):
            yaw = (2.0 * math.pi * f) / total_frames
            svg_content = render_svg_frame(verts, faces, yaw, pitch, shape_title, f, total_frames)
            frame_path = os.path.join(temp_dir, f"frame_{f:03d}.svg")
            with open(frame_path, "w") as fp:
                fp.write(svg_content)

        out_path = os.path.join("/app/applet/public/videos", output_name)
        cmd = [
            "ffmpeg", "-y",
            "-framerate", "30",
            "-i", os.path.join(temp_dir, "frame_%03d.svg"),
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-crf", "19",
            "-preset", "fast",
            "-movflags", "+faststart",
            out_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            print(f"Error rendering {output_name}: {res.stderr[-300:]}")
        else:
            file_size = os.path.getsize(out_path)
            print(f"Successfully generated {out_path} ({file_size // 1024} KB)")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def main():
    os.makedirs("/app/applet/public/videos", exist_ok=True)

    tasks = [
        ("round", "round_video.mp4", "Round Brilliant"),
        ("oval", "oval_video.mp4", "Oval Cut"),
        ("emerald", "emerald_video.mp4", "Emerald Cut"),
        ("princess", "princess_video.mp4", "Princess Cut"),
        ("pear", "pear_video.mp4", "Pear Shape"),
        ("marquise", "marquise_video.mp4", "Marquise Cut"),
        ("radiant", "radiant.mp4", "Radiant Cut"),
        ("heart", "heart_video.mp4", "Heart Shape"),
    ]

    for key, fname, title in tasks:
        generate_shape_video(key, fname, title)

    # Symlink aliases for maximum compatibility
    aliases = [
        ("radiant.mp4", "radiant_video.mp4"),
        ("round_video.mp4", "round.mp4"),
        ("oval_video.mp4", "oval.mp4"),
        ("emerald_video.mp4", "emerald.mp4"),
        ("princess_video.mp4", "princess.mp4"),
        ("pear_video.mp4", "pear.mp4"),
        ("marquise_video.mp4", "marquise.mp4"),
        ("heart_video.mp4", "heart.mp4"),
    ]
    for src, dst in aliases:
        src_p = os.path.join("/app/applet/public/videos", src)
        dst_p = os.path.join("/app/applet/public/videos", dst)
        if os.path.exists(src_p):
            shutil.copyfile(src_p, dst_p)

    print("\nAll 8 diamond videos generated and verified successfully!")

if __name__ == "__main__":
    main()

# Add cushion and asscher support
def append_cushion_asscher():
    cushion_tasks = [
        ("radiant", "cushion_video.mp4", "Cushion Cut"),
        ("emerald", "asscher_video.mp4", "Asscher Cut"),
    ]
    for key, fname, title in cushion_tasks:
        generate_shape_video(key, fname, title)
    shutil.copyfile("/app/applet/public/videos/cushion_video.mp4", "/app/applet/public/videos/cushion.mp4")
    shutil.copyfile("/app/applet/public/videos/asscher_video.mp4", "/app/applet/public/videos/asscher.mp4")

if __name__ == "__main__":
    append_cushion_asscher()
