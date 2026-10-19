import { art, workArt } from "./art";
import type { Post } from "./posts";
import { aboutEn, activitiesEn, capabilitiesEn, factsEn, personEn, skillsEn, worksEn } from "./profile-en";
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
  "/en/portfolio",
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
  /** Path of the Open Graph card, e.g. "/og/portfolio.png". */
  image: string;
  lang?: Lang;
  /** hreflang alternates, e.g. { ja: "/portfolio", en: "/en/portfolio" }. */
  alternates?: Record<Lang, string>;
};

type Lang = "ja" | "en";

const CHROME = {
  ja: {
    skip: "本文へ移動",
    home: "Enludus トップページ",
    homeHref: "/ja",
    mainNav: "メインメニュー",
    menu: "メニュー",
    contact: "お問い合わせ",
    footerNav: "フッター",
    locale: "ja_JP",
    nav: [
      ["", "/ja#products", "Products", "製品", "Pin"],
      ["blog", "/blog", "Blog", "ブログ", "Pencil"],
      ["portfolio", "/portfolio", "Founder", "代表", "Leaf"],
      ["", "/ja#company", "About", "運営者情報", "Mug"],
    ],
    footer: [["/ja", "Enludus トップ"], ["/portfolio", "代表"], ["/blog", "ブログ"], ["/blog/feed.xml", "RSS"], ["/privacy", "プライバシーポリシー"]],
  },
  en: {
    skip: "Skip to content",
    home: "Enludus home",
    homeHref: "/",
    mainNav: "Primary",
    menu: "Menu",
    contact: "Contact",
    footerNav: "Footer",
    locale: "en_US",
    nav: [
      ["", "/#products", "", "Products", "Pin"],
      ["blog", "/blog", "", "Blog", "Pencil"],
      ["portfolio", "/en/portfolio", "", "Founder", "Leaf"],
      ["", "/#company", "", "About", "Mug"],
    ],
    footer: [["/", "Enludus"], ["/en/portfolio", "Founder"], ["/blog", "Blog (Japanese)"], ["/blog/feed.xml", "RSS"], ["/privacy", "Privacy (Japanese)"]],
  },
} as const;

/**
 * Fredoka for Latin, Zen Maru Gothic for Japanese — the same pair as the company top.
 * The Japanese face is requested with `text=` holding exactly the characters on this
 * page, so each page downloads a small subset instead of the whole face.
 */
function fontLinks(html: string) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, "");
  const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");
  const chars = [...new Set([...text, ...ascii])].filter((c) => c.trim()).sort().join("");
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&display=swap&text=${encodeURIComponent(chars)}">`;
}

const LOGO = `<span class="logo-mark" aria-hidden="true"><span class="logo-bar logo-bar-a"></span><span class="logo-bar logo-bar-b"></span><span class="logo-bar logo-bar-c"></span><span class="logo-dot"></span></span>`;

function layout(head: Head, current: "portfolio" | "blog" | "", main: string) {
  const url = SITE + head.path;
  const lang = head.lang ?? "ja";
  const c = CHROME[lang];
  const nav = c.nav
    .map(
      ([key, href, en, ja, icon], i) =>
        `<a href="${href}" style="--i:${i}"${key && key === current ? ' aria-current="page"' : ""}>${art(icon, "hd-icon")}<span><small class="round">${en}</small>${ja}</span></a>`,
    )
    .join("");
  const edge = ["StudyIcon", "MapIcon", "CareerIcon", "SoundIcon", "KanaIcon", "VideoIcon", "LoupeIcon"] as const;
  const body = `<body>
<a class="skip" href="#main">${c.skip}</a>
<header class="hd">
  <a class="hd-brand" href="${c.homeHref}" aria-label="${c.home}">${LOGO}<span class="round">Enludus</span></a>
  <nav class="hd-nav" id="menu" aria-label="${c.mainNav}">${nav}</nav>
  <div class="hd-end">
    <a class="btn btn-sm" href="mailto:${person.email}">${c.contact}</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${c.menu}" data-burger><span></span></button>
  </div>
</header>
<main id="main">
${main}
</main>
<footer class="ft">
  <div class="ft-edge" aria-hidden="true">${[...edge, ...edge].map((n) => art(n)).join("")}</div>
  <div class="ft-row">
    <a class="hd-brand" href="${c.homeHref}">${LOGO}<span class="round">Enludus</span></a>
    <nav aria-label="${c.footerNav}">
      ${c.footer.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
    </nav>
    <span class="round">© ${new Date().getFullYear()} Enludus</span>
  </div>
</footer>
</body>`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(head.title)}</title>
<meta name="description" content="${esc(head.description)}">
${head.noindex ? '<meta name="robots" content="noindex">\n' : ""}<link rel="canonical" href="${url}">
<meta property="og:type" content="${head.type ?? "website"}">
<meta property="og:site_name" content="Enludus">
<meta property="og:locale" content="${c.locale}">
${head.alternates ? Object.entries(head.alternates).map(([l, path]) => `<link rel="alternate" hreflang="${l}" href="${SITE}${path}">`).join("\n") + "\n" : ""}
<meta property="og:title" content="${esc(head.title)}">
<meta property="og:description" content="${esc(head.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${head.image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<meta name="google-adsense-account" content="ca-pub-1806737602764042">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="alternate" type="application/rss+xml" title="Enludus ブログ" href="/blog/feed.xml">
${fontLinks(`${head.title} ${body}`)}
<link rel="stylesheet" href="/site/site.css">
<script src="/site/site.js" defer></script>
<script defer src="/_vercel/insights/script.js"></script>
${head.jsonLd ? `<script type="application/ld+json">${JSON.stringify(head.jsonLd)}</script>\n` : ""}</head>
${body}
</html>
`;
}

const DOODLES = [
  ["Pin", "Note"],
  ["Pencil", "Mug"],
  ["Leaf", "Pencil"],
  ["Mug", "Leaf"],
] as const;

/** Round English, small Japanese, a drawing on each side — as on the company top. */
function sectionHead(no: string, en: string, ja: string, n = 0) {
  const [left, right] = DOODLES[n % DOODLES.length];
  return `<div class="sh" data-reveal>
    <span class="sh-side sh-left">${art(left)}</span>
    <div>
      <p class="sh-no round">${no}</p>
      <p class="sh-en round" aria-hidden="true">${en}</p>
      <h2 class="sh-ja">${ja}</h2>
    </div>
    <span class="sh-side sh-right">${art(right)}</span>
  </div>`;
}

/** "技術記事" / "読みもの" label shown on rows and post headers. */
function kindLabel(post: Post) {
  return post.kind === "tech"
    ? '<b class="kind-label kind-label-tech">技術記事</b>'
    : '<b class="kind-label">読みもの</b>';
}

function postRows(posts: Post[]) {
  if (!posts.length) return `<p class="empty">最初の記事を準備しています。</p>`;
  return `<ol class="posts">${posts
    .map(
      (post) => `
    <li data-tags="${esc([`kind:${post.kind}`, ...post.tags].join("|"))}" data-reveal>
      <a class="post-row" href="/blog/${post.slug}">
        <time datetime="${post.date}">${dot(post.date)}</time>
        <span class="post-row-title">${post.draft ? '<b class="badge">下書き</b>' : ""}${kindLabel(post)}${esc(post.title)}</span>
        <span class="post-row-desc">${esc(post.description)}</span>
        <span class="post-row-tags">${post.tags.map((t) => `#${esc(t)}`).join(" ")}</span>
        <span class="arrow" aria-hidden="true">→</span>
      </a>
    </li>`,
    )
    .join("")}
  </ol>`;
}

const PORTFOLIO = {
  ja: {
    rows: ["課題", "つくり方", "学んだこと"],
    stack: "使っている技術",
    heads: ["つくったもの", "書いたもの", "できること", "わたしについて"],
    worksLead: "名前を押すと、課題・つくり方・学んだことが開きます。",
    allPosts: "すべての記事を見る",
    postsNote: "",
    contactLead: "お仕事のご相談、インターン・採用のお話、技術の雑談まで。",
    switchTo: ["/en/portfolio", "English"],
  },
  en: {
    rows: ["", "", ""],
    stack: "Tech I use",
    heads: ["Things I've made", "Things I've written", "What I do", "About me"],
    worksLead: "Open a name to see the problem, the approach and what I learned.",
    allPosts: "All posts",
    postsNote: "The blog is written in Japanese.",
    contactLead: "Work, internships, hiring, or just talking tech — email is best.",
    switchTo: ["/portfolio", "日本語"],
  },
} as const;

export function portfolioPage(posts: Post[], lang: Lang = "ja") {
  const t = PORTFOLIO[lang];
  const en = lang === "en";
  const p = en ? { ...person, ...personEn } : person;
  const works_ = en ? worksEn : works;
  const capabilities_ = en ? capabilitiesEn : capabilities;
  const skills_ = en ? skillsEn : skills;
  const facts_ = en ? factsEn : facts;
  const about_ = en ? aboutEn : about;
  const activities_ = en ? activitiesEn : activities;
  const workItems = works_
    .map((work, index) => {
      const rows = [
        ["Problem", t.rows[0], work.problem],
        ["Approach", t.rows[1], work.approach],
        ...(work.learning ? [["Learning", t.rows[2], work.learning]] : []),
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
          <span class="work-no">${art(workArt[work.name] ?? "Note", "work-icon")}<span class="round">${String(index + 1).padStart(2, "0")}</span></span>
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
  const name = en ? "Ibuki Nagase" : person.name;

  const main = `
<section class="hero paper-a" aria-labelledby="hero-name">
  <div class="hero-meta round">
    <span>Portfolio — ${new Date().getFullYear()}</span>
    <span>Software engineer</span>
    <span><time data-clock>--:--</time> JST</span>
    <a href="${t.switchTo[0]}" hreflang="${en ? "ja" : "en"}" lang="${en ? "ja" : "en"}">${t.switchTo[1]}</a>
  </div>
  ${art("Studio", "hero-art")}
  <h1 class="hero-name round" id="hero-name">
    ${en ? "" : `<span class="sr">${esc(person.name)}（</span>`}<span class="l1">${person.latinFirst}</span><span class="l2">${person.latinLast}<i class="dot" aria-hidden="true"></i></span>${en ? "" : '<span class="sr">）</span>'}
  </h1>
  <div class="hero-foot">
    <p class="hero-who"><strong>${esc(name)}</strong><span>${esc(p.role)}</span><span>${esc(p.school)}</span></p>
    <p class="hero-lead">${esc(p.lead)}</p>
    <a class="hero-next" href="#works">Works <span aria-hidden="true">↓</span></a>
  </div>
</section>

<div class="band" data-marquee aria-label="${t.stack}">
  <div class="band-track"><ul>${band}</ul><ul aria-hidden="true">${band}</ul></div>
</div>

<section class="sec paper-b curve" id="works" aria-label="Works">
  ${sectionHead("01 / 04", "Works", t.heads[0], 0)}
  <p class="sec-lead" data-reveal>${t.worksLead}</p>
  <ol class="works">${workItems}
  </ol>
</section>

<section class="sec paper-a curve" id="writing" aria-label="Writing">
  ${sectionHead("02 / 04", "Writing", t.heads[1], 1)}
  ${t.postsNote ? `<p class="sec-lead" data-reveal>${t.postsNote}</p>` : ""}
  ${postRows(posts.slice(0, 3))}
  <p class="more" data-reveal><a href="/blog">${t.allPosts} <span aria-hidden="true">→</span></a></p>
</section>

<section class="sec paper-b curve" id="skills" aria-label="Skills">
  ${sectionHead("03 / 04", "Skills", t.heads[2], 2)}
  <div class="caps">${capabilities_
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
  <dl class="skills" data-reveal>${skills_
    .map(([area, primary, detail]) => `<div><dt>${area}</dt><dd><strong>${esc(primary)}</strong>${esc(detail)}</dd></div>`)
    .join("")}
  </dl>
</section>

<section class="sec paper-a curve" id="about" aria-label="About">
  ${sectionHead("04 / 04", "About", t.heads[3], 3)}
  <div class="about">
    <dl class="facts" data-reveal>${facts_
      .map(([label, value, note]) => `<div><dt>${label}</dt><dd>${esc(value)}<small>${esc(note)}</small></dd></div>`)
      .join("")}
    </dl>
    <div class="about-text" data-reveal>${about_.map((x) => `<p>${esc(x)}</p>`).join("")}</div>
  </div>
  <ul class="acts">${activities_
    .map(
      ([label, title, text]) => `
    <li data-reveal><span>${label}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></li>`,
    )
    .join("")}
  </ul>
</section>

<section class="contact" id="contact" aria-label="Contact">
  <p class="contact-en round" aria-hidden="true">Contact</p>
  <p class="contact-lead">${t.contactLead}</p>
  <a class="contact-mail round" href="mailto:${person.email}">${person.email}</a>
  <p class="contact-links">${person.links
    .map((l) => (en && l.href === "/ja" ? { ...l, href: "/" } : l))
    .map((l) => `<a href="${l.href}"${external(l.href)}>${l.label} <span aria-hidden="true">↗</span></a>`)
    .join("")}</p>
</section>`;

  return layout(
    {
      title: en ? "Ibuki Nagase — Portfolio | Enludus" : "長瀬 唯楓 — Portfolio | Enludus",
      description: en
        ? `Portfolio of Ibuki Nagase. ${personEn.lead} StudyReel, Career, UsefulMap, Logiscore and more — what I've made and how I think.`
        : `${person.name}（Ibuki Nagase）のポートフォリオ。${person.lead}StudyReel・Career・UsefulMap・Logiscore など、つくったものと考え方をまとめています。`,
      path: en ? "/en/portfolio" : "/portfolio",
      image: "/og/portfolio.png",
      lang,
      alternates: { ja: "/portfolio", en: "/en/portfolio" },
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: en ? "Ibuki Nagase" : person.name,
          alternateName: en ? person.name : "Ibuki Nagase",
          jobTitle: en ? "Software engineer" : "ソフトウェアエンジニア",
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
    ? `<div class="filter" role="group" aria-label="種類とタグで絞り込む" data-filter hidden>
    <button type="button" aria-pressed="true" data-tag="">すべて</button><button type="button" class="kind" aria-pressed="false" data-tag="kind:story">読みもの</button><button type="button" class="kind kind-tech" aria-pressed="false" data-tag="kind:tech">技術記事</button>${tags
      .map((t) => `<button type="button" aria-pressed="false" data-tag="${esc(t)}">#${esc(t)}</button>`)
      .join("")}
  </div>`
    : "";
  const main = `
<section class="hero hero-sm paper-a" aria-labelledby="blog-title">
  <div class="hero-meta round">
    <span>Blog — ${posts.length} posts</span>
    <span>長瀬 唯楓 / Enludus</span>
    <a href="/blog/feed.xml">RSS</a>
  </div>
  ${art("Pencil", "hero-art hero-art-sm")}
  <h1 class="hero-name round" id="blog-title"><span class="l1">Blog<i class="dot" aria-hidden="true"></i></span></h1>
  <p class="hero-lead">つくっているもの、学んだこと、考えたことの記録。</p>
</section>
<section class="sec paper-b curve" aria-label="記事一覧">
  ${filter}
  ${postRows(posts)}
  <p class="empty" data-filter-empty hidden>このタグの記事はまだありません。</p>
</section>`;
  return layout(
    {
      title: "ブログ | Enludus",
      description: "Enludus 代表・長瀬唯楓のブログ。プロダクト開発、設計、学んだことの記録。",
      path: "/blog",
      image: "/og/blog.png",
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

function related(post: Post, all: Post[]) {
  // Most shared tags first, then newest. Drafts never point at each other in production
  // because they are not loaded there.
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => post.tags.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, 3)
    .map((x) => x.p);
}

export function postPage(post: Post, all: Post[]) {
  const i = all.indexOf(post);
  const newer = all[i - 1];
  const older = all[i + 1];
  const url = `${SITE}/blog/${post.slug}`;
  const share = `https://x.com/intent/post?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`;
  const more = related(post, all);
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
<article class="post paper-a">
  <header class="post-head">
    <p class="post-meta"><a href="/blog">Blog</a><span aria-hidden="true">/</span><time datetime="${post.date}">${dot(post.date)}</time>${
      post.updated ? `<span>更新 <time datetime="${post.updated}">${dot(post.updated)}</time></span>` : ""
    }<span>${post.minutes}分で読めます</span>${kindLabel(post)}${post.draft ? '<b class="badge">下書き</b>' : ""}</p>
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
    <div class="share">
      <span>Share</span>
      <a href="${share}" target="_blank" rel="noopener noreferrer">X でシェア <span aria-hidden="true">↗</span></a>
      <button type="button" data-copy="${url}" hidden>リンクをコピー</button>
    </div>
    <a class="author" href="/portfolio">
      <span class="author-mark" aria-hidden="true">IN</span>
      <span><strong>${esc(person.name)}</strong>${esc(person.role)}</span>
    </a>
    <nav class="pager" aria-label="前後の記事">${pager}</nav>
  </footer>
  ${more.length ? `<section class="related" aria-labelledby="related-title">
    <p class="related-title" id="related-title"><span class="round">Related</span>関連する記事</p>
    ${postRows(more)}
  </section>` : ""}
</article>`;
  return layout(
    {
      title: `${post.title} | Enludus ブログ`,
      description: post.description || post.title,
      path: `/blog/${post.slug}`,
      image: `/og/blog/${post.slug}.png`,
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

export function notFoundPage(posts: Post[]) {
  const main = `
<section class="hero hero-sm paper-a" aria-labelledby="nf-title">
  <div class="hero-meta round">
    <span>Error — 404</span>
    <span>Not found</span>
  </div>
  ${art("HandoffIcon", "hero-art hero-art-sm")}
  <h1 class="hero-name round" id="nf-title"><span class="l1">404<i class="dot" aria-hidden="true"></i></span></h1>
  <p class="hero-lead">お探しのページは見つかりませんでした。<br>移動したか、URL が変わった可能性があります。</p>
</section>
<section class="sec paper-b curve" aria-label="行き先">
  <ol class="posts nf-links">
    ${[
      ["/ja", "Enludus トップ", "Enludus とプロダクトの紹介"],
      ["/", "Enludus (English)", "The top page in English"],
      ["/portfolio", "Portfolio", "長瀬 唯楓のポートフォリオ"],
      ["/blog", "Blog", posts[0] ? `最新：${posts[0].title}` : "記事の一覧"],
    ]
      .map(
        ([href, title, desc]) => `<li><a class="post-row" href="${href}"><time>${href}</time><span class="post-row-title">${esc(title)}</span><span class="post-row-desc">${esc(desc)}</span><span class="post-row-tags"></span><span class="arrow" aria-hidden="true">→</span></a></li>`,
      )
      .join("")}
  </ol>
</section>`;
  return layout(
    { title: "ページが見つかりません | Enludus", description: "お探しのページは見つかりませんでした。", path: "/404", image: "/og/blog.png", noindex: true },
    "",
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
