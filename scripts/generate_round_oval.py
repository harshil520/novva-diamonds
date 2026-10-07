import math
import os
import shutil
import struct
import zlib

def write_png(filename, width, height, rgba_data):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        raw.extend(rgba_data[y * width * 4 : (y + 1) * width * 4])

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    with open(filename, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b''))

def draw_polygon(buf, width, height, pts, r, g, b, a):
    # Scanline polygon rasterizer
    min_y = max(0, int(math.floor(min(p[1] for p in pts))))
    max_y = min(height - 1, int(math.ceil(max(p[1] for p in pts))))

    n = len(pts)
    for y in range(min_y, max_y + 1):
        cy = y + 0.5
        nodes = []
        for i in range(n):
            p1 = pts[i]
            p2 = pts[(i + 1) % n]
            if (p1[1] <= cy < p2[1]) or (p2[1] <= cy < p1[1]):
                if abs(p2[1] - p1[1]) > 1e-6:
                    x = p1[0] + (cy - p1[1]) / (p2[1] - p1[1]) * (p2[0] - p1[0])
                    nodes.append(x)
        nodes.sort()
        for i in range(0, len(nodes) - 1, 2):
            x_start = max(0, int(math.ceil(nodes[i])))
            x_end = min(width - 1, int(math.floor(nodes[i + 1])))
            for x in range(x_start, x_end + 1):
                idx = (y * width + x) * 4
                bg_a = buf[idx + 3] / 255.0
                fg_a = a / 255.0
                out_a = fg_a + bg_a * (1.0 - fg_a)
                if out_a > 1e-4:
                    buf[idx] = int((r * fg_a + buf[idx] * bg_a * (1.0 - fg_a)) / out_a)
                    buf[idx + 1] = int((g * fg_a + buf[idx + 1] * bg_a * (1.0 - fg_a)) / out_a)
                    buf[idx + 2] = int((b * fg_a + buf[idx + 2] * bg_a * (1.0 - fg_a)) / out_a)
                    buf[idx + 3] = int(min(255, out_a * 255))

def draw_circle(buf, width, height, cx, cy, rad, r, g, b, a):
    min_x = max(0, int(cx - rad))
    max_x = min(width - 1, int(cx + rad))
    min_y = max(0, int(cy - rad))
    max_y = min(height - 1, int(cy + rad))
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            d = math.hypot(x - cx, y - cy)
            if d <= rad:
                alpha = a * max(0.0, 1.0 - (d / rad))
                idx = (y * width + x) * 4
                fg_a = alpha / 255.0
                bg_a = buf[idx + 3] / 255.0
                out_a = fg_a + bg_a * (1.0 - fg_a)
                if out_a > 1e-4:
                    buf[idx] = int((r * fg_a + buf[idx] * bg_a * (1.0 - fg_a)) / out_a)
                    buf[idx + 1] = int((g * fg_a + buf[idx + 1] * bg_a * (1.0 - fg_a)) / out_a)
                    buf[idx + 2] = int((b * fg_a + buf[idx + 2] * bg_a * (1.0 - fg_a)) / out_a)
                    buf[idx + 3] = int(min(255, out_a * 255))

def render_round(width=500, height=500):
    buf = bytearray(width * height * 4)
    cx, cy = width / 2.0, height / 2.0
    outer_r = 190.0

    # Draw girdle base
    segments = 32
    outer_pts = []
    for i in range(segments):
        th = i * 2.0 * math.pi / segments
        outer_pts.append((cx + outer_r * math.cos(th), cy + outer_r * math.sin(th)))
    draw_polygon(buf, width, height, outer_pts, 215, 235, 255, 240)

    # Pavilion facets under girdle (16 pairs)
    pav_r = outer_r * 0.70
    mid_pts = [(cx + pav_r * math.cos(i * 2.0 * math.pi / 16), cy + pav_r * math.sin(i * 2.0 * math.pi / 16)) for i in range(16)]

    for i in range(16):
        p1 = outer_pts[i * 2]
        p2 = outer_pts[(i * 2 + 2) % 32]
        pm = mid_pts[i]
        # Alternate facet shading
        sh = 0.75 + 0.25 * math.sin(i * 1.3)
        draw_polygon(buf, width, height, [p1, p2, pm], int(180 * sh), int(210 * sh), int(245 * sh), 230)

    # Crown kite facets (8 kites)
    table_r = outer_r * 0.54
    table_pts = [(cx + table_r * math.cos(i * 2.0 * math.pi / 8), cy + table_r * math.sin(i * 2.0 * math.pi / 8)) for i in range(8)]
    star_r = outer_r * 0.76
    star_pts = [(cx + star_r * math.cos((i + 0.5) * 2.0 * math.pi / 8), cy + star_r * math.sin((i + 0.5) * 2.0 * math.pi / 8)) for i in range(8)]

    for i in range(8):
        t1 = table_pts[i]
        t2 = table_pts[(i + 1) % 8]
        s = star_pts[i]
        # Kite facet
        draw_polygon(buf, width, height, [t1, t2, s], 230, 245, 255, 250)

    for i in range(8):
        t = table_pts[i]
        s1 = star_pts[(i - 1) % 8]
        s2 = star_pts[i]
        g = outer_pts[i * 4]
        draw_polygon(buf, width, height, [t, s1, g], 210, 230, 255, 240)
        draw_polygon(buf, width, height, [t, s2, g], 220, 238, 255, 245)

    # Central table facet (octagon)
    draw_polygon(buf, width, height, table_pts, 245, 250, 255, 255)

    # Inner brilliant culet star
    culet_pts = [(cx + 25 * math.cos(i * 2 * math.pi / 8), cy + 25 * math.sin(i * 2 * math.pi / 8)) for i in range(8)]
    draw_polygon(buf, width, height, culet_pts, 255, 255, 255, 255)

    # Sparkle glints
    draw_circle(buf, width, height, cx - 60, cy - 70, 18, 255, 255, 255, 220)
    draw_circle(buf, width, height, cx + 80, cy - 40, 14, 255, 255, 255, 200)
    draw_circle(buf, width, height, cx + 50, cy + 80, 16, 210, 240, 255, 210)
    draw_circle(buf, width, height, cx - 80, cy + 50, 12, 255, 255, 255, 190)

    return buf

def render_oval(width=500, height=500):
    buf = bytearray(width * height * 4)
    cx, cy = width / 2.0, height / 2.0
    scale_x, scale_y = 150.0, 205.0

    segments = 32
    outer_pts = []
    for i in range(segments):
        th = i * 2.0 * math.pi / segments
        outer_pts.append((cx + scale_x * math.cos(th), cy + scale_y * math.sin(th)))
    draw_polygon(buf, width, height, outer_pts, 215, 235, 255, 240)

    # Mid oval
    mid_pts = []
    for i in range(16):
        th = i * 2.0 * math.pi / 16
        mid_pts.append((cx + scale_x * 0.72 * math.cos(th), cy + scale_y * 0.72 * math.sin(th)))

    for i in range(16):
        p1 = outer_pts[i * 2]
        p2 = outer_pts[(i * 2 + 2) % 32]
        pm = mid_pts[i]
        sh = 0.72 + 0.28 * math.sin(i * 1.4)
        draw_polygon(buf, width, height, [p1, p2, pm], int(185 * sh), int(215 * sh), int(248 * sh), 235)

    # Table oval
    table_pts = []
    for i in range(12):
        th = i * 2.0 * math.pi / 12
        table_pts.append((cx + scale_x * 0.52 * math.cos(th), cy + scale_y * 0.52 * math.sin(th)))

    draw_polygon(buf, width, height, table_pts, 242, 248, 255, 252)

    # Facet lines between table and mid
    for i in range(12):
        t1 = table_pts[i]
        t2 = table_pts[(i + 1) % 12]
        m = mid_pts[int(i * 16 / 12)]
        draw_polygon(buf, width, height, [t1, t2, m], 225, 240, 255, 245)

    # Glints
    draw_circle(buf, width, height, cx - 45, cy - 80, 16, 255, 255, 255, 220)
    draw_circle(buf, width, height, cx + 55, cy - 30, 14, 255, 255, 255, 200)
    draw_circle(buf, width, height, cx + 35, cy + 90, 15, 210, 240, 255, 210)

    return buf

def main():
    os.makedirs('public', exist_ok=True)
    os.makedirs('public/images/diamonds', exist_ok=True)

    print("Rendering round.png...")
    round_buf = render_round()
    write_png('public/round.png', 500, 500, round_buf)
    write_png('public/images/diamonds/round.png', 500, 500, round_buf)

    print("Rendering oval.png...")
    oval_buf = render_oval()
    write_png('public/oval.png', 500, 500, oval_buf)
    write_png('public/images/diamonds/oval.png', 500, 500, oval_buf)

    # Synchronize all shapes
    shapes = ['round', 'oval', 'emerald', 'princess', 'pear', 'cushion', 'marquise', 'radiant', 'asscher', 'heart']
    for s in shapes:
        src = f'public/{s}.png'
        dst = f'public/images/diamonds/{s}.png'
        if os.path.exists(src):
            shutil.copy(src, dst)
        elif os.path.exists(dst):
            shutil.copy(dst, src)

    print("Successfully generated all diamond images in public/ and public/images/diamonds/:")
    for s in shapes:
        p = f'public/{s}.png'
        print(f"  {p}: {os.path.getsize(p)} bytes")

if __name__ == '__main__':
    main()
