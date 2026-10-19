import type { Plugin } from "vite";
import { renderCards, type Card } from "./og";
import { loadPosts, type Post } from "./posts";
import { blogIndexPage, feed, notFoundPage, portfolioPage, postPage, sitemap } from "./pages";

/** Every generated text file, keyed by its output path. */
function pages(posts: Post[]) {
  const files = new Map<string, string>([
    ["portfolio.html", portfolioPage(posts)],
    ["blog.html", blogIndexPage(posts)],
    ["404.html", notFoundPage(posts)],
    ["blog/feed.xml", feed(posts.filter((p) => !p.draft))],
    ["sitemap.xml", sitemap(posts.filter((p) => !p.draft))],
  ]);
  for (const post of posts) files.set(`blog/${post.slug}.html`, postPage(post, posts));
  return files;
}

/** Open Graph cards: the two company pages, the portfolio, the blog and every post. */
function cards(posts: Post[]): Card[] {
  const dot = (date: string) => date.replace(/-/g, ".");
  return [
    { file: "og/home.png", kicker: "SOFTWARE STUDIO — OSAKA", title: "Five apps, made and run from Osaka." },
    { file: "og/ja.png", kicker: "ソフトウェアスタジオ — 大阪", title: "大阪で、5つのアプリをつくって、運営しています。" },
    { file: "og/portfolio.png", kicker: "PORTFOLIO — OSAKA, JAPAN", title: "IBUKI NAGASE", variant: "name" },
    { file: "og/blog.png", kicker: "BLOG", title: "つくっているもの、学んだこと、考えたことの記録。" },
    ...posts.map((p) => ({ file: `og/blog/${p.slug}.png`, kicker: `BLOG — ${dot(p.date)}`, title: p.title })),
  ];
}

/** Maps a request path to a generated file the way Vercel's cleanUrls does. */
function fileFor(url: string) {
  const path = decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\/+|\/+$/g, "");
  if (!path || /\.(xml|html|png)$/.test(path)) return path;
  return `${path}.html`;
}

/**
 * Builds /portfolio, /blog, /blog/<slug>, the 404 page, the RSS feed, the sitemap and
 * the Open Graph images from site/profile.ts and content/blog/*.md. Drafts show up in
 * `npm run dev` only.
 */
const LATEST = "virtual:latest-posts";

export function contentPages(): Plugin {
  let root = process.cwd();
  const ogCache = new Map<string, Uint8Array>();
  return {
    name: "enludus-content-pages",
    configResolved(config) {
      root = config.root;
    },
    // The company top lists the newest posts; they are baked in at build time.
    resolveId(id) {
      return id === LATEST ? `\0${LATEST}` : undefined;
    },
    async load(id) {
      if (id !== `\0${LATEST}`) return;
      const posts = await loadPosts(root, { includeDrafts: false });
      const latest = posts.slice(0, 3).map(({ slug, title, date }) => ({ slug, title, date }));
      return `export default ${JSON.stringify(latest)};`;
    },
    configureServer(server) {
      server.watcher.add(`${root}/content`);
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "/";
        if (/^\/ja\/?(\?|$)/.test(url)) {
          req.url = url.replace(/^\/ja\/?/, "/ja.html");
          return next();
        }
        const file = fileFor(url);
        if (!file) return next();
        try {
          const posts = await loadPosts(root, { includeDrafts: true });
          if (file.startsWith("og/")) {
            const card = cards(posts).find((c) => c.file === file);
            if (!card) return next();
            const key = JSON.stringify(card);
            if (!ogCache.has(key)) {
              const [png] = (await renderCards(root, [card], (m) => server.config.logger.warn(m))).values();
              ogCache.set(key, png);
            }
            res.setHeader("Content-Type", "image/png");
            return res.end(ogCache.get(key));
          }
          const body = pages(posts).get(file);
          if (body === undefined) return next();
          res.setHeader("Content-Type", file.endsWith(".xml") ? "application/xml; charset=utf-8" : "text/html; charset=utf-8");
          res.end(body);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(String(error));
        }
      });
    },
    async generateBundle() {
      const posts = await loadPosts(root, { includeDrafts: false });
      for (const [fileName, source] of pages(posts)) {
        this.emitFile({ type: "asset", fileName, source });
      }
      for (const [fileName, source] of await renderCards(root, cards(posts), (m) => this.warn(m))) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },
  };
}
