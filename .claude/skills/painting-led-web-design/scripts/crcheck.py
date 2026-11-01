import json,sys
from PIL import Image
d=json.load(open(sys.argv[1])); im=Image.open('bgonly.png').convert('RGB')
def lum(c):
    def f(v):
        v/=255; return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
    r,g,b=c; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
bad=0;total=0
for it,rgb in zip(d['items'],d['rgbs']):
    xs=range(int(it['x']),int(it['x']+it['w']),3); ys=range(int(it['y']),int(it['y']+it['h']),3)
    px=[im.getpixel((x,y)) for x in xs for y in ys if 0<=x<im.width and 0<=y<im.height]
    if not px: continue
    crs=sorted(cr(rgb,p) for p in px); p10=crs[int(len(crs)*0.1)]
    large = it['size']>=24 or (it['size']>=18.66 and it['weight']>=700)
    need = 3.0 if large else 4.5; total+=1
    if p10<need: bad+=1; print(f"NG {p10:.2f} need {need} {it['size']:.0f}px {it['text']}")
print(f"{bad}/{total} NG")
