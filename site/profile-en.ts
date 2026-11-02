// English version of site/profile.ts for /en/portfolio. Same facts, same order.
import type { Work } from "./profile";

export const personEn = {
  name: "Ibuki Nagase",
  role: "Runs Enludus / Software engineer",
  school: "Osaka Electro-Communication University, Faculty of Information Science and Arts, Dept. of Digital Games (graduating March 2028)",
  lead: "I build products on a backend foundation, across web, iOS and AI, to make everyday things that should be easy actually easy.",
};

export const worksEn: Work[] = [
  {
    name: "StudyReel",
    category: "iOS / Learning",
    status: "On the App Store",
    summary: "An iOS app that records study time and turns the session into a time-lapse.",
    problem:
      "As a cram-school tutor I kept hearing “I can't show my parents that I studied at home.” Self-reported hours don't capture the work itself; I wanted to record the process.",
    approach:
      "Photograph the desk at intervals and assemble a time-lapse by default, to spare the battery and the time it takes to look back; Pro adds full recording for when you want everything. There is also a timer-only mode and a home-screen widget. Up to version 1.8 I added goals with a D-day, a weekly vlog, past exam papers, iCloud backup and study buddies.",
    learning:
      "Real use showed that screen dimming and display modes change how the app behaves. I turned those into a per-setting checklist and keep improving against it.",
    stack: ["Swift", "SwiftUI", "SwiftData", "WidgetKit"],
    links: [
      { label: "App Store", href: "https://apps.apple.com/jp/app/studyreel/id6756177589" },
      { label: "Blog post", href: "/blog/studyreel-behind" },
    ],
    shot: { base: "/img/products/studyreel-en", widths: [400, 800], ratio: 869 / 400, alt: "StudyReel gallery: study sessions listed by date", shape: "phone" },
  },
  {
    name: "job match",
    category: "Web / Applied AI",
    status: "Live at career.enludus.com",
    summary: "A career tool that reads public job posts against what you care about.",
    problem: "Every company writes its requirements differently, so it is hard to tell whether a job actually fits you.",
    approach:
      "Collect and structure public information, then sort it into what matches, what doesn't, and what the post never says. AI organises the material; the decision stays with the person.",
    stack: ["React", "TypeScript", "Hono", "Supabase"],
    links: [
      { label: "Open job match", href: "https://career.enludus.com" },
      { label: "Blog post", href: "/blog/career" },
    ],
    shot: { base: "/img/products/career", widths: [400, 800], ratio: 867 / 400, alt: "job match result for a sample company: 5 matches, 1 difference, 2 unknowns", shape: "phone" },
  },
  {
    name: "Useful Map",
    category: "iOS / Mobility",
    status: "On the App Store",
    summary: "A map app that compares ways to travel before you open directions.",
    problem: "Whether to walk, take the train or drive usually means switching between several route apps.",
    approach:
      "Put the options side by side and split a route into readable segments. For step-by-step transit, hand the trip to Google Maps instead of rebuilding it.",
    stack: ["Swift", "SwiftUI", "MapKit", "Core Location"],
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/jp/app/useful-map-%E7%B5%8C%E8%B7%AF%E6%AF%94%E8%BC%83/id6801771854",
      },
      { label: "Blog post", href: "/blog/useful-map" },
    ],
    shot: { base: "/img/products/usefulmap", widths: [400, 800], ratio: 869 / 400, alt: "Useful Map: a route from Ochanomizu to Tokyo split into walking and train segments", shape: "phone" },
  },
  {
    name: "Logiscore",
    category: "Rust / WebAssembly",
    status: "Live at logiscore.enludus.com",
    summary: "A browser app that turns text or code into music, and a recording back into the exact file.",
    problem:
      "I wanted to experience the structure of source code as something other than text, without sending the code anywhere outside the browser.",
    approach:
      "The conversion engine is Rust compiled to WebAssembly. Error correction and optional password encryption also run in the browser, separate from the React side that plays and records.",
    learning:
      "Balancing exactness as data with how it sounds as music, and testing until a file survives a speaker and a microphone.",
    stack: ["Rust", "WebAssembly", "React", "Web Audio"],
    links: [
      { label: "Try Logiscore", href: "https://logiscore.enludus.com" },
      { label: "GitHub", href: "https://github.com/naki0227/logiscore" },
      { label: "Blog post", href: "/blog/logiscore-sound" },
    ],
    shot: { base: "/img/products/logiscore", widths: [800, 1440], ratio: 900 / 1440, alt: "Logiscore: source code on the left, the generated score on the right", shape: "screen" },
  },
  {
    name: "Gojuon Minesweeper",
    category: "Game / Expo",
    status: "On the web and the App Store",
    summary: "A word-guessing game played on the kana chart: two players on one screen, online matches, and modes for playing alone.",
    problem: "I wanted the “reason from the numbers” fun of Minesweeper as a word game two people can play around one screen.",
    approach:
      "The kana chart is the board; mine counts are the clues to the hidden word. Online matches (with a shared passphrase or a random opponent, served by Supabase), an Endless mode for one player and a daily puzzle at 7 every morning all reuse the same rules code. Over 14,000 Japanese answers and over 7,700 English ones. Web and iOS come from the same Expo codebase.",
    stack: ["Expo", "React Native", "TypeScript", "Supabase"],
    links: [
      { label: "Play on the web", href: "https://minesweeper.enludus.com" },
      { label: "App Store", href: "https://apps.apple.com/jp/app/id6819539119" },
      { label: "Blog post", href: "/blog/gojuon-minesweeper" },
    ],
    shot: { base: "/img/products/minesweeper", widths: [400, 800], ratio: 867 / 400, alt: "Gojuon Minesweeper: choosing a genre before a match", shape: "phone" },
  },
  {
    name: "Asobi Yokocho",
    category: "Web / Game",
    status: "Live at asobi.enludus.com",
    summary: "A row of browser mini games — no sign-in, no install — with a new stall added one at a time.",
    problem:
      "I wanted small games you can start in a spare minute and want to retry right away, built on Japanese pastimes and small everyday motions like kendama or ring toss.",
    approach:
      "A coding agent writes the game code; I choose the subjects, write the shared spec and decide what gets checked before release. Success is decided by the physics, and difficulty is tuned by letting bots play and measuring the success rate. Records stay in the player's browser.",
    learning:
      "Once building gets fast, writing down what to check becomes the main job. Every fix goes back into the spec as one more line, so it helps the next game too.",
    stack: ["JavaScript", "three.js", "Rapier", "matter.js"],
    links: [
      { label: "Play", href: "https://asobi.enludus.com" },
      { label: "Blog post", href: "/blog/asobi-yokocho" },
      { label: "GitHub", href: "https://github.com/naki0227/mini-game" },
    ],
    shot: { base: "/img/products/asobi-yokocho", widths: [400, 600], ratio: 1140 / 600, alt: "Nigiri stack: ten pieces of sushi stacked straight on a plate under swinging chopsticks", shape: "phone" },
  },
  {
    name: "Umeda Underground Navi",
    category: "PWA / Navigation",
    status: "In development",
    summary: "A wayfinding PWA for the underground malls of Umeda, where GPS doesn't reach.",
    problem: "Umeda's underground has many exits and passages and is easy to get lost in, and GPS is barely usable below ground.",
    approach:
      "Estimate your position once, from the entrance you came in by or a shop you can see, then guide you segment by segment. The map is built from OpenStreetMap and shipped with the app; route search (Dijkstra) and the estimate both run on the device. While guiding, a first-person drawing shows the passage ahead.",
    learning:
      "On a flat map the important landmarks got buried, so I reworked the label priorities and show fine detail only when it's needed. Checking the map data on site and testing on real phones are still to do.",
    stack: ["React", "Vite", "PWA", "OpenStreetMap"],
    links: [
      { label: "Open", href: "https://umeda.enludus.com" },
      { label: "Blog post", href: "/blog/umeda-underground-map" },
    ],
    shot: { base: "/img/products/umeda", widths: [400, 600], ratio: 1298 / 600, alt: "Umeda Underground Navi while guiding: a small heading-up map with “77 m, turn left”, and a full-screen drawing of the passage with shop signs on both sides", shape: "phone" },
  },
];

export const capabilitiesEn = [
  {
    label: "Backend",
    title: "Solid foundations.",
    text: "APIs and processing pipelines in Go and Rust, with clear boundaries for errors, state and data so later changes are easy to follow.",
    tags: "Go / Rust / Java / PostgreSQL",
  },
  {
    label: "Product",
    title: "Start from the problem.",
    text: "Whose problem, and what exactly? I sort out requirements in conversation and shape them into what the experience needs, from web to iOS.",
    tags: "TypeScript / React / Swift",
  },
  {
    label: "Operations",
    title: "Past “it works”.",
    text: "Shipping isn't the end: I look through to testing and operations, and I'm learning AWS and containers to understand whole systems.",
    tags: "Docker / GitHub Actions / AWS (learning)",
  },
];

export const skillsEn = [
  ["Backend", "Go / Rust", "API design and implementation, async processing, errors and state. Java / Spring Boot for study and projects."],
  ["Web", "TypeScript / React", "Apps with Next.js and Vite, with attention to the UI/logic boundary and consistent types."],
  ["Mobile", "Swift / Flutter", "SwiftUI, SwiftData, WidgetKit, MapKit — designing for each app's experience and the device's limits."],
  ["Infra", "AWS / Kubernetes / Terraform", "EKS, IAM, OIDC and CI/CD in a learning environment; Docker and GitHub Actions day to day."],
  ["Data & AI", "PostgreSQL / Python / Wasm", "Persistence, AI APIs and on-device processing, with boundaries chosen per use."],
] as const;

export const aboutEn = [
  "I build products around backend development, using web, iOS and AI. Go and Rust are my main tools, but I choose the technology to fit what needs to exist.",
  "Working in customer service and as a tutor taught me to listen first and understand what is actually in the way. StudyReel itself began with a student's question.",
  "Beyond APIs, I'm learning to build and run systems on AWS and Kubernetes, widening how much of a system I understand so I can lead from requirements through design.",
];

export const factsEn = [
  ["University", "Osaka Electro-Communication University", "2024.04 — 2028.03 (expected)"],
  ["Language", "TOEIC L&R 750", "2026.07"],
  ["Enludus", "Sole proprietor", "Building and running iOS apps and web services"],
] as const;

export const activitiesEn = [
  ["Community", "OECU TECH", "Started a tech community at my university — a place to learn and share."],
  ["Work", "USJ / Tutor", "Area leader at Universal Studios Japan. Questions from students as a tutor led to learning apps like StudyReel."],
  ["Outside of code", "Bouldering", "Captain of my high-school climbing club, 3rd at the prefectural tournament. I still love working out a problem on the wall."],
  ["Favorite", "Minecraft", "My favourite game — thinking freely and building things up a little at a time."],
] as const;
