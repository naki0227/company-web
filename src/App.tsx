import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import latestPosts from "virtual:latest-posts";
import { LangContext, useCopy, useLang } from "./copy-context";
import { homePath, type Lang, type Product } from "./i18n";
import {
  CameraSwitchIcon,
  CareerIcon,
  HandoffIcon,
  KanaIcon,
  Leaf,
  LockedWindowIcon,
  MapIcon,
  Mug,
  Note,
  Pencil,
  Pin,
  SoundIcon,
  Studio,
  StudyIcon,
} from "./illustrations";

const productIcons: Record<string, typeof StudyIcon> = {
  studyreel: StudyIcon,
  usefulmap: MapIcon,
  career: CareerIcon,
  logiscore: SoundIcon,
  minesweeper: KanaIcon,
};

// Mood: lp-anatomy §7-2 "warm" (Bikkuri Donkey), translated to Enludus. Two paper
// colours alternate with oval curves between them; colour comes only from the logo
// (orange, sky, navy) and the illustrations use the same three. Latin is a round face
// (Fredoka), Japanese a round gothic (Zen Maru Gothic, subset at build time). Motion:
// one centre slider (3 s), hover wobble (.75 s, ±3°), rows that slide 10 px (.5 s
// cubic-bezier(.19,1,.22,1)), and a mobile menu whose items drop in .125 s apart.

const still = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <span className="logo-bar logo-bar-a" />
      <span className="logo-bar logo-bar-b" />
      <span className="logo-bar logo-bar-c" />
      <span className="logo-dot" />
    </span>
  );
}

function rememberLang(lang: Lang) {
  try {
    localStorage.setItem("enludus-lang", lang);
    // The edge redirect on "/" reads this cookie, so the choice holds before any script runs.
    document.cookie = `enludus-lang=${lang}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Private mode or blocked storage: the switch still navigates.
  }
}

function LangSwitch() {
  const lang = useLang();
  const t = useCopy();
  return (
    <div className="lang" role="group" aria-label={t.meta.switchLabel}>
      {(["ja", "en"] as const).map((code) => (
        <a
          key={code}
          href={homePath[code]}
          hrefLang={code}
          lang={code}
          aria-current={code === lang ? "true" : undefined}
          onClick={() => rememberLang(code)}
        >
          {code.toUpperCase()}
        </a>
      ))}
    </div>
  );
}

function useNav() {
  const t = useCopy();
  const lang = useLang();
  return [
    { href: "#products", label: t.nav.products, en: "Products", Icon: Pin },
    { href: "/blog", label: t.nav.journal, en: "Blog", Icon: Pencil },
    { href: lang === "en" ? "/en/portfolio" : "/portfolio", label: t.nav.founder, en: "Founder", Icon: Leaf },
    { href: "#company", label: t.nav.company, en: "About", Icon: Mug },
  ];
}

function Header() {
  const t = useCopy();
  const nav = useNav();
  const [open, setOpen] = useState(false);
  return (
    <header className={`hd${open ? " is-open" : ""}`}>
      <a className="hd-brand" href="#top" aria-label={t.meta.homeLabel}>
        <LogoMark />
        <span className="round">Enludus</span>
      </a>
      <nav className="hd-nav" id="menu" aria-label={t.meta.navLabel}>
        {nav.map(({ href, label, en, Icon }, i) => (
          <a
            key={href}
            href={href}
            style={{ "--i": i } as CSSProperties}
            onClick={() => setOpen(false)}
          >
            <Icon className="hd-icon" />
            <span>
              <small className="round">{en}</small>
              {label}
            </span>
          </a>
        ))}
      </nav>
      <div className="hd-end">
        <LangSwitch />
        <a className="btn btn-sm" href="mailto:contact@enludus.com">
          {t.nav.contact}
        </a>
        <button
          className="burger"
          type="button"
          aria-expanded={open}
          aria-controls="menu"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
        </button>
      </div>
    </header>
  );
}

function SectionHead({ en, ja, left, right }: { en: string; ja: string; left: ReactNode; right: ReactNode }) {
  return (
    <div className="sh">
      <span className="sh-side sh-left">{left}</span>
      <div>
        <p className="sh-en round" aria-hidden="true">
          {en}
        </p>
        <h2 className="sh-ja">{ja}</h2>
      </div>
      <span className="sh-side sh-right">{right}</span>
    </div>
  );
}

function Shot({ image, sizes, priority = false }: { image: Product["image"]; sizes: string; priority?: boolean }) {
  const [small] = image.widths;
  return (
    <img
      src={`${image.base}-${small}.webp`}
      srcSet={image.widths.map((w) => `${image.base}-${w}.webp ${w}w`).join(", ")}
      sizes={sizes}
      width={small}
      height={Math.round(small * image.ratio)}
      alt={image.alt}
      // The first slide is the largest thing on the first screen: fetch it right away.
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

/** Centre slider (Bikkuri Donkey's main visual): one big card, neighbours darkened. */
function Slider() {
  const t = useCopy();
  const items = t.products.items;
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (still() || paused) return;
    const el = ref.current;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (el) io.observe(el);
    const id = window.setInterval(() => {
      if (visible && !document.hidden) setIndex((i) => (i + 1) % n);
    }, 3000);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [n, paused]);

  return (
    <div
      className="slider"
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.products.label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
    >
      <div className="slider-track">
        {items.map((p, i) => {
          let offset = (i - index + n) % n;
          if (offset > n / 2) offset -= n;
          const Icon = productIcons[p.id];
          return (
            <a
              key={p.id}
              href={`#${p.id}`}
              className={`slide${offset === 0 ? " is-center" : ""}${Math.abs(offset) > 1 ? " is-far" : ""}`}
              style={{ "--o": offset } as CSSProperties}
              aria-hidden={offset !== 0}
              tabIndex={offset === 0 ? 0 : -1}
            >
              <span className={`slide-frame slide-${p.image.shape}`}>
                <Shot image={p.image} sizes="(max-width: 760px) 70vw, 340px" priority={i === 0} />
              </span>
              <span className="slide-cap">
                <Icon className="slide-icon" />
                <span>
                  <strong className="round">{p.name}</strong>
                  {p.what}
                </span>
              </span>
            </a>
          );
        })}
      </div>
      <div className="slider-ui">
        <button type="button" className="slider-btn" aria-label="Previous" onClick={() => setIndex((i) => (i - 1 + n) % n)}>
          ←
        </button>
        <div className="dots">
          {items.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={p.name}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button type="button" className="slider-btn" aria-label="Next" onClick={() => setIndex((i) => (i + 1) % n)}>
          →
        </button>
      </div>
    </div>
  );
}

function Hero() {
  const t = useCopy();
  return (
    <section className="hero paper-a" id="top">
      <div className="hero-copy">
        <p className="label round">{t.hero.label}</p>
        <h1>{t.hero.title}</h1>
        <p className="hero-lead">{t.hero.lead}</p>
        <Note className="doodle doodle-note" />
        <Pencil className="doodle doodle-pencil" />
      </div>
      <Slider />
    </section>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const t = useCopy();
  const Icon = productIcons[product.id];
  const guide = t.products.guidePaths[product.id];
  return (
    <article className={`card ${index % 2 ? "tone-s" : "tone-o"}`} id={product.id}>
      <div className="card-arch">
        <span className="card-no round">{String(index + 1).padStart(2, "0")}</span>
        <Icon className="card-icon wobble" />
      </div>
      <div className="card-body">
        <p className="card-what">{product.what}</p>
        <h3 className="round" lang={/^[\x20-\x7e]+$/.test(product.name) ? "en" : "ja"}>
          {product.name}
        </h3>
        <p className="card-headline">{product.headline}</p>
        <p className="card-text">{product.body}</p>
        <dl className="specs">
          {product.specs.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="card-links">
          {product.links.map((l) => (
            <a key={l.href} className="btn" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
          {guide && (
            <a className="btn btn-line" href={guide}>
              {t.products.guide}
            </a>
          )}
        </p>
      </div>
    </article>
  );
}

function Products() {
  const t = useCopy();
  return (
    <section className="sec paper-b curve" id="products">
      <SectionHead en="Products" ja={t.products.label} left={<Pin />} right={<Note />} />
      <div className="cards">
        {t.products.items.map((p, i) => (
          <ProductCard product={p} index={i} key={p.id} />
        ))}
      </div>
    </section>
  );
}

function Decisions() {
  const t = useCopy();
  const icons = [CameraSwitchIcon, LockedWindowIcon, HandoffIcon];
  return (
    <section className="sec paper-a curve">
      <SectionHead en="Our way" ja={t.decisions.label} left={<Leaf />} right={<Pencil />} />
      <ol className="ways">
        {t.decisions.items.map((d, i) => {
          const Icon = icons[i];
          return (
            <li key={d.title}>
              <Icon className="way-icon wobble" />
              <span className="way-tag round">{d.product}</span>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Journal() {
  const t = useCopy();
  if (!latestPosts.length) return null;
  return (
    <section className="sec paper-b curve">
      <SectionHead en="News" ja={t.journal.label} left={<Pencil />} right={<Mug />} />
      <ul className="news">
        {latestPosts.map((p) => (
          <li key={p.slug}>
            <a href={`/blog/${p.slug}`}>
              <time className="round" dateTime={p.date}>
                {p.date.replace(/-/g, ".")}
              </time>
              <span lang="ja">{p.title}</span>
              <i aria-hidden="true">→</i>
            </a>
          </li>
        ))}
      </ul>
      <p className="more">
        <a className="btn btn-line" href="/blog">
          {t.journal.all}
        </a>
        {t.journal.note && <small>{t.journal.note}</small>}
      </p>
    </section>
  );
}

function Company() {
  const t = useCopy();
  const lang = useLang();
  const [, founderRow] = t.company.rows;
  return (
    <section className="sec paper-a curve" id="company">
      <SectionHead en="About" ja={t.company.label} left={<Mug />} right={<Leaf />} />
      <div className="company">
        <dl className="company-table">
          {t.company.rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>
                {v.includes("@") ? <a href={`mailto:${v}`}>{v}</a> : v}
                {k === founderRow[0] && (
                  <a className="inline" href={lang === "en" ? "/en/portfolio" : "/portfolio"}>
                    {t.company.founderLink} →
                  </a>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <Studio className="studio" />
      </div>
    </section>
  );
}

function Contact() {
  const t = useCopy();
  return (
    <section className="band" id="contact" aria-labelledby="contact-title">
      <p className="round band-en" aria-hidden="true">
        Contact
      </p>
      <h2 id="contact-title">{t.contact.label}</h2>
      <p>{t.contact.lead}</p>
      <a className="btn btn-white" href="mailto:contact@enludus.com">
        contact@enludus.com
      </a>
    </section>
  );
}

function Footer() {
  const t = useCopy();
  const nav = useNav();
  const Icons = Object.values(productIcons);
  return (
    <footer className="ft">
      <div className="ft-edge" aria-hidden="true">
        {[...Icons, ...Icons].map((Icon, i) => (
          <Icon key={i} />
        ))}
      </div>
      <div className="ft-row">
        <a className="hd-brand" href="#top">
          <LogoMark />
          <span className="round">Enludus</span>
        </a>
        <nav aria-label="Footer">
          {nav.map(({ href, label }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <a href="/privacy">{t.footer.privacy}</a>
        </nav>
        <span className="round">© 2026 Enludus</span>
      </div>
    </footer>
  );
}

export default function App({ lang }: { lang: Lang }) {
  return (
    <LangContext.Provider value={lang}>
      <Header />
      <main>
        <Hero />
        <Products />
        <Decisions />
        <Journal />
        <Company />
        <Contact />
      </main>
      <Footer />
    </LangContext.Provider>
  );
}
