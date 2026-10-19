# Enludus Company Web

Official company / studio website for **Enludus**.

A motion-rich single-page site built with Vite, React, TypeScript, and Motion. It presents three current products:

- **Career** — career decision support: https://career.enludus.com
- **StudyReel** — learning recorder for iOS
- **UsefulMap** — travel-mode comparison for iOS

## Stack

- Vite
- React 19
- TypeScript
- Motion (motion/react)
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
| `/blog/feed.xml`, `/sitemap.xml` | Generated at build time |
| `/products/*`, `/privacy` | Hand-written pages in `public/` |

A visitor whose browser prefers Japanese is sent from `/` to `/ja` on the first visit. The EN / JA switch in the header is remembered (`localStorage`) and always wins.

## Content

Company copy for both languages lives in `src/i18n.ts`. The Japanese object is typed from the English one, so a missing or extra key fails `npm run build`. The visual system and responsive behavior live in `src/styles.css`.

The portfolio's facts live in `site/profile.ts`; its look lives in `public/site/site.css` (no build step, no Japanese web font) and `public/site/site.js` (reveal-once, the stack band, the JST clock and the blog tag filter — all off for reduced motion and Save-Data). The design follows the "art / portfolio" mood of lp-anatomy's `lp-quality-bar`.

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

3. Write Markdown (GitHub flavored: tables, code blocks, lists). Every `##` heading becomes a table-of-contents entry once a post has three or more. Put images in `public/blog/<slug>/` and reference them as `/blog/<slug>/image.webp`.
4. `npm run dev` and open `/blog`. Commit and push; the post, the portfolio's "Writing" list, the RSS feed and the sitemap update on deploy.

The UI mockups are implemented in HTML/CSS/SVG instead of screenshots so the product storytelling remains crisp, animated, responsive, and easy to update.
