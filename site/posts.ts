import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Marked, Renderer } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

export type Post = {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  description: string;
  tags: string[];
  draft: boolean;
  /** "tech" for deep technical write-ups, "story" (default) for readable posts. */
  kind: "story" | "tech";
  html: string;
  toc: { id: string; text: string }[];
  minutes: number;
};

const SLUG = /^[a-z0-9][a-z0-9-]*$/;

/** Reads the small YAML subset used in post front matter: `key: value` and `key: [a, b]`. */
function frontMatter(source: string, file: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) throw new Error(`${file}: front matter (--- ... ---) is missing`);
  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const pair = /^([A-Za-z]+):\s*(.*)$/.exec(line);
    if (!pair) throw new Error(`${file}: cannot read front matter line "${line}"`);
    const raw = pair[2].trim();
    data[pair[1]] = raw.startsWith("[")
      ? raw.slice(1, -1).split(",").map(unquote).filter(Boolean)
      : unquote(raw);
  }
  return { data, body: source.slice(match[0].length) };
}

function unquote(value: string) {
  const v = value.trim();
  return /^(["']).*\1$/.test(v) ? v.slice(1, -1) : v;
}

function attr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function plain(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ");
}

// Code is coloured once at build time, so posts ship no highlighting JavaScript.
const LANGS = [
  "bash", "css", "diff", "go", "html", "javascript", "json", "jsx", "markdown",
  "python", "rust", "sql", "swift", "toml", "tsx", "typescript", "yaml",
];
const ALIASES: Record<string, string> = { sh: "bash", shell: "bash", js: "javascript", ts: "typescript", md: "markdown", yml: "yaml", py: "python", rs: "rust" };
let highlighter: Promise<Highlighter> | undefined;

/** Pixel size of a WebP, PNG or JPEG, so images reserve their space before they load. */
function imageSize(file: string): [number, number] | undefined {
  if (!existsSync(file)) return undefined;
  const b = readFileSync(file);
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === "VP8L") {
      const bits = b.readUInt32LE(21);
      return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
    }
    if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9; ) {
      if (b[i] !== 0xff) return undefined;
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return undefined;
}

/**
 * `![alt](/img/blog/x.webp "caption")` becomes a figure with its size set, and
 * `![alt](/img/blog/x.mp4 "caption")` a video that loads nothing until played; it
 * uses the .webp next to it (same name) as its poster. Portrait media stays narrow.
 */
function media(root: string, href: string, alt: string, caption: string) {
  const video = /\.(mp4|webm)$/.test(href);
  const poster = video ? href.replace(/\.(mp4|webm)$/, ".webp") : href;
  const size = href.startsWith("/") ? imageSize(join(root, "public", poster)) : undefined;
  const dims = size ? ` width="${size[0]}" height="${size[1]}"` : "";
  const tall = size && size[1] > size[0] * 1.2 ? " is-tall" : "";
  const body = video
    ? `<video src="${attr(href)}"${size ? ` poster="${attr(poster)}"` : ""}${dims} controls playsinline preload="none" aria-label="${attr(alt)}"></video>`
    : `<img src="${attr(href)}" alt="${attr(alt)}"${dims} loading="lazy" decoding="async">`;
  const cap = caption ? `<figcaption>${caption}</figcaption>` : "";
  return `<figure class="media${tall}">${body}${cap}</figure>`;
}

function codeBlock(shiki: Highlighter, text: string, lang = "") {
  const name = ALIASES[lang] ?? lang;
  const known = LANGS.includes(name);
  const html = shiki.codeToHtml(text, { lang: known ? name : "text", theme: "vitesse-dark" });
  const label = known ? `<span class="code-lang">${attr(lang)}</span>` : "";
  return `<div class="code">${label}${html}</div>\n`;
}

function render(markdown: string, shiki: Highlighter, root: string) {
  const toc: Post["toc"] = [];
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        if (depth !== 2) return `<h${depth}>${inner}</h${depth}>\n`;
        const id = `s${toc.length + 1}`;
        toc.push({ id, text: plain(inner) });
        return `<h2 id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h2>\n`;
      },
      image({ href, title, text }) {
        return media(root, href, text, title ? attr(title) : "");
      },
      paragraph(token) {
        // An image on its own line is a figure, not text inside a <p>.
        const only = token.tokens.filter((t) => !(t.type === "text" && !t.raw.trim()));
        if (only.length === 1 && only[0].type === "image") return this.parser.parseInline(only) + "\n";
        return Renderer.prototype.paragraph.call(this, token);
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const t = title ? ` title="${attr(title)}"` : "";
        const external = /^https?:\/\//.test(href) && !href.startsWith("https://enludus.com");
        const rel = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${attr(href)}"${t}${rel}>${inner}</a>`;
      },
      code({ text, lang }) {
        return codeBlock(shiki, text, lang?.split(/\s/)[0]);
      },
      table(token) {
        // Wide tables scroll inside the article instead of widening the page.
        return `<div class="table-wrap">${Renderer.prototype.table.call(this, token)}</div>`;
      },
    },
  });
  const html = marked.parse(markdown, { async: false });
  return { html, toc };
}

export async function loadPosts(root: string, { includeDrafts }: { includeDrafts: boolean }) {
  const dir = join(root, "content/blog");
  if (!existsSync(dir)) return [];
  highlighter ??= createHighlighter({ themes: ["vitesse-dark"], langs: LANGS });
  const shiki = await highlighter;
  const posts: Post[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const slug = file.slice(0, -3);
    if (!SLUG.test(slug)) {
      throw new Error(`content/blog/${file}: use lowercase letters, digits and "-" in the file name`);
    }
    const { data, body } = frontMatter(readFileSync(join(dir, file), "utf8"), `content/blog/${file}`);
    const title = String(data.title ?? "");
    const date = String(data.date ?? "");
    if (!title) throw new Error(`content/blog/${file}: title is required`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`content/blog/${file}: date must look like 2026-10-19`);
    }
    const draft = data.draft === "true";
    if (draft && !includeDrafts) continue;
    const { html, toc } = render(body, shiki, root);
    const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [String(data.tags)] : [];
    posts.push({
      slug,
      title,
      date,
      updated: data.updated ? String(data.updated) : undefined,
      description: String(data.description ?? ""),
      tags,
      draft,
      kind: data.type === "tech" ? "tech" : "story",
      html,
      toc,
      // Japanese reads at roughly 500 characters a minute.
      minutes: Math.max(1, Math.round(plain(html).replace(/\s+/g, "").length / 500)),
    });
  }
  return posts.sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
}
