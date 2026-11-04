// 配る資料を PDF にする：node scripts/print/render.mjs
// scripts/print/*.html を A4 で書き出して public/products/ に置く（Chromium の印刷。playwright を使う）
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// playwright はこのリポジトリの依存に入れていない。require なら NODE_PATH の playwright も使える
const { chromium } = createRequire(import.meta.url)('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const jobs = [['studyreel-school-guide.html', '../../public/products/studyreel-school-guide.pdf']];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [src, out] of jobs) {
  await page.goto('file://' + path.join(here, src), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(here, out), format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log(out);
}
await browser.close();
