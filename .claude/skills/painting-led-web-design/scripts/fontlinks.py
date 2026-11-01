# ページで使う文字だけを含む Google Fonts の <link> を作り、HTML に差し込む（文言を変えたら再実行する）
import json, sys, subprocess, urllib.parse, re
src = sys.argv[1]
html = open(src).read()
# 一時的に完全な HTML にしてから文字を集める
tmp = '_fl.html'
open(tmp, 'w').write('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>')
d = json.loads(subprocess.check_output(['node', __import__('os').path.join(__import__('os').path.dirname(__file__), 'subset.js'), tmp]))
digits = '0123456789:.'
spec = [('Zen Old Mincho', 'Zen+Old+Mincho:wght@500', ''), ('Zen Kaku Gothic New', 'Zen+Kaku+Gothic+New:wght@400;500', ''),
        ('Cormorant Garamond', 'Cormorant+Garamond:ital,wght@1,500', digits), ('Unbounded', 'Unbounded:wght@700', digits)]
links = []
for fam, q, extra in spec:
    chars = ''.join(sorted(set(d.get(fam, '') + extra) - set('\n\t ')))
    links.append(f'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={q}&display=swap&text={urllib.parse.quote(chars)}">')
block = '<!-- fonts:start -->\n' + '\n'.join(links) + '\n<!-- fonts:end -->'
if '<!-- fonts:start -->' in html:
    html = re.sub(r'<!-- fonts:start -->.*?<!-- fonts:end -->', block, html, flags=re.S)
else:
    html = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/css2\?[^"]*">', block, html, count=1)
open(src, 'w').write(html); print('ok', [len(l) for l in links])
