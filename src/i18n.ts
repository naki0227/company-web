export type Lang = "en" | "ja";

export const homePath: Record<Lang, string> = { en: "/", ja: "/ja" };

export type Product = {
  id: string;
  name: string;
  what: string;
  platform: string;
  since: string;
  headline: string;
  body: string;
  specs: [string, string][];
  image: { base: string; widths: number[]; ratio: number; alt: string; shape: "phone" | "screen" };
  links: { label: string; href: string }[];
};

const en = {
  meta: {
    homeLabel: "Enludus home",
    navLabel: "Primary",
    switchLabel: "Language",
  },
  nav: {
    products: "Products",
    journal: "Blog",
    founder: "Founder",
    company: "Company",
    contact: "Contact",
  },
  hero: {
    label: "Enludus — Osaka, Japan",
    title: "Five apps, made and run from Osaka.",
    lead: "A study recorder, a travel-mode comparer, a job-fit checker, a tool that sends data as sound, and a word-guessing game. Each one started from a specific annoyance.",
    indexHead: ["No.", "Name", "What it does", "Runs on", "Since"],
  },
  products: {
    label: "Products",
    specsLabel: "Details",
    guide: "Guide (Japanese)",
    items: [
      {
        id: "studyreel",
        name: "StudyReel",
        what: "Records how you study",
        platform: "iPhone / iPad",
        since: "2025.12",
        headline: "Put the phone on the desk. Your study session becomes a time-lapse.",
        body: "A timer alone says “2 hours”. StudyReel also keeps what those two hours looked like — a short time-lapse, saved by date, with faces mosaicked if you want. Recording is optional: it works as a plain timer too.",
        specs: [
          ["Platform", "iOS 18.5+, iPhone and iPad"],
          ["Released", "December 2025 on the App Store"],
          ["Built with", "Swift, SwiftUI, SwiftData, WidgetKit"],
          ["Price", "Free, with StudyReel Pro in-app purchase"],
        ],
        image: { base: "/img/products/studyreel-en", widths: [400, 800], ratio: 869 / 400, alt: "StudyReel gallery: study sessions listed by date", shape: "phone" },
        links: [
          { label: "App Store", href: "https://apps.apple.com/jp/app/studyreel/id6756177589" },
        ],
      },
      {
        id: "usefulmap",
        name: "UsefulMap",
        what: "Compares how to get there",
        platform: "iPhone / iPad",
        since: "2026.08",
        headline: "Walk, train or car — decide before you open directions.",
        body: "UsefulMap lines up the ways to make a trip and splits a route into segments you can read at a glance. When you need every transfer, it hands the trip to Google Maps instead of rebuilding a transit planner.",
        specs: [
          ["Platform", "iOS 17+, iPhone and iPad"],
          ["Released", "August 2026 on the App Store"],
          ["Built with", "Swift, SwiftUI, MapKit, Core Location"],
          ["Price", "Free"],
        ],
        image: { base: "/img/products/usefulmap", widths: [400, 800], ratio: 869 / 400, alt: "UsefulMap: a route from Ochanomizu to Tokyo split into walking and train segments", shape: "phone" },
        links: [
          { label: "App Store", href: "https://apps.apple.com/jp/app/useful-map-%E7%B5%8C%E8%B7%AF%E6%AF%94%E8%BC%83/id6801771854" },
        ],
      },
      {
        id: "career",
        name: "Career",
        what: "Checks if a job fits you",
        platform: "Web",
        since: "Live",
        headline: "Read job posts against what you actually care about.",
        body: "Every company writes requirements differently. Career collects public job information and sorts it into what matches you, what doesn't, and what the post never says — so the open questions are clear before you apply.",
        specs: [
          ["Platform", "Web, sign in with Google"],
          ["Address", "career.enludus.com"],
          ["Built with", "React, TypeScript, Hono, Supabase"],
        ],
        image: { base: "/img/products/career", widths: [400, 800], ratio: 867 / 400, alt: "Career match result for a sample company: 5 matches, 1 difference, 2 unknowns", shape: "phone" },
        links: [{ label: "Open Career", href: "https://career.enludus.com" }],
      },
      {
        id: "logiscore",
        name: "Logiscore",
        what: "Sends data as sound",
        platform: "Web",
        since: "Live",
        headline: "Play a file out loud. Record it on another device. Get the exact file back.",
        body: "Logiscore turns text, source code or a whole folder into music. Error correction and optional password encryption run in Rust compiled to WebAssembly, inside your browser — nothing is uploaded.",
        specs: [
          ["Platform", "Web (desktop browsers)"],
          ["Address", "logiscore.enludus.com"],
          ["Built with", "Rust, WebAssembly, React, Web Audio"],
          ["Data", "Processed in the browser only"],
        ],
        image: { base: "/img/products/logiscore", widths: [800, 1440], ratio: 900 / 1440, alt: "Logiscore: source code on the left, the generated score on the right", shape: "screen" },
        links: [
          { label: "Try Logiscore", href: "https://logiscore.enludus.com" },
          { label: "Source", href: "https://github.com/naki0227/logiscore" },
        ],
      },
      {
        id: "minesweeper",
        name: "Gojuon Minesweeper",
        what: "A word-guessing game",
        platform: "Web",
        since: "Live",
        headline: "Minesweeper on the kana chart. Read the numbers, guess the word.",
        body: "Two players share one screen. Open safe letters, use the mine counts as clues, and name the hidden word before the other player does. The Japanese board alone has 14,016 answers.",
        specs: [
          ["Platform", "Web (iOS version in review)"],
          ["Address", "minesweeper.enludus.com"],
          ["Built with", "Expo, React Native, TypeScript"],
          ["Answers", "14,016 in Japanese, plus English"],
        ],
        image: { base: "/img/products/minesweeper", widths: [400, 800], ratio: 867 / 400, alt: "Gojuon Minesweeper: choosing a genre before a match", shape: "phone" },
        links: [{ label: "Play on the web", href: "https://minesweeper.enludus.com" }],
      },
    ] as Product[],
    guidePaths: {
      studyreel: "/products/studyreel",
      usefulmap: "/products/useful-map",
      career: "/products/career",
      logiscore: "/products/logiscore",
      minesweeper: "/products/gojuon-minesweeper",
    } as Record<string, string>,
  },
  decisions: {
    label: "Decisions we keep making",
    items: [
      {
        title: "Make the heavy part optional.",
        body: "StudyReel can record you, but it never has to. The camera is a choice; the timer works on its own.",
        product: "StudyReel",
      },
      {
        title: "Keep data where it is.",
        body: "Logiscore encodes, encrypts and decodes in the browser. There is no server that could see the file.",
        product: "Logiscore",
      },
      {
        title: "Don't rebuild what already works.",
        body: "UsefulMap answers “which way?” and leaves step-by-step transit to Google Maps.",
        product: "UsefulMap",
      },
    ],
  },
  journal: {
    label: "From the blog",
    all: "All posts",
    note: "Posts are written in Japanese.",
  },
  company: {
    label: "Company",
    rows: [
      ["Name", "Enludus"],
      ["Founder", "Ibuki Nagase"],
      ["Location", "Osaka, Japan"],
      ["Work", "Planning, building and running iOS apps and web services"],
      ["Name origin", "Enlightenment + Ludus (Latin for play)"],
      ["Contact", "contact@enludus.com"],
    ] as [string, string][],
    founderLink: "Founder's portfolio",
  },
  contact: {
    label: "Contact",
    lead: "Questions about a product, bug reports, or work together — all by email.",
  },
  footer: {
    privacy: "Privacy",
  },
};

export type Copy = typeof en;

const ja: Copy = {
  meta: {
    homeLabel: "Enludus トップページ",
    navLabel: "メインメニュー",
    switchLabel: "表示言語",
  },
  nav: {
    products: "製品",
    journal: "ブログ",
    founder: "代表",
    company: "会社概要",
    contact: "お問い合わせ",
  },
  hero: {
    label: "Enludus — 大阪",
    title: "大阪で、5つのアプリをつくって、運営しています。",
    lead: "勉強の記録、移動手段の比較、求人の見比べ、音でデータを送る道具、ことば当てゲーム。どれも、身近な「ちょっと面倒」をひとつ減らすところから始めました。",
    indexHead: ["No.", "名前", "できること", "対応", "公開"],
  },
  products: {
    label: "製品",
    specsLabel: "仕様",
    guide: "使い方を読む",
    items: [
      {
        id: "studyreel",
        name: "StudyReel",
        what: "勉強の様子を記録する",
        platform: "iPhone / iPad",
        since: "2025.12",
        headline: "机にスマホを置くだけで、勉強した時間がタイムラプスになる。",
        body: "タイマーだけだと「2時間」という数字しか残りません。StudyReel はその2時間の様子も、短いタイムラプスとして日付ごとに残します。顔はモザイクで隠せます。撮影はしなくても、ふつうのタイマーとして使えます。",
        specs: [
          ["対応", "iOS 18.5 以降、iPhone・iPad"],
          ["公開", "2025年12月、App Store"],
          ["技術", "Swift, SwiftUI, SwiftData, WidgetKit"],
          ["料金", "無料（StudyReel Pro をアプリ内で購入可）"],
        ],
        image: { base: "/img/products/studyreel-ja", widths: [400, 800], ratio: 869 / 400, alt: "StudyReel のギャラリー画面。勉強の記録が日付ごとに並ぶ", shape: "phone" },
        links: [{ label: "App Store", href: "https://apps.apple.com/jp/app/studyreel/id6756177589" }],
      },
      {
        id: "usefulmap",
        name: "UsefulMap",
        what: "移動手段を比べる",
        platform: "iPhone / iPad",
        since: "2026.08",
        headline: "歩くか、電車か、車か。経路を開く前に決められる。",
        body: "移動のしかたを並べて比べ、ルートをひと目で読める区間に分けて表示します。乗り換えの細かい案内が必要なときは、乗換案内を作り直さずに Google マップへ引き継ぎます。",
        specs: [
          ["対応", "iOS 17 以降、iPhone・iPad"],
          ["公開", "2026年8月、App Store"],
          ["技術", "Swift, SwiftUI, MapKit, Core Location"],
          ["料金", "無料"],
        ],
        image: { base: "/img/products/usefulmap", widths: [400, 800], ratio: 869 / 400, alt: "UsefulMap の画面。御茶ノ水駅から東京駅までを徒歩と電車の区間に分けて表示", shape: "phone" },
        links: [
          { label: "App Store", href: "https://apps.apple.com/jp/app/useful-map-%E7%B5%8C%E8%B7%AF%E6%AF%94%E8%BC%83/id6801771854" },
        ],
      },
      {
        id: "career",
        name: "Career",
        what: "求人が自分に合うか確かめる",
        platform: "Web",
        since: "公開中",
        headline: "求人票を、自分が大事にしたいことと並べて読む。",
        body: "求人の条件は会社ごとに書き方がばらばらです。Career は公開されている求人情報を集め、「合っている点」「合っていない点」「求人に書かれていない点」に分けて見せます。応募の前に、確かめるべきことがはっきりします。",
        specs: [
          ["対応", "Web（Google でログイン）"],
          ["URL", "career.enludus.com"],
          ["技術", "React, TypeScript, Hono, Supabase"],
        ],
        image: { base: "/img/products/career", widths: [400, 800], ratio: 867 / 400, alt: "Career の分析結果画面（サンプル企業）。近い 5、相違 1、不明 2", shape: "phone" },
        links: [{ label: "Career を開く", href: "https://career.enludus.com" }],
      },
      {
        id: "logiscore",
        name: "Logiscore",
        what: "データを音にして送る",
        platform: "Web",
        since: "公開中",
        headline: "ファイルを音で鳴らして、別の端末で録音すると、元のファイルに戻る。",
        body: "テキストやソースコード、フォルダごとを音楽に変換します。誤り訂正と任意のパスワード暗号化は、WebAssembly にした Rust がブラウザの中で行います。どこにもアップロードしません。",
        specs: [
          ["対応", "Web（パソコンのブラウザ）"],
          ["URL", "logiscore.enludus.com"],
          ["技術", "Rust, WebAssembly, React, Web Audio"],
          ["データ", "ブラウザの中だけで処理"],
        ],
        image: { base: "/img/products/logiscore", widths: [800, 1440], ratio: 900 / 1440, alt: "Logiscore の画面。左にソースコード、右に生成された楽譜", shape: "screen" },
        links: [
          { label: "Logiscore を試す", href: "https://logiscore.enludus.com" },
          { label: "ソースコード", href: "https://github.com/naki0227/logiscore" },
        ],
      },
      {
        id: "minesweeper",
        name: "五十音マインスイーパー",
        what: "ことば当てゲーム",
        platform: "Web",
        since: "公開中",
        headline: "五十音表でマインスイーパー。数字を読んで、ことばを当てる。",
        body: "ひとつの画面を2人で囲んで遊びます。安全な文字を開き、地雷の数を手がかりに、相手より先に答えのことばを見つけます。日本語の問題だけで 14,016 問あります。",
        specs: [
          ["対応", "Web（iOS 版は審査・配信準備中）"],
          ["URL", "minesweeper.enludus.com"],
          ["技術", "Expo, React Native, TypeScript"],
          ["問題数", "日本語 14,016 問、英語もあり"],
        ],
        image: { base: "/img/products/minesweeper", widths: [400, 800], ratio: 867 / 400, alt: "五十音マインスイーパーの画面。対戦前にジャンルを選ぶ", shape: "phone" },
        links: [{ label: "Web で遊ぶ", href: "https://minesweeper.enludus.com" }],
      },
    ],
    guidePaths: en.products.guidePaths,
  },
  decisions: {
    label: "いつも決めていること",
    items: [
      {
        title: "重い機能は、使わなくてもいいようにする。",
        body: "StudyReel は撮影できますが、撮影しなくても使えます。カメラは選べる機能で、タイマーだけでも成り立ちます。",
        product: "StudyReel",
      },
      {
        title: "データは、手元から出さない。",
        body: "Logiscore は変換も暗号化も復元も、ブラウザの中で行います。ファイルを見られるサーバーが、そもそもありません。",
        product: "Logiscore",
      },
      {
        title: "すでに良いものは、作り直さない。",
        body: "UsefulMap が答えるのは「どう行くか」まで。乗り換えの細かい案内は Google マップに任せています。",
        product: "UsefulMap",
      },
    ],
  },
  journal: {
    label: "ブログ",
    all: "記事一覧",
    note: "",
  },
  company: {
    label: "会社概要",
    rows: [
      ["名称", "Enludus"],
      ["代表", "長瀬 唯楓"],
      ["所在地", "大阪府"],
      ["事業内容", "iOS アプリ・Web サービスの企画、開発、運営"],
      ["名前の由来", "Enlightenment（啓蒙）＋ Ludus（ラテン語で「遊び」）"],
      ["連絡先", "contact@enludus.com"],
    ],
    founderLink: "代表のポートフォリオ",
  },
  contact: {
    label: "お問い合わせ",
    lead: "製品についてのご質問、不具合のご報告、お仕事のご相談は、メールでお送りください。",
  },
  footer: {
    privacy: "プライバシーポリシー",
  },
};

export const copy: Record<Lang, Copy> = { en, ja };
