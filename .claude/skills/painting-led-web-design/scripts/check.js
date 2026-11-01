// 合格基準のうち、ブラウザで測れるものをまとめて調べる
const { chromium } = require('playwright');
const file = process.argv[2] || 'preview.html';
(async () => {
  const b = await chromium.launch(); const fails = []; const notes = [];
  for (const w of [360, 390, 768, 1280, 1920]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + process.cwd() + '/' + file); await p.waitForTimeout(800);
    for (let y = 0; y < 12000; y += 700) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(80); }
    const r = await p.evaluate(() => {
      const out = { overflow: document.documentElement.scrollWidth - innerWidth, targets: [], orphans: [], unlabeled: [] };
      // タップ領域（文中のリンクは除く）
      document.querySelectorAll('a, button, summary').forEach(el => {
        const rc = el.getBoundingClientRect(); const inline = el.closest('p') && el.tagName === 'A';
        if (!inline && (rc.width < 44 || rc.height < 44)) out.targets.push(`${el.textContent.trim().slice(0, 12)} ${Math.round(rc.width)}x${Math.round(rc.height)}`);
      });
      // 見出しの泣き別れ（2文字以下の行）
      document.querySelectorAll('h1, h2').forEach(h => {
        const range = document.createRange(); const lines = new Map();
        const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) { const t = walker.currentNode; if (t.parentElement.closest('small')) continue;
          for (let i = 0; i < t.length; i++) { range.setStart(t, i); range.setEnd(t, i + 1); const rc = range.getBoundingClientRect(); if (!rc.width) continue; const k = Math.round(rc.top); lines.set(k, (lines.get(k) || '') + t.data[i]); } }
        for (const s of lines.values()) if (s.trim().length <= 2) out.orphans.push(`「${h.textContent.trim().slice(0, 14)}」の行「${s}」`);
      });
      // 意味のある図にラベルがあるか
      document.querySelectorAll('[role="img"]').forEach(el => { if (!el.getAttribute('aria-label')) out.unlabeled.push(el.className); });
      document.querySelectorAll('img').forEach(el => { if (!el.hasAttribute('alt')) out.unlabeled.push('img ' + el.src); });
      document.querySelectorAll('svg:not([aria-hidden]):not([role])').forEach(el => { if (!el.closest('[aria-hidden],[role="img"]')) out.unlabeled.push('svg ' + el.getAttribute('class')); });
      return out;
    });
    if (r.overflow > 0) fails.push(`${w}px 横スクロール ${r.overflow}px`);
    r.targets.forEach(t => fails.push(`${w}px タップ領域 44px 未満: ${t}`));
    r.orphans.forEach(t => fails.push(`${w}px 見出しの泣き別れ: ${t}`));
    if (w === 1280) r.unlabeled.forEach(t => fails.push(`ラベルなし: ${t}`));
    errs.forEach(e => fails.push(`${w}px コンソールのエラー: ${e}`));
    await p.close();
  }
  // 動きを減らす設定で、アニメーションが残っていないか
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await p.goto('file://' + process.cwd() + '/' + file); await p.waitForTimeout(500);
  const anim = await p.evaluate(() => document.getAnimations().length);
  if (anim) fails.push(`reduced motion でもアニメーション ${anim} 件`);
  await b.close();
  console.log(fails.length ? fails.join('\n') : 'すべて合格');
  process.exit(fails.length ? 1 : 0);
})();
