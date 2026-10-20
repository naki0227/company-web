// Renders the company top (EN and JA) to HTML after `vite build`, so the first paint
// needs no JavaScript. main.tsx hydrates the markup instead of drawing it from scratch.
import { readFile, writeFile } from "node:fs/promises";
import { createElement, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { default: App } = await vite.ssrLoadModule("/src/App.tsx");
  for (const [file, lang] of [["dist/index.html", "en"], ["dist/ja.html", "ja"]]) {
    const html = await readFile(file, "utf8");
    const body = renderToString(createElement(StrictMode, null, createElement(App, { lang })));
    if (!html.includes('<div id="root"></div>')) throw new Error(`${file}: no empty #root`);
    await writeFile(file, html.replace('<div id="root"></div>', `<div id="root">${body}</div>`));
  }
} finally {
  await vite.close();
}
