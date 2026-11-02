// Facts shown on /portfolio. Keep this to things that are public and true;
// the source of most of it is naki0227/portfolio (content/*.ts).

export const person = {
  latinFirst: "IBUKI",
  latinLast: "NAGASE",
  name: "長瀬 唯楓",
  role: "Enludus 代表 / ソフトウェアエンジニア",
  school: "大阪電気通信大学 総合情報学部 デジタルゲーム学科（2028年3月 卒業予定）",
  lead: "バックエンドを軸に、Web・iOS・AI で「本来もっと楽なはず」のことを作り直しています。",
  email: "contact@enludus.com",
  links: [
    { label: "GitHub", href: "https://github.com/naki0227" },
    { label: "Zenn", href: "https://zenn.dev/ibukinagase" },
    { label: "Enludus", href: "/ja" },
  ],
};

export type Work = {
  name: string;
  category: string;
  status: string;
  summary: string;
  problem: string;
  approach: string;
  learning?: string;
  stack: string[];
  links: { label: string; href: string }[];
  /** Screenshot under /img/products (`<base>-<width>.webp`), shown when the row is opened. */
  shot?: { base: string; widths: number[]; ratio: number; alt: string; shape: "phone" | "screen" };
};

export const works: Work[] = [
  {
    name: "StudyReel",
    category: "iOS / Learning",
    status: "App Store で公開中",
    summary: "勉強した時間と、その様子をタイムラプスで残す iOS アプリ。",
    problem:
      "塾講師として聞いた「家で勉強したことを、親に伝えられない」という声。時間の自己申告だけでは残せない、学習の過程を記録したかった。",
    approach:
      "学習風景を定期撮影してタイムラプスに。基本はタイムラプスでバッテリーと見返す時間に配慮し、全部を録画したいときは Pro の「全部録画」も選べる。撮影しない計測モードと、ホーム画面から使えるウィジェットも用意。1.8 までに、目標と D-day、1 週間の Vlog、過去問、iCloud バックアップ、勉強仲間などを足してきた。",
    learning:
      "画面の消灯や表示モードで動作が変わることを実際の利用で見つけた。端末設定ごとの確認項目を整理して改善している。",
    stack: ["Swift", "SwiftUI", "SwiftData", "WidgetKit"],
    links: [
      { label: "紹介ページ", href: "/products/studyreel" },
      { label: "App Store", href: "https://apps.apple.com/jp/app/studyreel/id6756177589" },
      { label: "記事", href: "/blog/studyreel-behind" },
    ],
    shot: { base: "/img/products/studyreel-ja", widths: [400, 800], ratio: 869 / 400, alt: "StudyReel のギャラリー画面。勉強の記録が日付ごとに並ぶ", shape: "phone" },
  },
  {
    name: "job match",
    category: "Web / Applied AI",
    status: "career.enludus.com で公開中",
    summary: "公開求人と自分の希望を照らし合わせる、キャリア選択の支援ツール。",
    problem:
      "求人の条件は会社ごとに書き方がばらばらで、自分に合うかどうかを比べにくい。",
    approach:
      "公開情報を集めて構造化し、希望との「合っている点・違う点・まだ分からない点」に分けて見せる。AI は整理の道具として使い、判断は本人に残す。",
    stack: ["React", "TypeScript", "Hono", "Supabase"],
    links: [
      { label: "紹介ページ", href: "/products/career" },
      { label: "job match を開く", href: "https://career.enludus.com" },
      { label: "記事", href: "/blog/career" },
    ],
    shot: { base: "/img/products/career", widths: [400, 800], ratio: 867 / 400, alt: "job match の分析結果画面（サンプル企業）。近い 5、相違 1、不明 2", shape: "phone" },
  },
  {
    name: "Useful Map",
    category: "iOS / Mobility",
    status: "App Store で公開中",
    summary: "経路を開く前に、移動手段を比べて選べる地図アプリ。",
    problem:
      "歩く・電車・車のどれが良いかは、経路アプリを何度も切り替えないと分からない。",
    approach:
      "移動手段を並べて比べ、ルートを分かりやすい区間に分けて表示。電車の細かい乗り換えは Google マップに引き継ぎ、作り込みすぎない。",
    stack: ["Swift", "SwiftUI", "MapKit", "Core Location"],
    links: [
      { label: "紹介ページ", href: "/products/useful-map" },
      {
        label: "App Store",
        href: "https://apps.apple.com/jp/app/useful-map-%E7%B5%8C%E8%B7%AF%E6%AF%94%E8%BC%83/id6801771854",
      },
      { label: "記事", href: "/blog/useful-map" },
    ],
    shot: { base: "/img/products/usefulmap", widths: [400, 800], ratio: 869 / 400, alt: "Useful Map の画面。御茶ノ水駅から東京駅までを徒歩と電車の区間に分けて表示", shape: "phone" },
  },
  {
    name: "Logiscore",
    category: "Rust / WebAssembly",
    status: "logiscore.enludus.com で公開中",
    summary: "テキストやコードを音楽に変え、録音から元に戻すブラウザアプリ。",
    problem:
      "ソースコードの構造を、文字を読む以外の体験に変えたい。手元のコードは外部に送らず、ブラウザの中で完結させたい。",
    approach:
      "Rust の変換エンジンを WebAssembly に。誤り訂正と任意のパスワード暗号化もブラウザ内で動かし、再生・録音を受け持つ React 側と分けた。",
    learning:
      "データとしての正確さと、音としての聴き心地の両立。スピーカーとマイクを挟んでも元に戻せるよう検証を重ねている。",
    stack: ["Rust", "WebAssembly", "React", "Web Audio"],
    links: [
      { label: "紹介ページ", href: "/products/logiscore" },
      { label: "Logiscore を試す", href: "https://logiscore.enludus.com" },
      { label: "GitHub", href: "https://github.com/naki0227/logiscore" },
      { label: "記事", href: "/blog/logiscore-sound" },
    ],
    shot: { base: "/img/products/logiscore", widths: [800, 1440], ratio: 900 / 1440, alt: "Logiscore の画面。左にソースコード、右に生成された楽譜", shape: "screen" },
  },
  {
    name: "五十音マインスイーパー",
    category: "Game / Expo",
    status: "Web・App Store で公開中",
    summary: "五十音とアルファベットの推理ゲーム。1つの画面を2人で囲むほか、オンライン対戦とひとり用のモードもある。",
    problem:
      "マインスイーパーの「数字から推理する」面白さを、1つの画面を囲んで2人で遊べることば遊びにしたい。",
    approach:
      "五十音表を盤面にして、地雷の数を手がかりに答えのことばを当てる。合言葉かランダムで相手と組むオンライン対戦（サーバーは Supabase）、ひとりで続けるエンドレス、毎朝 7 時に出る「今日の一問」を、同じルールのコードから足した。問題は日本語 1 万 4 千以上、英語 7,700 以上。Expo で Web と iOS を同じコードから出している。",
    stack: ["Expo", "React Native", "TypeScript", "Supabase"],
    links: [
      { label: "紹介ページ", href: "/products/gojuon-minesweeper" },
      { label: "Web で遊ぶ", href: "https://minesweeper.enludus.com" },
      { label: "App Store", href: "https://apps.apple.com/jp/app/id6819539119" },
      { label: "記事", href: "/blog/gojuon-minesweeper" },
    ],
    shot: { base: "/img/products/minesweeper", widths: [400, 800], ratio: 867 / 400, alt: "五十音マインスイーパーの画面。対戦前にジャンルを選ぶ", shape: "phone" },
  },
  {
    name: "あそび横丁",
    category: "Web / Game",
    status: "asobi.enludus.com で公開中",
    summary: "ログインもインストールもいらない、ブラウザですぐ遊べるミニゲーム集。屋台を 1 軒ずつ足している。",
    problem:
      "ちょっとした待ち時間に、すぐ遊べて何度でもやり直したくなる小さなゲームがほしい。題材は、けん玉や輪投げのような、日本の遊びや暮らしの中の小さな動作。",
    approach:
      "ゲームのコードはコーディングエージェントが書き、自分は題材を選ぶこと、共通の仕様を書くこと、出す前に何を確かめるかを決めることを受け持つ。成功の判定は物理の結果で決め、ボットに遊ばせて成功率を測って難しさを合わせる。記録はサーバーに送らず、ブラウザにだけ残す。",
    learning:
      "速く作れるようになると、「何を確かめるか」を書くことが仕事の中心になる。直したことは、次の 1 本にも効くように仕様へ 1 行ずつ書き足している。",
    stack: ["JavaScript", "three.js", "Rapier", "matter.js"],
    links: [
      { label: "遊ぶ", href: "https://asobi.enludus.com" },
      { label: "記事", href: "/blog/asobi-yokocho" },
      { label: "GitHub", href: "https://github.com/naki0227/mini-game" },
    ],
    shot: { base: "/img/products/asobi-yokocho", widths: [400, 600], ratio: 1140 / 600, alt: "にぎり積みのプレイ画面。揺れる箸の下で、皿の上にお寿司が10貫まっすぐ積み上がっている", shape: "phone" },
  },
  {
    name: "梅田地下ナビ",
    category: "PWA / Navigation",
    status: "開発中",
    summary: "GPS が届かない梅田の地下街で使う、道案内の PWA。",
    problem:
      "梅田の地下は出口や通路が多く、迷いやすい。地下では GPS もほとんど当てにならない。",
    approach:
      "入った出入口や近くに見えるお店から現在地を一度だけ推定し、そこから区間ごとに案内する。地図は OpenStreetMap から作ってアプリに入れ、経路探索（Dijkstra 法）も推定も端末の中で計算する。案内中は、進む向きの通路を一人称の絵で見せる。",
    learning:
      "平面の地図にしたら大事な目印が埋もれたので、ラベルの優先順位を決め直し、細かい情報は必要なときだけ出すようにした。地図データの現地確認と実機での確認は、これから。",
    stack: ["React", "Vite", "PWA", "OpenStreetMap"],
    links: [
      { label: "開く", href: "https://umeda.enludus.com" },
      { label: "記事", href: "/blog/umeda-underground-map" },
    ],
    shot: { base: "/img/products/umeda", widths: [400, 600], ratio: 1298 / 600, alt: "梅田地下ナビの案内中の画面。左上に進む向きが上の小さな地図と「77m 左へ」、画面いっぱいに通路の絵と左右の店の看板", shape: "phone" },
  },
];

export const capabilities = [
  {
    label: "Backend",
    title: "仕組みを、堅実に。",
    text: "Go・Rust を軸に API と処理基盤を実装。エラー、状態、データの境界をはっきりさせ、あとから変更を追いやすい構造を考える。",
    tags: "Go / Rust / Java / PostgreSQL",
  },
  {
    label: "Product",
    title: "課題から、つくる。",
    text: "誰の、どんな困りごとを解決するのか。対話から要件を整理し、Web から iOS まで、体験に必要な形に落とし込む。",
    tags: "TypeScript / React / Swift",
  },
  {
    label: "Operations",
    title: "動いた、その先へ。",
    text: "実装して終わりにせず、テストと運用まで見渡す。AWS やコンテナ技術を学び、システム全体を理解する範囲を広げている。",
    tags: "Docker / GitHub Actions / AWS（学習中）",
  },
];

export const skills = [
  ["Backend", "Go / Rust", "API 設計・実装、非同期処理、エラーと状態の扱い。Java / Spring Boot も学習・開発で使用。"],
  ["Web", "TypeScript / React", "Next.js・Vite によるアプリ開発。UI と処理の境界、型の一貫性を意識。"],
  ["Mobile", "Swift / Flutter", "SwiftUI・SwiftData・WidgetKit・MapKit。アプリ固有の体験と端末側の制約を考える。"],
  ["Infra", "AWS / Kubernetes / Terraform", "EKS、IAM、OIDC、CI/CD を学習用環境で構築。Docker・GitHub Actions を利用。"],
  ["Data & AI", "PostgreSQL / Python / Wasm", "データの永続化、AI API との連携、ローカル処理。用途に合わせて境界を設計。"],
] as const;

export const about = [
  "バックエンド開発を中心に、Web・iOS・AI を使ったプロダクトを作っています。Go と Rust が主軸ですが、実現したいことに合わせて技術を選びます。",
  "接客や塾講師の経験から、まず相手の話を聞いて、何に困っているかを理解することを大切にしています。StudyReel も、生徒から受けた相談が出発点でした。",
  "いまは API の実装に加えて、AWS や Kubernetes を使った構築・運用も学んでいます。要件の整理から設計まで主導できるよう、システム全体を理解する範囲を広げていきます。",
];

export const facts = [
  ["University", "大阪電気通信大学", "2024.04 — 2028.03 卒業予定"],
  ["Language", "TOEIC L&R 750", "2026.07"],
  ["Enludus", "個人事業主", "iOS アプリと Web サービスの開発・運営"],
] as const;

export const activities = [
  ["Community", "OECU TECH", "学内の技術コミュニティを立ち上げ。技術を学び、共有する場づくりに取り組んでいます。"],
  ["Work", "USJ / 塾講師", "USJ ではエリアリーダーを経験。塾講師としての相談が、StudyReel などの学習支援アプリを作るきっかけになりました。"],
  ["Outside of code", "ボルダリング", "高校ではクライミング部の部長を務め、県大会3位。いまも、課題を考えながら登る時間が好きです。"],
  ["Favorite", "Minecraft", "一番好きなゲーム。自由に考えて、少しずつ形を作っていくところが好きです。"],
] as const;

export const marquee = [
  "Go", "Rust", "TypeScript", "React", "Swift", "SwiftUI", "WebAssembly",
  "PostgreSQL", "Supabase", "AWS", "Kubernetes", "Docker",
];
