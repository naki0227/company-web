"""名画の色を測る: 代表色（面積つき、OKLCH）、明るさの分布、暖色と寒色の割合。
使い方: python3 -I measure_painting.py 画像ファイル [色の数]
"""
import sys, math
from PIL import Image

def to_oklch(rgb):
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(v / 255) for v in rgb)
    l = (0.4122214708*r + 0.5363325363*g + 0.0514459929*b) ** (1/3)
    m = (0.2119034982*r + 0.6806995451*g + 0.1073969566*b) ** (1/3)
    s = (0.0883024619*r + 0.2817188376*g + 0.6299787005*b) ** (1/3)
    L = 0.2104542553*l + 0.7936177850*m - 0.0040720453*s
    a = 1.9779984951*l - 2.4285922050*m + 0.4505937099*s
    bb = 0.0259040371*l + 0.7827717662*m - 0.8086757660*s
    return L, math.hypot(a, bb), (math.degrees(math.atan2(bb, a)) + 360) % 360

def warmth(C, h):
    if C < 0.02: return 'neutral'
    return 'warm' if (h < 110 or h > 340) else ('cool' if 160 <= h <= 300 else 'other')

def measure(path, k=8):
    im = Image.open(path).convert('RGB'); im.thumbnail((400, 400))
    px = list(im.getdata()) if not hasattr(im, 'get_flattened_data') else list(im.get_flattened_data())
    q = im.quantize(colors=k, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette(); counts = sorted(q.getcolors(), reverse=True); tot = sum(c for c, _ in counts)
    clusters = []
    for c, i in counts:
        rgb = tuple(pal[i*3:i*3+3]); L, C, h = to_oklch(rgb)
        clusters.append({'share': c / tot, 'hex': '#%02X%02X%02X' % rgb, 'L': L, 'C': C, 'h': h, 'temp': warmth(C, h)})
    Ls = sorted(to_oklch(p)[0] for p in px[::5]); n = len(Ls)
    temp = {}
    for p in px[::5]:
        L, C, h = to_oklch(p); t = warmth(C, h); temp[t] = temp.get(t, 0) + 1
    return clusters, (Ls[int(n*.05)], Ls[n//2], Ls[int(n*.95)]), {k: v / sum(temp.values()) for k, v in temp.items()}

if __name__ == '__main__':
    path = sys.argv[1]; k = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    clusters, (l5, l50, l95), temp = measure(path, k)
    print(f'## {path}')
    print(f'明るさ L: 5%={l5:.2f} 中央={l50:.2f} 95%={l95:.2f}（幅 {l95-l5:.2f}）  色温度: ' + ', '.join(f'{k} {v*100:.0f}%' for k, v in sorted(temp.items())))
    for c in clusters:
        print(f"  {c['share']*100:4.0f}%  {c['hex']}  L{c['L']:.2f} C{c['C']:.3f} h{c['h']:4.0f}  {c['temp']}")
