import latestPosts from "virtual:latest-posts";
import { LangContext, useCopy, useLang } from "./copy-context";
import { homePath, type Lang, type Product } from "./i18n";

// Layout follows lp-anatomy's "minimal / hardware" mood (teenage engineering): the
// products carry the colour and the page stays ink, paper and grey. Almost nothing
// moves; hover only changes opacity or background, and only on mouse devices.

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

function Header() {
  const t = useCopy();
  return (
    <header className="hd">
      <a className="hd-brand" href="#top" aria-label={t.meta.homeLabel}>
        <LogoMark />
        <span>Enludus</span>
      </a>
      <nav className="hd-nav" aria-label={t.meta.navLabel}>
        <a href="#products">{t.nav.products}</a>
        <a href="/blog">{t.nav.journal}</a>
        <a href="/portfolio">{t.nav.founder}</a>
        <a href="#company">{t.nav.company}</a>
      </nav>
      <div className="hd-end">
        <LangSwitch />
        <a className="hd-mail" href="mailto:contact@enludus.com">
          {t.nav.contact}
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const t = useCopy();
  return (
    <section className="hero" id="top">
      <p className="label">{t.hero.label}</p>
      <h1>{t.hero.title}</h1>
      <p className="hero-lead">{t.hero.lead}</p>
      <div className="index" role="table" aria-label={t.products.label}>
        <div className="index-row index-head" role="row">
          {t.hero.indexHead.map((cell) => (
            <span key={cell} role="columnheader">
              {cell}
            </span>
          ))}
        </div>
        {t.products.items.map((p, i) => (
          <a className="index-row" role="row" href={`#${p.id}`} key={p.id}>
            <span role="cell">{String(i + 1).padStart(2, "0")}</span>
            <span role="cell" className="index-name">
              {p.name}
            </span>
            <span role="cell">{p.what}</span>
            <span role="cell">{p.platform}</span>
            <span role="cell">{p.since}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Shot({ image }: { image: Product["image"] }) {
  const [small] = image.widths;
  const sizes =
    image.shape === "phone"
      ? "(max-width: 760px) 62vw, 320px"
      : "(max-width: 760px) 92vw, 56vw";
  return (
    <img
      className={`shot shot-${image.shape}`}
      src={`${image.base}-${small}.webp`}
      srcSet={image.widths.map((w) => `${image.base}-${w}.webp ${w}w`).join(", ")}
      sizes={sizes}
      width={small}
      height={Math.round(small * image.ratio)}
      alt={image.alt}
      loading="lazy"
      decoding="async"
    />
  );
}

function ProductSection({
  product,
  index,
  total,
}: {
  product: Product;
  index: number;
  total: number;
}) {
  const t = useCopy();
  const guide = t.products.guidePaths[product.id];
  return (
    <article className={`product ${index % 2 ? "is-light" : "is-dark"}`} id={product.id}>
      <div className={`stage stage-${product.image.shape}`}>
        <Shot image={product.image} />
      </div>
      <div className="info">
        <p className="label">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} — {product.what}
        </p>
        <h3 className="info-name">{product.name}</h3>
        <p className="info-headline">{product.headline}</p>
        <p className="info-body">{product.body}</p>
        <dl className="specs" aria-label={t.products.specsLabel}>
          {product.specs.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="info-links">
          {product.links.map((l) => (
            <a
              key={l.href}
              className="pill pill-dark"
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {l.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
          {guide && (
            <a className="pill" href={guide}>
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
    <section className="products" id="products" aria-label={t.products.label}>
      {t.products.items.map((p, i) => (
        <ProductSection product={p} index={i} total={t.products.items.length} key={p.id} />
      ))}
    </section>
  );
}

function Decisions() {
  const t = useCopy();
  return (
    <section className="block" aria-labelledby="decisions-title">
      <h2 className="label" id="decisions-title">
        {t.decisions.label}
      </h2>
      <ol className="decisions">
        {t.decisions.items.map((d) => (
          <li key={d.title}>
            <h3>{d.title}</h3>
            <p>{d.body}</p>
            <span>{d.product}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Journal() {
  const t = useCopy();
  if (!latestPosts.length) return null;
  return (
    <section className="block" aria-labelledby="journal-title">
      <div className="block-head">
        <h2 className="label" id="journal-title">
          {t.journal.label}
        </h2>
        <a className="block-more" href="/blog">
          {t.journal.all} →
        </a>
      </div>
      <ul className="news">
        {latestPosts.map((p) => (
          <li key={p.slug}>
            <a href={`/blog/${p.slug}`}>
              <time dateTime={p.date}>{p.date.replace(/-/g, ".")}</time>
              <span lang="ja">{p.title}</span>
            </a>
          </li>
        ))}
      </ul>
      {t.journal.note && <p className="note">{t.journal.note}</p>}
    </section>
  );
}

function Company() {
  const t = useCopy();
  const [, founderRow] = t.company.rows;
  return (
    <section className="block" id="company" aria-labelledby="company-title">
      <h2 className="label" id="company-title">
        {t.company.label}
      </h2>
      <dl className="company">
        {t.company.rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>
              {v.includes("@") ? <a className="inline-link" href={`mailto:${v}`}>{v}</a> : v}
              {k === founderRow[0] && (
                <a className="inline-link" href="/portfolio">
                  {t.company.founderLink} →
                </a>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Contact() {
  const t = useCopy();
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <h2 className="label" id="contact-title">
        {t.contact.label}
      </h2>
      <p className="contact-lead">{t.contact.lead}</p>
      <a className="contact-mail" href="mailto:contact@enludus.com">
        contact@enludus.com
      </a>
    </section>
  );
}

function Footer() {
  const t = useCopy();
  return (
    <footer className="ft">
      <a className="hd-brand" href="#top">
        <LogoMark />
        <span>Enludus</span>
      </a>
      <nav aria-label="Footer">
        <a href="#products">{t.nav.products}</a>
        <a href="/blog">{t.nav.journal}</a>
        <a href="/portfolio">{t.nav.founder}</a>
        <a href="/privacy">{t.footer.privacy}</a>
      </nav>
      <span>© 2026 Enludus</span>
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
