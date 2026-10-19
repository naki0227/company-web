# Enludus Company Web

Official company / studio website for **Enludus**.

A single-page site built with Vite, React and TypeScript, in lp-anatomy's "warm" mood (modelled on Bikkuri Donkey): two paper colours with oval edges, the logo's three colours only, hand-drawn SVG illustrations in those colours (`src/illustrations.tsx`), Fredoka and Zen Maru Gothic (subset to the page text at build time), a centre slider of real product screens, and arched product cards. It presents five products:

- **StudyReel** — study recorder for iPhone and iPad
- **UsefulMap** — travel-mode comparison for iPhone and iPad
- **Career** — job-fit checker: https://career.enludus.com
- **Logiscore** — sends data as sound: https://logiscore.enludus.com
- **Gojuon Minesweeper** — word-guessing game: https://minesweeper.enludus.com

## Stack

- Vite
- React 19
- TypeScript
- Vanilla CSS
- Vercel

## Local development

Run npm install and npm run dev.

Production build: npm run build.

## Deploy to Vercel

1. Import this GitHub repository in Vercel.
2. Vercel should detect Vite automatically.
3. Build command: npm run build
4. Output directory: dist
5. Add enludus.com (and optionally www.enludus.com) under Project → Settings → Domains.
6. Apply the DNS records Vercel shows for the domain.

No environment variables are required.

## Routes

| URL | Source |
|---|---|
| `/` | English company site (`index.html` → `src/App.tsx`) |
| `/ja` | Japanese company site (`ja.html` → same app, `lang="ja"`) |
| `/portfolio` | Founder portfolio, static HTML from `site/profile.ts` |
| `/blog`, `/blog/<slug>` | Blog, static HTML from `content/blog/*.md` |
| `/blog/feed.xml`, `/sitemap.xml`, `/404` | Generated at build time |
| `/og/*.png` | Open Graph cards for every page and post, generated at build time (`site/og.ts`) |
| `/products/*`, `/privacy` | Hand-written pages in `public/` |

A visitor whose browser prefers Japanese is sent from `/` to `/ja` on the first visit. The EN / JA switch in the header is remembered (`localStorage`) and always wins.

## Content

Company copy and product facts (specs, release months, screenshots) for both languages live in `src/i18n.ts`. Product screenshots are WebP files in `public/img/products/`, two widths each, taken from the App Store listings and the live web apps. The Japanese object is typed from the English one, so a missing or extra key fails `npm run build`. The visual system and responsive behavior live in `src/styles.css`.

The portfolio's facts live in `site/profile.ts`. Portfolio, blog, posts and 404 share the company top's warm look: `public/site/site.css`, the same SVG drawings (rendered to static markup at build time by `site/art.ts`), and Fredoka + Zen Maru Gothic subset to each page's text. `public/site/site.js` adds the mobile menu, reveal-once, the stack band, the JST clock and the blog tag filter — all motion off for reduced motion and Save-Data. The hand-written product guides and privacy pages use the same palette and fonts through `public/products/product.css`.

## Writing a blog post

1. Add `content/blog/<slug>.md`. The file name is the URL: `content/blog/hello-world.md` → `/blog/hello-world`. Use lowercase letters, digits and `-`.
2. Start it with front matter:

   ```md
   ---
   title: 記事のタイトル
   date: 2026-10-19
   description: 一覧・検索結果・RSS に出る 1〜2 文の説明
   tags: [設計, Swift]
   # updated: 2026-10-25   (optional)
   # draft: true           (optional: shown in npm run dev only)
   ---
   ```

3. Write Markdown (GitHub flavored: tables, code blocks, lists). Code blocks are coloured at build time; tag them with a language (`ts`, `swift`, `rust`, `go`, `bash`, … see `LANGS` in `site/posts.ts`). Every `##` heading becomes a table-of-contents entry once a post has three or more. Put images in `public/blog/<slug>/` and reference them as `/blog/<slug>/image.webp`.
4. `npm run dev` and open `/blog`. Commit and push; the post, its share card (`/og/blog/<slug>.png`), related posts, the portfolio's "Writing" list, the RSS feed and the sitemap update on deploy.

The share cards fetch Manrope, Noto Sans JP (subset to the characters used) and DM Mono from Google Fonts during the build. If that fails, every card falls back to `site/og-fallback.png` and the build still succeeds.

