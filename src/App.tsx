import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

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

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Enludus home">
        <LogoMark />
        <span>Enludus</span>
      </a>
      <nav aria-label="Primary">
        <a href="#products">Products</a>
        <a href="#about">About</a>
        <a className="nav-contact" href="mailto:contact@enludus.com">
          Contact
          <ArrowUpRight />
        </a>
      </nav>
    </header>
  );
}

function HeroOrbit() {
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
          <small>make a clearer choice</small>
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
          <small>make effort visible</small>
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
          <small>compare before moving</small>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
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
          Independent software studio · Japan
        </motion.div>
        <h1>
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease }}
          >
            Building software
          </motion.span>
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.16, ease }}
          >
            that turns friction
          </motion.span>
          <motion.span
            className="hero-accent"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.85, delay: 0.24, ease }}
          >
            into better experiences.
          </motion.span>
        </h1>
        <motion.p
          className="hero-lead"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.5, ease }}
        >
          Enludus is a bootstrapped software studio building focused products
          for learning, movement, and career decisions.
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.62, ease }}
        >
          <a className="button button-dark" href="#products">
            Explore products
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
  return (
    <section className="intro shell">
      <SectionLabel>How we think</SectionLabel>
      <div className="intro-grid">
        <motion.h2
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease }}
        >
          We start with the
          <span> problem,</span>
          <br />
          not the stack.
        </motion.h2>
        <motion.div
          className="intro-copy"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, delay: 0.08, ease }}
        >
          <p>
            Good software earns its place by reducing friction. We begin with
            the decision, routine, or workflow that feels harder than it should,
            then build the smallest system that makes it meaningfully better.
          </p>
          <p>
            AI is part of the toolbox when it improves the experience — never
            the reason a product exists.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function CareerVisual() {
  const bars = [
    ["Work style", 92],
    ["Growth", 84],
    ["Culture", 78],
    ["Compensation", 88],
  ] as const;

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
          <strong>Backend Engineer</strong>
          <span>Sample opportunity · Tokyo / Hybrid</span>
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
            <span>match</span>
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
          <p>
            Strong alignment on work style. Check the gap in team structure
            before deciding.
          </p>
        </div>
      </div>
    </div>
  );
}

function StudyReelVisual() {
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
        <strong>3h 24m</strong>
        <span>+18% from last week</span>
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
          <span className="subject">System Design</span>
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
            Pause session
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
        <span>28 day consistency</span>
      </motion.div>
    </div>
  );
}

function UsefulMapVisual() {
  return (
    <div className="map-ui">
      <div className="map-grid" />
      <div className="map-search">
        <span>⌕</span>
        <strong>Osaka Station</strong>
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
            <strong>34 min</strong>
          </div>
          <span>Arrive 19:42</span>
        </div>
        <div className="transport-chain">
          <span>🚶 <b>6m</b></span>
          <i />
          <span>🚆 <b>22m</b></span>
          <i />
          <span>🚶 <b>6m</b></span>
        </div>
        <div className="route-options">
          <button type="button" tabIndex={-1}>Fastest · 31m</button>
          <button className="active" type="button" tabIndex={-1}>Balanced · 34m</button>
          <button type="button" tabIndex={-1}>Walk more · 41m</button>
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
  sourceHref: string;
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
  sourceHref,
}: ProductCopyProps) {
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
        <a href={primaryHref} target="_blank" rel="noreferrer">
          {primaryLabel}
          <ArrowUpRight />
        </a>
        <a className="source-link" href={sourceHref} target="_blank" rel="noreferrer">
          Source
          <ArrowUpRight />
        </a>
      </div>
    </motion.div>
  );
}

function Products() {
  return (
    <section className="products" id="products">
      <div className="shell products-heading">
        <SectionLabel>Selected products</SectionLabel>
        <motion.h2
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease }}
        >
          Three focused products.
          <br />
          One way of building.
        </motion.h2>
      </div>

      <article className="product product-career">
        <div className="shell product-grid">
          <ProductCopy
            index="01"
            name="Career"
            label="Career decision support"
            headline="See the fit before making the leap."
            body="Career compares public job information with what matters to you, turning scattered requirements into a structured view of alignment, differences, and unknowns."
            tags={["React", "TypeScript", "Hono", "Supabase", "Applied AI"]}
            primaryHref="https://career.enludus.com"
            primaryLabel="Open Career"
            sourceHref="https://github.com/naki0227/job-match-analysis"
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
            label="Learning / iOS"
            headline="Turn effort into something you can see."
            body="StudyReel records the act of studying — not just a number on a timer — and makes progress visible through sessions, statistics, goals, and interactive widgets."
            tags={["Swift", "SwiftUI", "SwiftData", "WidgetKit"]}
            primaryHref="https://github.com/naki0227/StudyReel"
            primaryLabel="View project"
            sourceHref="https://github.com/naki0227/StudyReel"
          />
        </div>
      </article>

      <article className="product product-map">
        <div className="shell product-grid">
          <ProductCopy
            index="03"
            name="UsefulMap"
            label="Mobility / iOS"
            headline="Choose how to move before opening directions."
            body="UsefulMap compares travel modes and breaks a trip into understandable segments, while handing detailed public-transit directions off to Google Maps when you need them."
            tags={["Swift", "SwiftUI", "MapKit", "Core Location"]}
            primaryHref="https://github.com/naki0227/useful-map"
            primaryLabel="View project"
            sourceHref="https://github.com/naki0227/useful-map"
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
    </section>
  );
}

function Principles() {
  const principles = [
    {
      number: "01",
      title: "Understand first.",
      body: "Requirements, constraints, and the person behind the problem come before the implementation.",
    },
    {
      number: "02",
      title: "Design the system.",
      body: "Performance, reliability, cost, operations, and changeability are product decisions too.",
    },
    {
      number: "03",
      title: "Ship and learn.",
      body: "Working software creates the feedback that diagrams and assumptions cannot.",
    },
  ];

  return (
    <section className="principles shell">
      <SectionLabel>How we build</SectionLabel>
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
  return (
    <section className="about" id="about">
      <div className="about-noise" />
      <div className="shell about-grid">
        <div className="about-copy">
          <SectionLabel>About Enludus</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease }}
          >
            Small by design.
            <br />
            Serious about the details.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, delay: 0.08, ease }}
          >
            Enludus is an independent, bootstrapped software venture founded by
            Ibuki Nagase in Japan. We design and build products end-to-end,
            from problem discovery and system design to implementation,
            deployment, and operation.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, delay: 0.14, ease }}
          >
            Our current work spans web products, native iOS apps, backend
            systems, and practical uses of AI.
          </motion.p>
        </div>
        <div className="about-facts">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
          >
            <small>Based in</small>
            <strong>Japan</strong>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
          >
            <small>Structure</small>
            <strong>Bootstrapped</strong>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
          >
            <small>Founder</small>
            <strong>Ibuki Nagase</strong>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact shell" id="contact">
      <div className="contact-card">
        <div>
          <SectionLabel>Get in touch</SectionLabel>
          <h2>
            Have a problem
            <br />
            worth simplifying?
          </h2>
        </div>
        <div className="contact-action">
          <p>
            Product inquiries, collaborations, startup conversations, or just a
            thoughtful hello.
          </p>
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
  return (
    <footer className="footer shell">
      <a className="brand" href="#top">
        <LogoMark />
        <span>Enludus</span>
      </a>
      <p>Building useful software from Japan.</p>
      <div>
        <a href="https://github.com/naki0227" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <span>© 2026 Enludus</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
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
    </>
  );
}
