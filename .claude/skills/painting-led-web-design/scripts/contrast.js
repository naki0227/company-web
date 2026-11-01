// 文字ごとに、文字の色と「文字の真後ろの実際の画素」とのコントラスト比を測る（WCAG 2.x の式）
const { chromium } = require('playwright');
const { PNG } = (()=>{ try { return require('pngjs'); } catch(e) { return {}; } })();
(async () => {
  const file = process.argv[2] || 'index.html'; const width = +(process.argv[3]||1280);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width, height: 900 } });
  await p.goto('file://' + process.cwd() + '/' + file); await p.waitForTimeout(800); for (let y=0; y<12000; y+=600){ await p.evaluate(v=>window.scrollTo(0,v), y); await p.waitForTimeout(120);} await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(600);
  // 測る対象: 再現した画面の中（装飾）とスプライト以外の、文字を直接持つ要素
  const items = await p.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const t = walker.currentNode; if (!t.textContent.trim()) continue;
      const el = t.parentElement; if (seen.has(el) || el.closest('.ui, .sprite, details:not([open]) .about, svg')) continue;
      seen.add(el);
      const r = document.createRange(); r.selectNodeContents(t); const rc = r.getBoundingClientRect();
      if (!rc.width) continue;
      const cs = getComputedStyle(el);
      out.push({ text: t.textContent.trim().slice(0, 18), x: rc.left + scrollX, y: rc.top + scrollY, w: rc.width, h: rc.height, color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight, i: out.length });
      el.setAttribute('data-ci', out.length - 1);
    }
    return out;
  });
  // 文字の色を CSS で RGB に解決
  const rgbs = await p.evaluate((cols) => cols.map(c => { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const x = cv.getContext('2d'); x.fillStyle = c; x.fillRect(0,0,1,1); return [...x.getImageData(0,0,1,1).data].slice(0,3); }), items.map(i => i.color));
  // 文字を消して背景だけ撮る
  await p.addStyleTag({ content: '[data-ci]{color:transparent!important;text-shadow:none!important} [data-ci] *{color:transparent!important}' });
  await p.waitForTimeout(200);
  const buf = await p.screenshot({ fullPage: true });
  require('fs').writeFileSync('bgonly.png', buf);
  await b.close();
  console.log(JSON.stringify({ items, rgbs }));
})();
