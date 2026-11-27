import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { addAnalytics, installAnalytics } from "./analytics.mjs";

test("injects exactly once, refuses malformed HTML", () => {
  const html = "<html><head></head><body></body></html>";
  const result = addAnalytics(html);
  assert.match(result, /analytics\.js"><\/script>\n<\/head>/);
  assert.equal(addAnalytics(result), result);
  assert.throws(() => addAnalytics("<html>"));
});

test("covers nested static and generated HTML but not XML or 404", async () => {
  const dir = await mkdtemp(join(tmpdir(), "enludus-ga4-"));
  const html = "<head></head>";
  try {
    await mkdir(join(dir, "blog"));
    for (const name of ["index.html", "blog/post.html", "404.html", "sitemap.xml"]) {
      await writeFile(join(dir, name), html);
    }
    await installAnalytics(dir);
    for (const name of ["index.html", "blog/post.html"]) {
      assert.match(await readFile(join(dir, name), "utf8"), /analytics\.js/);
    }
    for (const name of ["404.html", "sitemap.xml"]) {
      assert.equal(await readFile(join(dir, name), "utf8"), html);
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});

const source = await readFile(new URL("../public/site/analytics.js", import.meta.url), "utf8");
function browser(initial, hostname = "enludus.com") {
  const controls = new Map();
  const scripts = [];
  const window = {};
  let value = initial, reloads = 0;
  function element() {
    return { hidden: true, setAttribute() {}, focus() {},
      addEventListener(_, fn) { this.click = fn; },
      querySelector(selector) {
        if (!controls.has(selector)) controls.set(selector, element());
        return controls.get(selector);
      },
    };
  }
  const document = {
    documentElement: { lang: "ja" }, referrer: "", cookie: "",
    createElement: element, head: { append: (script) => scripts.push(script) },
    body: { append() {} },
  };
  runInNewContext(source, { window, document, location: {
    protocol: "https:", hostname, origin: "https://" + hostname, pathname: "/blog",
    reload() { reloads++; },
  }, localStorage: { getItem: () => value, setItem: (_, v) => { value = v; } }, URL });
  return { controls, scripts, window, reloads: () => reloads, value: () => value };
}

test("no tag before consent; refusal never loads; consent loads once; withdrawal disables", () => {
  const b = browser(null);
  assert.equal(b.scripts.length, 0);
  b.controls.get("[data-deny]").click();
  assert.equal(b.value(), "denied");
  assert.equal(b.scripts.length, 0);
  b.controls.get("[data-allow]").click();
  b.controls.get("[data-allow]").click();
  assert.equal(b.scripts.length, 1);
  assert.match(b.scripts[0].src, /G-QH59YMTGL8$/);
  assert.equal(b.window.dataLayer.filter((args) => args[0] === "config").length, 1);
  b.controls.get("[data-deny]").click();
  assert.equal(b.window["ga-disable-G-QH59YMTGL8"], true);
  assert.equal(b.reloads(), 1);
});
test("saved preferences and preview isolation", () => {
  assert.equal(browser("granted").scripts.length, 1);
  assert.equal(browser("denied").scripts.length, 0);
  assert.equal(browser("granted", "preview.vercel.app").scripts.length, 0);
});
