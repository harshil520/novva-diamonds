import math
import os
import subprocess

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

def project(v, width=512, height=512, fov=390, cam_z=4.1):
    denom = cam_z - v[2]
    if denom < 0.1:
        denom = 0.1
    scale = fov / denom
    sx = width / 2.0 + v[0] * scale
    sy = height / 2.0 - v[1] * scale
    return (sx, sy, v[2])

def get_mesh(shape_name):
    shape = shape_name.lower()
    verts = []
    faces = []

    if "round" in shape:
        table_r, table_y = 0.68, 0.48
        for i in range(8):
            a = i * math.pi / 4.0
            verts.append((table_r * math.cos(a), table_y, table_r * math.sin(a)))
        star_r, star_y = 0.92, 0.30
        for i in range(8):
            a = (i + 0.5) * math.pi / 4.0
            verts.append((star_r * math.cos(a), star_y, star_r * math.sin(a)))
        girdle_r, girdle_y = 1.18, 0.0
        for i in range(16):
            a = i * math.pi / 8.0
            verts.append((girdle_r * math.cos(a), girdle_y, girdle_r * math.sin(a)))
        for i in range(16):
            a = i * math.pi / 8.0
            verts.append((girdle_r * math.cos(a), -0.06, girdle_r * math.sin(a)))
        pav_r, pav_y = 0.62, -0.55
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
        scale_x, scale_z = 0.86, 1.34
        table_r, table_y = 0.64, 0.48
        for i in range(8):
            a = i * math.pi / 4.0
            verts.append((table_r * math.cos(a) * scale_x, table_y, table_r * math.sin(a) * scale_z))
        star_r, star_y = 0.90, 0.30
        for i in range(8):
            a = (i + 0.5) * math.pi / 4.0
            verts.append((star_r * math.cos(a) * scale_x, star_y, star_r * math.sin(a) * scale_z))
        girdle_r = 1.16
        for i in range(16):
            a = i * math.pi / 8.0
            verts.append((girdle_r * math.cos(a) * scale_x, 0.0, girdle_r * math.sin(a) * scale_z))
        for i in range(16):
            a = i * math.pi / 8.0
            verts.append((girdle_r * math.cos(a) * scale_x, -0.06, girdle_r * math.sin(a) * scale_z))
        for i in range(8):
            a = (i + 0.5) * math.pi / 4.0
            verts.append((0.60 * math.cos(a) * scale_x, -0.55, 0.60 * math.sin(a) * scale_z))
        culet_idx = len(verts); verts.append((0, -1.05, 0))
        tc_idx = len(verts); verts.append((0, table_y, 0))

        for i in range(8):
            faces.append([tc_idx, (i + 1) % 8, i])
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

    elif "emerald" in shape or "asscher" in shape:
        is_asscher = "asscher" in shape
        aspect_ratio = 1.05 if is_asscher else 1.48
        w = 1.25
        d = w * aspect_ratio
        ch = 0.32

        def oct_ring(scale_w, scale_d, ch_v, y_v):
            hw, hd = scale_w * 0.5, scale_d * 0.5
            return [
                (hw - ch_v, y_v, hd), (hw, y_v, hd - ch_v),
                (hw, y_v, -hd + ch_v), (hw - ch_v, y_v, -hd),
                (-hw + ch_v, y_v, -hd), (-hw, y_v, -hd + ch_v),
                (-hw, y_v, hd - ch_v), (-hw + ch_v, y_v, hd)
            ]
        t_pts = oct_ring(w * 0.68, d * 0.68, ch * 0.65, 0.50)
        s_pts = oct_ring(w * 0.85, d * 0.85, ch * 0.82, 0.28)
        g_pts = oct_ring(w, d, ch, 0.0)
        gl_pts = oct_ring(w, d, ch, -0.06)
        p1_pts = oct_ring(w * 0.72, d * 0.72, ch * 0.70, -0.45)
        p2_pts = oct_ring(w * 0.40, d * 0.40, ch * 0.40, -0.80)
        keel1 = (0, -1.05, 0.28 if not is_asscher else 0)
        keel2 = (0, -1.05, -0.28 if not is_asscher else 0)
        t_center = (0, 0.50, 0)

        verts.extend(t_pts); verts.extend(s_pts); verts.extend(g_pts)
        verts.extend(gl_pts); verts.extend(p1_pts); verts.extend(p2_pts)
        k1_idx = len(verts); verts.append(keel1)
        k2_idx = len(verts); verts.append(keel2)
        tc_idx = len(verts); verts.append(t_center)

        for i in range(8):
            faces.append([tc_idx, (i + 1) % 8, i])
        for i in range(8):
            ni = (i + 1) % 8
            faces.append([i, ni, 8 + ni])
            faces.append([i, 8 + ni, 8 + i])
            faces.append([8 + i, 8 + ni, 16 + ni])
            faces.append([8 + i, 16 + ni, 16 + i])
            faces.append([24 + i, 24 + ni, 32 + ni])
            faces.append([24 + i, 32 + ni, 32 + i])
            faces.append([32 + i, 32 + ni, 40 + ni])
            faces.append([32 + i, 40 + ni, 40 + i])
        for i in range(4):
            faces.append([40 + i, 40 + (i + 1) % 8, k1_idx])
        for i in range(4, 8):
            faces.append([40 + i, 40 + (i + 1) % 8, k2_idx])
        faces.append([k1_idx, k2_idx, 40])
        faces.append([k2_idx, k1_idx, 44])

    elif "princess" in shape:
        hw_t = 0.74
        t_pts = [(hw_t, 0.48, hw_t), (hw_t, 0.48, -hw_t), (-hw_t, 0.48, -hw_t), (-hw_t, 0.48, hw_t)]
        hw_g = 1.18
        g_pts = [(hw_g, 0.0, hw_g), (hw_g, 0.0, 0), (hw_g, 0.0, -hw_g),
                 (0, 0.0, -hw_g), (-hw_g, 0.0, -hw_g), (-hw_g, 0.0, 0),
                 (-hw_g, 0.0, hw_g), (0, 0.0, hw_g)]
        gl_pts = [(p[0], -0.06, p[2]) for p in g_pts]
        culet = (0, -1.15, 0)
        tc = (0, 0.48, 0)

        verts.extend(t_pts); verts.extend(g_pts); verts.extend(gl_pts)
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
                r = 0.62
                t_pts.append((r * math.cos(a), 0.48, r * math.sin(a) + 0.15))
            else:
                t = (i - 4) / 4.0
                t_pts.append((0.55 * (1 - t * 0.8) * math.cos(a), 0.48, -0.65 * t - 0.1))

        g_pts = []
        for i in range(16):
            a = i * math.pi / 8.0
            if i <= 8:
                r = 1.18
                g_pts.append((r * math.cos(a), 0.0, r * math.sin(a) + 0.2))
            else:
                t = (i - 8) / 8.0
                px = (1 - t) * 1.18 * math.cos(a) * 0.65
                pz = -0.1 - 1.45 * t
                g_pts.append((px, 0.0, pz))

        gl_pts = [(p[0], -0.06, p[2]) for p in g_pts]
        culet = (0, -1.05, -0.2)
        tc = (0, 0.48, 0.05)

        verts.extend(t_pts); verts.extend(g_pts); verts.extend(gl_pts)
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

    elif "cushion" in shape:
        def cushion_pts(r, y_val):
            pts = []
            for i in range(16):
                a = i * math.pi / 8.0
                # Superellipse formula
                x = r * (math.cos(a) * abs(math.cos(a)) ** 0.5) if math.cos(a) >= 0 else -r * (abs(math.cos(a)) ** 1.5)
                z = r * (math.sin(a) * abs(math.sin(a)) ** 0.5) if math.sin(a) >= 0 else -r * (abs(math.sin(a)) ** 1.5)
                pts.append((x * 1.08, y_val, z * 1.08))
            return pts

        g_pts = cushion_pts(1.15, 0.0)
        gl_pts = [(p[0], -0.06, p[2]) for p in g_pts]
        t_pts = []
        for i in range(8):
            a = i * math.pi / 4.0
            x = 0.65 * (math.cos(a) * abs(math.cos(a)) ** 0.5) if math.cos(a) >= 0 else -0.65 * (abs(math.cos(a)) ** 1.5)
            z = 0.65 * (math.sin(a) * abs(math.sin(a)) ** 0.5) if math.sin(a) >= 0 else -0.65 * (abs(math.sin(a)) ** 1.5)
            t_pts.append((x * 1.08, 0.48, z * 1.08))

        culet = (0, -1.05, 0)
        tc = (0, 0.48, 0)

        verts.extend(t_pts); verts.extend(g_pts); verts.extend(gl_pts)
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
            z = 1.58 * math.sin(a)
            g_pts.append((x, 0.0, z))

        t_pts = []
        for i in range(8):
            a = i * math.pi / 4.0
            x = 0.50 * math.cos(a) * (1 - 0.30 * abs(math.sin(a)))
            z = 0.98 * math.sin(a)
            t_pts.append((x, 0.48, z))

        gl_pts = [(p[0], -0.06, p[2]) for p in g_pts]
        culet = (0, -1.05, 0)
        tc = (0, 0.48, 0)

        verts.extend(t_pts); verts.extend(g_pts); verts.extend(gl_pts)
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

        verts.extend(t_pts); verts.extend(s_pts); verts.extend(g_pts); verts.extend(gl_pts)
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

        verts.extend(t_pts); verts.extend(g_pts); verts.extend(gl_pts)
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

def render_isolated_transparent_svg(verts, faces, yaw=0.25, pitch=0.38):
    t_verts = [rotate_y_x(v, yaw, pitch) for v in verts]
    p_verts = [project(v, 512, 512, 400, 4.0) for v in t_verts]

    # Precompute facet data
    facet_data = []
    L1 = normalize((0.65, 1.25, 1.35))   # Key light
    L2 = normalize((-0.80, 0.50, 0.95))  # Rim light
    V = (0, 0, 1)                        # View vector

    for face in faces:
        p0, p1, p2 = t_verts[face[0]], t_verts[face[1]], t_verts[face[2]]
        v0 = (p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2])
        v1 = (p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2])
        n = normalize(cross(v0, v1))
        avg_z = sum(t_verts[idx][2] for idx in face) / len(face)
        facet_data.append((avg_z, n, face))

    # Painter's algorithm sort
    facet_data.sort(key=lambda item: item[0])

    svg_parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" style="background: transparent;">',
        '<defs>',
        '  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">',
        '    <feGaussianBlur stdDeviation="3" result="blur"/>',
        '    <feComposite in="SourceGraphic" in2="blur" operator="over"/>',
        '  </filter>',
        '</defs>'
    ]

    sparkles = []

    for avg_z, n, face in facet_data:
        pts_2d = [f"{p_verts[idx][0]:.1f},{p_verts[idx][1]:.1f}" for idx in face]
        pts_str = " ".join(pts_2d)

        cx = sum(p_verts[idx][0] for idx in face) / len(face)
        cy = sum(p_verts[idx][1] for idx in face) / len(face)

        is_front = n[2] >= -0.05

        if not is_front:
            # Back refraction crystal facet
            svg_parts.append(
                f'<polygon points="{pts_str}" fill="#1e293b" fill-opacity="0.5" stroke="#334155" stroke-opacity="0.5" stroke-width="0.7"/>'
            )
        else:
            d1 = max(0.0, dot(n, L1))
            d2 = max(0.0, dot(n, L2))
            diffuse = 0.32 + 0.48 * d1 + 0.20 * d2

            # Specular flash
            r1 = (2 * dot(n, L1) * n[0] - L1[0], 2 * dot(n, L1) * n[1] - L1[1], 2 * dot(n, L1) * n[2] - L1[2])
            spec = max(0.0, dot(r1, V)) ** 22.0

            r_val = int(min(255, 185 * diffuse + 235 * spec))
            g_val = int(min(255, 215 * diffuse + 245 * spec))
            b_val = int(min(255, 245 * diffuse + 255 * spec))

            # Optical dispersion tint
            if 0.12 < n[2] < 0.48:
                phase = (cx * 0.04 + cy * 0.04)
                r_val = int(min(255, r_val + 24 * (0.5 + 0.5 * math.sin(phase))))
                b_val = int(min(255, b_val + 20 * (0.5 + 0.5 * math.cos(phase))))

            hex_color = f"#{r_val:02x}{g_val:02x}{b_val:02x}"
            facet_opacity = min(0.96, 0.75 + 0.22 * diffuse)

            svg_parts.append(
                f'<polygon points="{pts_str}" fill="{hex_color}" fill-opacity="{facet_opacity:.2f}" stroke="#f8fafc" stroke-opacity="0.75" stroke-width="0.85"/>'
            )

            if spec > 0.68:
                sparkles.append((cx, cy, spec))

    # Add diamond sparkle glints
    for sx, sy, intensity in sparkles[:6]:
        s_len = 16.0 * (intensity ** 1.3)
        sw = 2.4 * intensity
        p1 = f"{sx},{sy - s_len} {sx + sw},{sy} {sx},{sy + s_len} {sx - sw},{sy}"
        p2 = f"{sx - s_len},{sy} {sx},{sy + sw} {sx + s_len},{sy} {sx},{sy - sw}"
        svg_parts.append(f'<polygon points="{p1}" fill="#ffffff" fill-opacity="0.95" filter="url(#glow)"/>')
        svg_parts.append(f'<polygon points="{p2}" fill="#ffffff" fill-opacity="0.95" filter="url(#glow)"/>')
        svg_parts.append(f'<circle cx="{sx}" cy="{sy}" r="{sw * 1.5}" fill="#38bdf8" fill-opacity="0.85"/>')

    svg_parts.append('</svg>')
    return "\n".join(svg_parts)

def main():
    target_dir = "/app/applet/public/images/diamonds"
    os.makedirs(target_dir, exist_ok=True)

    shapes = [
        "round",
        "oval",
        "emerald",
        "princess",
        "pear",
        "cushion",
        "marquise",
        "radiant",
        "asscher",
        "heart"
    ]

    for s in shapes:
        print(f"Generating transparent diamond image for: {s}")
        verts, faces = get_mesh(s)
        svg_content = render_isolated_transparent_svg(verts, faces)

        svg_path = os.path.join(target_dir, f"{s}.svg")
        png_path = os.path.join(target_dir, f"{s}.png")

        with open(svg_path, "w") as fp:
            fp.write(svg_content)

        # Convert SVG to high-quality transparent PNG using ImageMagick
        cmd = ["convert", "-background", "none", svg_path, png_path]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode == 0:
            print(f"Successfully created: {png_path} ({os.path.getsize(png_path)} bytes)")
        else:
            print(f"ImageMagick notice: using SVG as base ({res.stderr})")

    print("\nAll diamond transparent images generated successfully!")

if __name__ == "__main__":
    main()
