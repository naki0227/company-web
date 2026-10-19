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
      "Photograph the desk at intervals and assemble a time-lapse, instead of recording video the whole time, to spare the battery and the time it takes to look back. There is also a timer-only mode and a home-screen widget.",
    learning:
      "Real use showed that screen dimming and display modes change how the app behaves. I turned those into a per-setting checklist and keep improving against it.",
    stack: ["Swift", "SwiftUI", "SwiftData", "WidgetKit"],
    links: [{ label: "App Store", href: "https://apps.apple.com/jp/app/studyreel/id6756177589" }],
  },
  {
    name: "Career",
    category: "Web / Applied AI",
    status: "Live at career.enludus.com",
    summary: "A career tool that reads public job posts against what you care about.",
    problem: "Every company writes its requirements differently, so it is hard to tell whether a job actually fits you.",
    approach:
      "Collect and structure public information, then sort it into what matches, what doesn't, and what the post never says. AI organises the material; the decision stays with the person.",
    stack: ["React", "TypeScript", "Hono", "Supabase"],
    links: [{ label: "Open Career", href: "https://career.enludus.com" }],
  },
  {
    name: "UsefulMap",
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
    ],
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
    ],
  },
  {
    name: "Gojuon Minesweeper",
    category: "Game / Expo",
    status: "Playable on the web",
    summary: "A word-guessing game for two players sharing one screen, played on the kana chart.",
    problem: "I wanted the “reason from the numbers” fun of Minesweeper as a word game two people can play around one screen.",
    approach:
      "The kana chart is the board; mine counts are the clues to the hidden word. Web and iOS come from the same Expo codebase.",
    stack: ["Expo", "React Native", "TypeScript"],
    links: [{ label: "Play on the web", href: "https://minesweeper.enludus.com" }],
  },
  {
    name: "Nue",
    category: "Backend / Video",
    status: "In development",
    summary: "A video pipeline that connects AI analysis and rendering.",
    problem: "Editing effort keeps people from publishing video. I want to automate everything from import through analysis to export.",
    approach: "Split the roles: intake in Go, AI analysis in Python, video processing in Rust, connected through edit instructions.",
    learning:
      "Separating responsibilities and separating services are different decisions. Given the cost of running many containers, I'm considering consolidating into Rust.",
    stack: ["Rust", "Go", "Python", "FFmpeg"],
    links: [{ label: "GitHub", href: "https://github.com/naki0227/nue" }],
  },
  {
    name: "LP Anatomy",
    category: "Web Design / Study",
    status: "Updated daily",
    summary: "A study notebook that takes apart one well-made website a day, from the source.",
    problem: "I could tell a site was good, but not explain why in words and numbers.",
    approach:
      "Read the HTML, CSS and JS; measure colour, type, motion and transfer size; and turn them into patterns by mood. This page is built to that notebook's quality bar.",
    stack: ["HTML", "CSS", "Playwright"],
    links: [],
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
