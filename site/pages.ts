import type { Post } from "./posts";
import {
  about,
  activities,
  capabilities,
  facts,
  marquee,
  person,
  skills,
  works,
} from "./profile";

export const SITE = "https://enludus.com";

const STATIC_PATHS = [
  "/",
  "/ja",
  "/portfolio",
  "/blog",
  "/privacy",
  "/products/studyreel",
  "/products/studyreel-privacy",
  "/products/useful-map",
  "/products/career",
  "/products/logiscore",
  "/products/gojuon-minesweeper",
];

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dot(date: string) {
  return date.replace(/-/g, ".");
}

function external(href: string) {
  return /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
}

type Head = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  jsonLd?: object;
  noindex?: boolean;
};

function layout(head: Head, current: "portfolio" | "blog", main: string) {
  const url = SITE + head.path;
  const nav = [
    ["portfolio", "/portfolio", "Portfolio"],
    ["blog", "/blog", "Blog"],
    ["products", "/ja#products", "Products"],
  ]
    .map(
      ([key, href, label]) =>
        `<a href="${href}"${key === current ? ' aria-current="page"' : ""}>${label}</a>`,
    )
    .join("");
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(head.title)}</title>
<meta name="description" content="${esc(head.description)}">
${head.noindex ? '<meta name="robots" content="noindex">\n' : ""}<link rel="canonical" href="${url}">
<meta property="og:type" content="${head.type ?? "website"}">
<meta property="og:site_name" content="Enludus">
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="${esc(head.title)}">
<meta property="og:description" content="${esc(head.description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#ebe7e0">
<meta name="google-adsense-account" content="ca-pub-1806737602764042">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate" type="application/rss+xml" title="Enludus ブログ" href="/blog/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono&family=Manrope:wght@400;600;800&display=swap">
<link rel="stylesheet" href="/site/site.css">
<script src="/site/site.js" defer></script>
${head.jsonLd ? `<script type="application/ld+json">${JSON.stringify(head.jsonLd)}</script>\n` : ""}</head>
<body>
<a class="skip" href="#main">本文へ移動</a>
<header class="hd">
  <a class="hd-brand" href="/ja" aria-label="Enludus トップページ"><span class="hd-mark" aria-hidden="true"></span>Enludus</a>
  <nav aria-label="メインメニュー">${nav}<a class="hd-mail" href="mailto:${person.email}">Contact</a></nav>
</header>
<main id="main">
${main}
</main>
<footer class="ft">
  <p class="ft-word" aria-hidden="true">Enludus</p>
  <div class="ft-row">
    <span>© ${new Date().getFullYear()} Enludus</span>
    <nav aria-label="フッター">
      <a href="/ja">会社サイト</a><a href="/portfolio">Portfolio</a><a href="/blog">Blog</a><a href="/blog/feed.xml">RSS</a><a href="/privacy">プライバシーポリシー</a>
    </nav>
  </div>
</footer>
</body>
</html>
`;
}

function sectionHead(no: string, en: string, ja: string) {
  return `<div class="sh" data-reveal>
    <span class="sh-no">${no}</span>
    <h2 class="sh-en">${en}</h2>
    <p class="sh-ja">${ja}</p>
  </div>`;
}

function postRows(posts: Post[]) {
  if (!posts.length) return `<p class="empty">最初の記事を準備しています。</p>`;
  return `<ol class="posts">${posts
    .map(
      (post) => `
    <li data-tags="${esc(post.tags.join(" "))}" data-reveal>
      <a class="post-row" href="/blog/${post.slug}">
        <time datetime="${post.date}">${dot(post.date)}</time>
        <span class="post-row-title">${post.draft ? '<b class="badge">下書き</b>' : ""}${esc(post.title)}</span>
        <span class="post-row-desc">${esc(post.description)}</span>
        <span class="post-row-tags">${post.tags.map((t) => `#${esc(t)}`).join(" ")}</span>
        <span class="arrow" aria-hidden="true">→</span>
      </a>
    </li>`,
    )
    .join("")}
  </ol>`;
}

export function portfolioPage(posts: Post[]) {
  const workItems = works
    .map((work, index) => {
      const rows = [
        ["Problem", "課題", work.problem],
        ["Approach", "つくり方", work.approach],
        ...(work.learning ? [["Learning", "学んだこと", work.learning]] : []),
      ]
        .map(
          ([en, ja, text]) =>
            `<div><dt><span>${en}</span>${ja}</dt><dd>${esc(text)}</dd></div>`,
        )
        .join("");
      const links = work.links
        .map((l) => `<a href="${l.href}"${external(l.href)}>${esc(l.label)} <span aria-hidden="true">↗</span></a>`)
        .join("");
      return `
    <li class="work" data-reveal>
      <details>
        <summary>
          <span class="work-no">${String(index + 1).padStart(2, "0")}</span>
          <span class="work-name${/^[\x20-\x7e]+$/.test(work.name) ? "" : " is-ja"}">${esc(work.name)}</span>
          <span class="work-cat">${esc(work.category)}</span>
          <span class="work-status">${esc(work.status)}</span>
          <span class="work-toggle" aria-hidden="true"></span>
        </summary>
        <div class="work-body">
          <p class="work-summary">${esc(work.summary)}</p>
          <dl class="work-notes">${rows}</dl>
          <ul class="chips">${work.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          ${links ? `<p class="work-links">${links}</p>` : ""}
        </div>
      </details>
    </li>`;
    })
    .join("");

  const band = marquee.map((m) => `<li>${esc(m)}</li>`).join("");

  const main = `
<section class="hero" aria-labelledby="hero-name">
  <div class="hero-meta">
    <span>Portfolio — ${new Date().getFullYear()}</span>
    <span>Osaka, Japan</span>
    <span><time data-clock>--:--</time> JST</span>
  </div>
  <h1 class="hero-name" id="hero-name">
    <span class="sr">${esc(person.name)}（</span><span class="l1">${person.latinFirst}</span><span class="l2">${person.latinLast}<i class="dot" aria-hidden="true"></i></span><span class="sr">）</span>
  </h1>
  <div class="hero-foot">
    <p class="hero-who"><strong>${esc(person.name)}</strong><span>${esc(person.role)}</span><span>${esc(person.school)}</span></p>
    <p class="hero-lead">${esc(person.lead)}</p>
    <a class="hero-next" href="#works">Works <span aria-hidden="true">↓</span></a>
  </div>
</section>

<div class="band" data-marquee aria-label="使っている技術">
  <div class="band-track"><ul>${band}</ul><ul aria-hidden="true">${band}</ul></div>
</div>

<section class="sec" id="works" aria-label="Works">
  ${sectionHead("01 / 04", "Works", "つくったもの")}
  <p class="sec-lead" data-reveal>名前を押すと、課題・つくり方・学んだことが開きます。</p>
  <ol class="works">${workItems}
  </ol>
</section>

<section class="sec" id="writing" aria-label="Writing">
  ${sectionHead("02 / 04", "Writing", "書いたもの")}
  ${postRows(posts.slice(0, 3))}
  <p class="more" data-reveal><a href="/blog">すべての記事を見る <span aria-hidden="true">→</span></a></p>
</section>

<section class="sec" id="skills" aria-label="Skills">
  ${sectionHead("03 / 04", "Skills", "できること")}
  <div class="caps">${capabilities
    .map(
      (c, i) => `
    <article class="cap" data-reveal>
      <span class="cap-no">${String(i + 1).padStart(2, "0")} / ${esc(c.label)}</span>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.text)}</p>
      <small>${esc(c.tags)}</small>
    </article>`,
    )
    .join("")}
  </div>
  <dl class="skills" data-reveal>${skills
    .map(([area, primary, detail]) => `<div><dt>${area}</dt><dd><strong>${esc(primary)}</strong>${esc(detail)}</dd></div>`)
    .join("")}
  </dl>
</section>

<section class="sec" id="about" aria-label="About">
  ${sectionHead("04 / 04", "About", "わたしについて")}
  <div class="about">
    <dl class="facts" data-reveal>${facts
      .map(([label, value, note]) => `<div><dt>${label}</dt><dd>${esc(value)}<small>${esc(note)}</small></dd></div>`)
      .join("")}
    </dl>
    <div class="about-text" data-reveal>${about.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
  </div>
  <ul class="acts">${activities
    .map(
      ([label, title, text]) => `
    <li data-reveal><span>${label}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></li>`,
    )
    .join("")}
  </ul>
</section>

<section class="contact" id="contact" aria-label="Contact">
  <p class="sh-no">Contact</p>
  <p class="contact-lead">お仕事のご相談、インターン・採用のお話、技術の雑談まで。</p>
  <a class="contact-mail" href="mailto:${person.email}">${person.email}</a>
  <p class="contact-links">${person.links
    .map((l) => `<a href="${l.href}"${external(l.href)}>${l.label} <span aria-hidden="true">↗</span></a>`)
    .join("")}</p>
</section>`;

  return layout(
    {
      title: "長瀬 唯楓 — Portfolio | Enludus",
      description: `${person.name}（Ibuki Nagase）のポートフォリオ。${person.lead}StudyReel・Career・UsefulMap・Logiscore など、つくったものと考え方をまとめています。`,
      path: "/portfolio",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: person.name,
          alternateName: "Ibuki Nagase",
          jobTitle: "ソフトウェアエンジニア",
          worksFor: { "@type": "Organization", name: "Enludus", url: SITE },
          sameAs: person.links.filter((l) => l.href.startsWith("http")).map((l) => l.href),
        },
      },
    },
    "portfolio",
    main,
  );
}

export function blogIndexPage(posts: Post[]) {
  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b, "ja"));
  const filter = tags.length
    ? `<div class="filter" role="group" aria-label="タグで絞り込む" data-filter hidden>
    <button type="button" aria-pressed="true" data-tag="">すべて</button>${tags
      .map((t) => `<button type="button" aria-pressed="false" data-tag="${esc(t)}">#${esc(t)}</button>`)
      .join("")}
  </div>`
    : "";
  const main = `
<section class="hero hero-sm" aria-labelledby="blog-title">
  <div class="hero-meta">
    <span>Blog — ${posts.length} posts</span>
    <span>長瀬 唯楓 / Enludus</span>
    <a href="/blog/feed.xml">RSS</a>
  </div>
  <h1 class="hero-name" id="blog-title"><span class="l1">Blog<i class="dot" aria-hidden="true"></i></span></h1>
  <p class="hero-lead">つくっているもの、学んだこと、考えたことの記録。</p>
</section>
<section class="sec sec-tight" aria-label="記事一覧">
  ${filter}
  ${postRows(posts)}
  <p class="empty" data-filter-empty hidden>このタグの記事はまだありません。</p>
</section>`;
  return layout(
    {
      title: "ブログ | Enludus",
      description: "Enludus 代表・長瀬唯楓のブログ。プロダクト開発、設計、学んだことの記録。",
      path: "/blog",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Enludus ブログ",
        url: `${SITE}/blog`,
        author: { "@type": "Person", name: person.name },
      },
    },
    "blog",
    main,
  );
}

export function postPage(post: Post, newer?: Post, older?: Post) {
  const toc =
    post.toc.length >= 3
      ? `<nav class="toc" aria-label="目次"><p>目次</p><ol>${post.toc
          .map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`)
          .join("")}</ol></nav>`
      : "";
  const pager = [
    older ? `<a class="pager-old" href="/blog/${older.slug}"><span>← 前の記事</span>${esc(older.title)}</a>` : "<span></span>",
    newer ? `<a class="pager-new" href="/blog/${newer.slug}"><span>次の記事 →</span>${esc(newer.title)}</a>` : "<span></span>",
  ].join("");
  const main = `
<article class="post">
  <header class="post-head">
    <p class="post-meta"><a href="/blog">Blog</a><span aria-hidden="true">/</span><time datetime="${post.date}">${dot(post.date)}</time>${
      post.updated ? `<span>更新 <time datetime="${post.updated}">${dot(post.updated)}</time></span>` : ""
    }<span>${post.minutes}分で読めます</span>${post.draft ? '<b class="badge">下書き</b>' : ""}</p>
    <h1>${esc(post.title)}</h1>
    ${post.description ? `<p class="post-lead">${esc(post.description)}</p>` : ""}
    ${post.tags.length ? `<ul class="chips">${post.tags.map((t) => `<li><a href="/blog?tag=${encodeURIComponent(t)}">#${esc(t)}</a></li>`).join("")}</ul>` : ""}
  </header>
  <div class="post-body${toc ? " has-toc" : ""}">
    ${toc}
    <div class="prose">
${post.html}
    </div>
  </div>
  <footer class="post-foot">
    <a class="author" href="/portfolio">
      <span class="author-mark" aria-hidden="true">IN</span>
      <span><strong>${esc(person.name)}</strong>${esc(person.role)}</span>
    </a>
    <nav class="pager" aria-label="前後の記事">${pager}</nav>
  </footer>
</article>`;
  return layout(
    {
      title: `${post.title} | Enludus ブログ`,
      description: post.description || post.title,
      path: `/blog/${post.slug}`,
      type: "article",
      noindex: post.draft,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        inLanguage: "ja",
        url: `${SITE}/blog/${post.slug}`,
        author: { "@type": "Person", name: person.name, url: `${SITE}/portfolio` },
        publisher: { "@type": "Organization", name: "Enludus", url: SITE },
        keywords: post.tags.join(", "),
      },
    },
    "blog",
    main,
  );
}

export function feed(posts: Post[]) {
  const items = posts
    .slice(0, 30)
    .map(
      (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE}/blog/${p.slug}</link>
    <guid>${SITE}/blog/${p.slug}</guid>
    <pubDate>${new Date(`${p.date}T09:00:00+09:00`).toUTCString()}</pubDate>
    <description>${esc(p.description)}</description>
${p.tags.map((t) => `    <category>${esc(t)}</category>`).join("\n")}
  </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Enludus ブログ</title>
  <link>${SITE}/blog</link>
  <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Enludus 代表・長瀬唯楓のブログ。プロダクト開発、設計、学んだことの記録。</description>
  <language>ja</language>
${items}
</channel>
</rss>
`;
}

export function sitemap(posts: Post[]) {
  const urls = [
    ...STATIC_PATHS.map((path) => `  <url><loc>${SITE}${path}</loc></url>`),
    ...posts.map(
      (p) => `  <url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${p.updated ?? p.date}</lastmod></url>`,
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
