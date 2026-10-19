import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { LangContext, useCopy, useLang } from "./copy-context";
import { homePath, type Lang } from "./i18n";

const ease = [0.16, 1, 0.3, 1] as const;

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M4 14 14 4M6 4h8v8" />
    </svg>
  );
}

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

function PointerGlow() {
  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const move = (event: PointerEvent) => {
      x.set(event.clientX - 180);
      y.set(event.clientY - 180);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced, x, y]);

  if (reduced) return null;
  return <motion.div className="pointer-glow" style={{ x, y }} />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="section-label">
      <span />
      {children}
    </div>
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
    <div className="lang-switch" role="group" aria-label={t.meta.switchLabel}>
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
    <header className="site-header">
      <a className="brand" href="#top" aria-label={t.meta.homeLabel}>
        <LogoMark />
        <span>Enludus</span>
      </a>
      <nav aria-label={t.meta.navLabel}>
        <a className="nav-secondary" href="#products">{t.nav.products}</a>
        <a className="nav-secondary" href="/portfolio">{t.nav.portfolio}</a>
        <a href="/blog">{t.nav.blog}</a>
        <LangSwitch />
        <a className="nav-contact" href="mailto:contact@enludus.com">
          {t.nav.contact}
          <ArrowUpRight />
        </a>
      </nav>
    </header>
  );
}

function HeroOrbit() {
  const t = useCopy();
  return (
    <div className="hero-orbit" aria-hidden="true">
      <div className="orbit-ring orbit-ring-one" />
      <div className="orbit-ring orbit-ring-two" />
      <div className="orbit-core">
        <LogoMark />
      </div>
      <motion.div
        className="orbit-card orbit-career"
        animate={{ y: [0, -8, 0], rotate: [-2, 0, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="orbit-icon">↗</span>
        <div>
          <strong>Career</strong>
          <small>{t.orbit.career}</small>
        </div>
      </motion.div>
      <motion.div
        className="orbit-card orbit-study"
        animate={{ y: [0, 10, 0], rotate: [3, 1, 3] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="record-dot" />
        <div>
          <strong>StudyReel</strong>
          <small>{t.orbit.study}</small>
        </div>
      </motion.div>
      <motion.div
        className="orbit-card orbit-map"
        animate={{ x: [0, 8, 0], rotate: [-1, 2, -1] }}
        transition={{ duration: 6.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="route-glyph">⌁</span>
        <div>
          <strong>UsefulMap</strong>
          <small>{t.orbit.map}</small>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  const t = useCopy();
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -70]);
  const opacity = useTransform(scrollYProgress, [0, 0.82], [1, 0]);

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-grid" />
      <motion.div className="hero-copy" style={{ y: copyY, opacity }}>
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          {t.hero.eyebrow}
        </motion.div>
        <h1>
          {t.hero.lines.map((line, index) => (
            <motion.span
              key={line}
              className={index === t.hero.lines.length - 1 ? "hero-accent" : undefined}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, delay: 0.08 * (index + 1), ease }}
            >
              {line}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="hero-lead"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.5, ease }}
        >
          {t.hero.lead}
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.62, ease }}
        >
          <a className="button button-dark" href="#products">
            {t.hero.cta}
            <span>↓</span>
          </a>
          <a className="text-link" href="mailto:contact@enludus.com">
            contact@enludus.com
            <ArrowUpRight />
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-visual"
        style={{ y: visualY, opacity }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.25, ease }}
      >
        <HeroOrbit />
      </motion.div>

      <div className="scroll-cue">
        <span>SCROLL</span>
        <i />
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["PRODUCT", "SOFTWARE", "MOBILE", "WEB", "APPLIED AI", "SYSTEMS"];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((group) => (
          <div className="marquee-group" key={group}>
            {items.map((item) => (
              <span key={item}>
                {item}
                <i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Intro() {
  const t = useCopy();
  return (
    <section className="intro shell">
      <SectionLabel>{t.intro.label}</SectionLabel>
      <div className="intro-grid">
        <motion.h2
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease }}
        >
          {t.intro.lead}
          <span>{t.intro.accent}</span>
          <br />
          {t.intro.rest}
        </motion.h2>
        <motion.div
          className="intro-copy"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, delay: 0.08, ease }}
        >
          {t.intro.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CareerVisual() {
  const t = useCopy();
  const bars = [92, 84, 78, 88].map(
    (value, index) => [t.career.bars[index], value] as const,
  );

  return (
    <div className="career-ui">
      <div className="career-topbar">
        <span className="mini-logo">C</span>
        <span>Career</span>
        <i />
      </div>
      <div className="career-content">
        <div className="career-role">
          <small>MATCH RESULT</small>
          <strong>{t.career.role}</strong>
          <span>{t.career.place}</span>
        </div>
        <div className="score-ring-wrap">
          <svg className="score-ring" viewBox="0 0 120 120">
            <circle className="score-track" cx="60" cy="60" r="48" />
            <motion.circle
              className="score-progress"
              cx="60"
              cy="60"
              r="48"
              pathLength="1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 0.86 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 1.4, ease }}
            />
          </svg>
          <div>
            <strong>86</strong>
            <span>{t.career.match}</span>
          </div>
        </div>
        <div className="career-bars">
          {bars.map(([label, value], index) => (
            <div className="career-bar-row" key={label}>
              <div>
                <span>{label}</span>
                <b>{value}</b>
              </div>
              <div className="career-bar-track">
                <motion.i
                  initial={{ width: 0 }}
                  whileInView={{ width: value + "%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1 * index, ease }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="career-insight">
          <span>↗</span>
          <p>{t.career.insight}</p>
        </div>
      </div>
    </div>
  );
}

function StudyReelVisual() {
  const t = useCopy();
  const heat = [
    0, 1, 2, 3, 1, 0, 2, 3, 4, 1, 2, 4, 3, 2, 1, 3, 4, 4, 2, 0, 1, 2, 3, 4,
    3, 1, 0, 2,
  ];

  return (
    <div className="study-stage">
      <motion.div
        className="study-note note-one"
        animate={{ y: [0, -9, 0], rotate: [-4, -2, -4] }}
        transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <small>TODAY</small>
        <strong>{t.study.total}</strong>
        <span>{t.study.delta}</span>
      </motion.div>

      <div className="phone">
        <div className="phone-island" />
        <div className="phone-screen">
          <div className="study-head">
            <span>StudyReel</span>
            <i>•••</i>
          </div>
          <div className="focus-label">
            <span className="record-dot" />
            FOCUSING
          </div>
          <strong className="timer">42:18</strong>
          <span className="subject">{t.study.subject}</span>
          <div className="study-wave">
            {[15, 32, 22, 44, 27, 50, 36, 61, 43, 28, 48, 35].map(
              (height, index) => (
                <motion.i
                  key={index}
                  animate={{ height: [height, height + 14, height] }}
                  transition={{
                    duration: 1.2 + index * 0.05,
                    repeat: Infinity,
                    delay: index * 0.04,
                    ease: "easeInOut",
                  }}
                />
              ),
            )}
          </div>
          <button type="button" tabIndex={-1}>
            {t.study.pause}
          </button>
        </div>
      </div>

      <motion.div
        className="study-note note-two"
        animate={{ y: [0, 8, 0], rotate: [4, 2, 4] }}
        transition={{ duration: 7.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="heatmap">
          {heat.map((level, index) => (
            <i key={index} data-level={level} />
          ))}
        </div>
        <span>{t.study.streak}</span>
      </motion.div>
    </div>
  );
}

function UsefulMapVisual() {
  const t = useCopy();
  return (
    <div className="map-ui">
      <div className="map-grid" />
      <div className="map-search">
        <span>⌕</span>
        <strong>{t.map.search}</strong>
        <i>×</i>
      </div>

      <svg className="route-svg" viewBox="0 0 600 430" aria-hidden="true">
        <path className="route-shadow" d="M98 332 C150 270 177 285 225 222 S330 118 389 163 448 225 518 92" />
        <motion.path
          className="route-line"
          d="M98 332 C150 270 177 285 225 222 S330 118 389 163 448 225 518 92"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.8, ease }}
        />
      </svg>

      <div className="map-pin pin-a"><i /></div>
      <div className="map-pin pin-b"><i /></div>
      <div className="map-pin pin-c"><i /></div>

      <div className="route-sheet">
        <div className="sheet-handle" />
        <div className="route-sheet-head">
          <div>
            <small>BEST BALANCE</small>
            <strong>{t.map.best}</strong>
          </div>
          <span>{t.map.arrive}</span>
        </div>
        <div className="transport-chain">
          <span>🚶 <b>6m</b></span>
          <i />
          <span>🚆 <b>22m</b></span>
          <i />
          <span>🚶 <b>6m</b></span>
        </div>
        <div className="route-options">
          {t.map.options.map((option, index) => (
            <button
              key={option}
              className={index === 1 ? "active" : undefined}
              type="button"
              tabIndex={-1}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type ProductCopyProps = {
  index: string;
  name: string;
  label: string;
  headline: string;
  body: string;
  tags: string[];
  primaryHref: string;
  primaryLabel: string;
  detailPath: string;
};

function ProductCopy({
  index,
  name,
  label,
  headline,
  body,
  tags,
  primaryHref,
  primaryLabel,
  detailPath,
}: ProductCopyProps) {
  const t = useCopy();
  return (
    <motion.div
      className="product-copy"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.75, ease }}
    >
      <div className="product-index">{index}</div>
      <div className="product-label">{label}</div>
      <h3>
        <span>{name}</span>
        {headline}
      </h3>
      <p>{body}</p>
      <div className="product-tags">
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="product-links">
        <a href={detailPath} className="source-link">
          {t.products.guide}
          <ArrowUpRight />
        </a>
        <a href={primaryHref} target="_blank" rel="noreferrer">
          {primaryLabel}
          <ArrowUpRight />
        </a>
      </div>
    </motion.div>
  );
}

function Products() {
  const t = useCopy();
  const items = t.products.items;
  return (
    <section className="products" id="products">
      <div className="shell products-heading">
        <SectionLabel>{t.products.label}</SectionLabel>
        <motion.h2
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease }}
        >
          {t.products.heading[0]}
          <br />
          {t.products.heading[1]}
        </motion.h2>
      </div>

      <article className="product product-career">
        <div className="shell product-grid">
          <ProductCopy
            index="01"
            name="Career"
            label={items.career.label}
            headline={items.career.headline}
            body={items.career.body}
            tags={["React", "TypeScript", "Hono", "Supabase", "Applied AI"]}
            primaryHref="https://career.enludus.com"
            primaryLabel={items.career.cta}
            detailPath="/products/career"
          />
          <motion.div
            className="product-visual career-visual"
            initial={{ opacity: 0, x: 70, rotate: 2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease }}
          >
            <CareerVisual />
          </motion.div>
        </div>
      </article>

      <article className="product product-study">
        <div className="shell product-grid product-grid-reverse">
          <motion.div
            className="product-visual study-visual"
            initial={{ opacity: 0, x: -70, rotate: -2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease }}
          >
            <StudyReelVisual />
          </motion.div>
          <ProductCopy
            index="02"
            name="StudyReel"
            label={items.study.label}
            headline={items.study.headline}
            body={items.study.body}
            tags={["Swift", "SwiftUI", "SwiftData", "WidgetKit"]}
            primaryHref="https://apps.apple.com/jp/app/studyreel/id6756177589"
            primaryLabel={items.study.cta}
            detailPath="/products/studyreel"
          />
        </div>
      </article>

      <article className="product product-map">
        <div className="shell product-grid">
          <ProductCopy
            index="03"
            name="UsefulMap"
            label={items.map.label}
            headline={items.map.headline}
            body={items.map.body}
            tags={["Swift", "SwiftUI", "MapKit", "Core Location"]}
            primaryHref="https://apps.apple.com/jp/app/useful-map-%E7%B5%8C%E8%B7%AF%E6%AF%94%E8%BC%83/id6801771854"
            primaryLabel={items.map.cta}
            detailPath="/products/useful-map"
          />
          <motion.div
            className="product-visual map-visual"
            initial={{ opacity: 0, x: 70, rotate: 2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease }}
          >
            <UsefulMapVisual />
          </motion.div>
        </div>
      </article>

      <article className="product product-logiscore">
        <div className="shell product-grid product-grid-reverse">
          <motion.div
            className="product-visual"
            initial={{ opacity: 0, x: -55 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.85, ease }}
          >
            <LogiscoreVisual />
          </motion.div>
          <ProductCopy
            index="04"
            name="Logiscore"
            label={items.logiscore.label}
            headline={items.logiscore.headline}
            body={items.logiscore.body}
            tags={["Rust", "WebAssembly", "React", "TypeScript", "Web Audio"]}
            primaryHref="https://logiscore.enludus.com"
            primaryLabel={items.logiscore.cta}
            detailPath="/products/logiscore"
          />
        </div>
      </article>
      <article className="product product-minesweeper">
        <div className="shell product-grid">
          <ProductCopy
            index="05"
            name="五十音マインスイーパー"
            label={items.minesweeper.label}
            headline={items.minesweeper.headline}
            body={items.minesweeper.body}
            tags={["Expo", "React Native", "TypeScript", "Web", "iOS"]}
            primaryHref="https://minesweeper.enludus.com"
            primaryLabel={items.minesweeper.cta}
            detailPath="/products/gojuon-minesweeper"
          />
          <motion.div
            className="product-visual"
            initial={{ opacity: 0, x: 55 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.85, ease }}
          >
            <MinesweeperVisual />
          </motion.div>
        </div>
      </article>
    </section>
  );
}


function LogiscoreVisual() {
  const t = useCopy();
  const notes = [
    { tone: "G", left: "12%", top: "24%" },
    { tone: "A", left: "27%", top: "48%" },
    { tone: "C", left: "43%", top: "14%" },
    { tone: "E", left: "61%", top: "38%" },
    { tone: "B", left: "79%", top: "22%" },
  ];
  return (
    <div className="logiscore-art" aria-label={t.logiscoreArt}>
      <div className="logiscore-source">
        <span>01&nbsp;&nbsp;fn main() &#123;</span>
        <span>02&nbsp;&nbsp;&nbsp;&nbsp;let sound = code;</span>
        <span>03&nbsp;&nbsp;&nbsp;&nbsp;play(sound);</span>
        <span>04&nbsp;&nbsp;&#125;</span>
      </div>
      <div className="logiscore-score">
        <span className="score-head">ENCODE → PLAY → RECORD → RESTORE</span>
        <div className="staff-lines" aria-hidden="true">
          {notes.map((note) => (
            <span className="score-note" key={note.tone}
                  style={{ left: note.left, top: note.top }}>♪</span>
          ))}
        </div>
        <div className="instrument-legend">
          <span>Reliable WAV · FEC</span><span>Secure · AEAD</span><span>MIDI · lossless</span>
        </div>
      </div>
    </div>
  );
}

function MinesweeperVisual() {
  const t = useCopy();
  const characters = [
    "わ", "ら", "や", "ま", "は", "な", "た", "さ", "か", "あ",
    "を", "り", "", "み", "ひ", "に", "ち", "し", "き", "い",
    "ん", "る", "ゆ", "む", "ふ", "ぬ", "つ", "す", "く", "う",
    "ー", "れ", "", "め", "へ", "ね", "て", "せ", "け", "え",
    "", "ろ", "よ", "も", "ほ", "の", "と", "そ", "こ", "お",
  ];
  const opened = new Map([[8, "2"], [9, "1"], [18, "2"], [27, "1"], [28, "2"], [37, "1"]]);
  return (
    <div className="minesweeper-art">
      <div className="minesweeper-top"><span>ごじゅうおん</span><span>1P ↔ 2P</span></div>
      <div className="minesweeper-board" aria-label="ゲーム盤のイメージ">
        {characters.map((char, index) => (
          <div key={index}
            className={"minesweeper-cell " + (!char ? "empty" : opened.has(index) ? "opened" : "")}>
            {char ? (opened.get(index) ?? char) : ""}
          </div>
        ))}
      </div>
      <div className="minesweeper-caption">{t.minesweeperCaption}</div>
    </div>
  );
}

function Principles() {
  const t = useCopy();
  const principles = t.principles.items.map((item, index) => ({
    ...item,
    number: String(index + 1).padStart(2, "0"),
  }));

  return (
    <section className="principles shell">
      <SectionLabel>{t.principles.label}</SectionLabel>
      <div className="principle-list">
        {principles.map((item, index) => (
          <motion.div
            className="principle"
            key={item.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.65, delay: index * 0.08, ease }}
          >
            <span>{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function About() {
  const t = useCopy();
  return (
    <section className="about" id="about">
      <div className="about-noise" />
      <div className="shell about-grid">
        <div className="about-copy">
          <SectionLabel>{t.about.label}</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease }}
          >
            {t.about.heading[0]}
            <br />
            {t.about.heading[1]}
          </motion.h2>
          {t.about.body.map((paragraph, index) => (
            <motion.p
              key={paragraph}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.75, delay: 0.08 + index * 0.06, ease }}
            >
              {paragraph}
            </motion.p>
          ))}
          <div className="about-links">
            <a href="/portfolio">
              {t.about.links.portfolio}
              <ArrowUpRight />
            </a>
            <a href="/blog">
              {t.about.links.blog}
              <ArrowUpRight />
            </a>
          </div>
        </div>
        <div className="about-facts">
          {t.about.facts.map(([label, value], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.08, ease }}
            >
              <small>{label}</small>
              <strong>{value}</strong>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const t = useCopy();
  return (
    <section className="contact shell" id="contact">
      <div className="contact-card">
        <div>
          <SectionLabel>{t.contact.label}</SectionLabel>
          <h2>
            {t.contact.heading[0]}
            <br />
            {t.contact.heading[1]}
          </h2>
        </div>
        <div className="contact-action">
          <p>{t.contact.body}</p>
          <a href="mailto:contact@enludus.com">
            contact@enludus.com
            <ArrowUpRight />
          </a>
        </div>
        <div className="contact-orb" aria-hidden="true">
          <LogoMark />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const t = useCopy();
  return (
    <footer className="footer shell">
      <a className="brand" href="#top">
        <LogoMark />
        <span>Enludus</span>
      </a>
      <p>{t.footer.tagline}</p>
      <div>
        <a href="/privacy">{t.footer.privacy}</a>
        <a href="/blog">{t.nav.blog}</a>
        <a href="/portfolio">{t.nav.portfolio}</a>
        <a href="mailto:contact@enludus.com">{t.footer.contact}</a>
        <span>© 2026 Enludus</span>
      </div>
    </footer>
  );
}

export default function App({ lang }: { lang: Lang }) {
  return (
    <LangContext.Provider value={lang}>
      <PointerGlow />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Intro />
        <Products />
        <Principles />
        <About />
        <Contact />
      </main>
      <Footer />
    </LangContext.Provider>
  );
}
