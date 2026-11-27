// All HTML entry points are final after Vite and prerender have run.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const tags = '<link rel="stylesheet" href="/site/analytics.css">\n<script defer src="/site/analytics.js"></script>\n';

export function addAnalytics(html) {
  if (html.includes('src="/site/analytics.js"')) return html;
  if (!/<\/head>/i.test(html)) throw new Error("Missing HTML head");
  return html.replace(/<\/head>/i, (end) => tags + end);
}

export async function installAnalytics(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await installAnalytics(path);
    else if (entry.isFile() && entry.name.endsWith(".html") && entry.name !== "404.html") {
      const html = await readFile(path, "utf8");
      await writeFile(path, addAnalytics(html));
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await installAnalytics("dist");
}
