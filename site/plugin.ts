import type { Plugin } from "vite";
import { loadPosts, type Post } from "./posts";
import { blogIndexPage, feed, portfolioPage, postPage, sitemap } from "./pages";

/** Every generated file, keyed by its output path. */
function pages(posts: Post[]) {
  const files = new Map<string, string>([
    ["portfolio.html", portfolioPage(posts)],
    ["blog.html", blogIndexPage(posts)],
    ["blog/feed.xml", feed(posts.filter((p) => !p.draft))],
    ["sitemap.xml", sitemap(posts.filter((p) => !p.draft))],
  ]);
  posts.forEach((post, i) => {
    files.set(`blog/${post.slug}.html`, postPage(post, posts[i - 1], posts[i + 1]));
  });
  return files;
}

/** Maps a request path to a generated file the way Vercel's cleanUrls does. */
function fileFor(url: string) {
  const path = decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\/+|\/+$/g, "");
  if (!path || /\.(xml|html)$/.test(path)) return path;
  return `${path}.html`;
}

/**
 * Builds /portfolio, /blog, /blog/<slug>, the RSS feed and the sitemap as static
 * HTML from site/profile.ts and content/blog/*.md. Drafts show up in `npm run dev`
 * only.
 */
export function contentPages(): Plugin {
  let root = process.cwd();
  return {
    name: "enludus-content-pages",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.watcher.add(`${root}/content`);
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "/";
        if (/^\/ja\/?(\?|$)/.test(url)) {
          req.url = url.replace(/^\/ja\/?/, "/ja.html");
          return next();
        }
        const file = fileFor(url);
        if (!file) return next();
        let body: string | undefined;
        try {
          body = pages(loadPosts(root, { includeDrafts: true })).get(file);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          return res.end(String(error));
        }
        if (body === undefined) return next();
        res.setHeader("Content-Type", file.endsWith(".xml") ? "application/xml; charset=utf-8" : "text/html; charset=utf-8");
        res.end(body);
      });
    },
    generateBundle() {
      for (const [fileName, source] of pages(loadPosts(root, { includeDrafts: false }))) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },
  };
}
