export type Lang = "en" | "ja";

export const homePath: Record<Lang, string> = { en: "/", ja: "/ja" };

const en = {
  meta: {
    homeLabel: "Enludus home",
    navLabel: "Primary",
    switchLabel: "Language",
  },
  nav: {
    products: "Products",
    about: "About",
    blog: "Blog",
    portfolio: "Founder",
    contact: "Contact",
  },
  orbit: {
    career: "make a clearer choice",
    study: "make effort visible",
    map: "compare before moving",
  },
  hero: {
    eyebrow: "Independent software studio · Japan",
    lines: ["Building software", "that turns friction", "into better experiences."],
    lead: "Enludus is a bootstrapped software studio building focused products for learning, movement, and career decisions.",
    cta: "Explore products",
  },
  intro: {
    label: "How we think",
    lead: "We start with the",
    accent: " problem,",
    rest: "not the stack.",
    body: [
      "Good software earns its place by reducing friction. We begin with the decision, routine, or workflow that feels harder than it should, then build the smallest system that makes it meaningfully better.",
      "AI is part of the toolbox when it improves the experience — never the reason a product exists.",
    ],
  },
  career: {
    bars: ["Work style", "Growth", "Culture", "Compensation"],
    role: "Backend Engineer",
    place: "Sample opportunity · Tokyo / Hybrid",
    match: "match",
    insight: "Strong alignment on work style. Check the gap in team structure before deciding.",
  },
  study: {
    total: "3h 24m",
    delta: "+18% from last week",
    subject: "System Design",
    pause: "Pause session",
    streak: "28 day consistency",
  },
  map: {
    search: "Osaka Station",
    best: "34 min",
    arrive: "Arrive 19:42",
    options: ["Fastest · 31m", "Balanced · 34m", "Walk more · 41m"],
  },
  logiscoreArt: "Text becomes sound, and a recording restores the original",
  minesweeperCaption: "Read the numbers. Deduce the hidden word.",
  products: {
    label: "Selected products",
    heading: ["Five focused products.", "One way of building."],
    guide: "Read the guide (Japanese)",
    items: {
      career: {
        label: "Career decision support",
        headline: "See the fit before making the leap.",
        body: "Career compares public job information with what matters to you, turning scattered requirements into a structured view of alignment, differences, and unknowns.",
        cta: "Open Career",
      },
      study: {
        label: "Learning / iOS",
        headline: "Turn effort into something you can see.",
        body: "StudyReel records the act of studying — not just a number on a timer — and makes progress visible through sessions, statistics, goals, and interactive widgets.",
        cta: "View on App Store",
      },
      map: {
        label: "Mobility / iOS",
        headline: "Choose how to move before opening directions.",
        body: "UsefulMap compares travel modes and breaks a trip into understandable segments, while handing detailed public-transit directions off to Google Maps when you need them.",
        cta: "View on App Store",
      },
      logiscore: {
        label: "Code / Browser / Sound",
        headline: "Send data with sound.",
        body: "Logiscore turns text, a source file, or a whole project into music. Play it out loud, record it on another device, and import the recording to restore the exact original. Error correction and optional password encryption run in a Rust/WebAssembly engine inside the browser — nothing is uploaded to Enludus servers.",
        cta: "Try Logiscore",
      },
      minesweeper: {
        label: "Words / Puzzle / Local multiplayer",
        headline: "Read the numbers. Guess the word.",
        body: "A kana-board and alphabet word deduction game for two players sharing one screen. Reveal safe letters, read nearby mine counts, and find the hidden answer before your opponent.",
        cta: "Play on the Web",
      },
    },
  },
  principles: {
    label: "How we build",
    items: [
      {
        title: "Understand first.",
        body: "Requirements, constraints, and the person behind the problem come before the implementation.",
      },
      {
        title: "Design the system.",
        body: "Performance, reliability, cost, operations, and changeability are product decisions too.",
      },
      {
        title: "Ship and learn.",
        body: "Working software creates the feedback that diagrams and assumptions cannot.",
      },
    ],
  },
  about: {
    label: "About Enludus",
    heading: ["Small by design.", "Serious about the details."],
    body: [
      "Enludus is an independent, bootstrapped software venture founded by Ibuki Nagase in Japan. We design and build products end-to-end, from problem discovery and system design to implementation, deployment, and operation.",
      "Our current work spans web products, native iOS apps, backend systems, and practical uses of AI.",
    ],
    links: { portfolio: "Founder's portfolio", blog: "Read the blog (Japanese)" },
    facts: [
      ["Based in", "Japan"],
      ["Structure", "Bootstrapped"],
      ["Founder", "Ibuki Nagase"],
    ],
  },
  contact: {
    label: "Get in touch",
    heading: ["Have a problem", "worth simplifying?"],
    body: "Product inquiries, collaborations, startup conversations, or just a thoughtful hello.",
  },
  footer: {
    tagline: "Building useful software from Japan.",
    privacy: "Privacy",
    contact: "Contact",
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
    about: "会社について",
    blog: "ブログ",
    portfolio: "代表",
    contact: "お問い合わせ",
  },
  orbit: {
    career: "迷いを、選べる形に",
    study: "努力を、見える形に",
    map: "動く前に、比べる",
  },
  hero: {
    eyebrow: "日本の独立系ソフトウェアスタジオ",
    lines: ["使いにくさを、", "使ってよかったに", "変えていく。"],
    lead: "Enludus は、学び・移動・キャリアの選択を支えるプロダクトを、外部資本に頼らず一から作っているソフトウェアスタジオです。",
    cta: "製品を見る",
  },
  intro: {
    label: "考え方",
    lead: "はじめに見るのは",
    accent: "課題。",
    rest: "技術はそのあと。",
    body: [
      "良いソフトウェアは、手間やつまずきを減らすことで居場所を得ます。私たちはまず「本来もっと楽なはずの判断・習慣・作業」を見つけ、それを確かに良くする一番小さな仕組みから作ります。",
      "AI は体験を良くするときに使う道具のひとつです。AI を使うこと自体を、プロダクトの理由にはしません。",
    ],
  },
  career: {
    bars: ["働き方", "成長", "社風", "報酬"],
    role: "バックエンドエンジニア",
    place: "サンプル求人 · 東京 / ハイブリッド",
    match: "一致",
    insight: "働き方はよく合っています。決める前に、チーム体制の違いを確認しましょう。",
  },
  study: {
    total: "3時間24分",
    delta: "先週より +18%",
    subject: "システム設計",
    pause: "一時停止",
    streak: "28日間の積み重ね",
  },
  map: {
    search: "大阪駅",
    best: "34分",
    arrive: "19:42 到着",
    options: ["最速 · 31分", "バランス · 34分", "多めに歩く · 41分"],
  },
  logiscoreArt: "テキストが音になり、録音から元に戻るイメージ",
  minesweeperCaption: "数字を読み、答えの文字を推理する。",
  products: {
    label: "プロダクト",
    heading: ["5つのプロダクト。", "作り方は、ひとつ。"],
    guide: "使い方・詳しい紹介を見る",
    items: {
      career: {
        label: "キャリアの意思決定支援",
        headline: "応募する前に、合うかどうかを見る。",
        body: "公開されている求人情報と、あなたが大事にしたいことを照らし合わせます。散らばった条件を「合っている点・違う点・まだ分からない点」に整理して見せます。",
        cta: "Career を開く",
      },
      study: {
        label: "学習 / iOS",
        headline: "がんばった時間を、目に見える形に。",
        body: "StudyReel はタイマーの数字だけでなく、勉強している様子そのものを記録します。セッション・統計・目標・ウィジェットで、積み重ねが見えるようにします。",
        cta: "App Store で見る",
      },
      map: {
        label: "移動 / iOS",
        headline: "経路を開く前に、移動手段を選ぶ。",
        body: "UsefulMap は移動手段を比べ、ルートを分かりやすい区間に分けて見せます。電車の細かい乗り換えが必要なときは Google マップに引き継ぎます。",
        cta: "App Store で見る",
      },
      logiscore: {
        label: "コード / ブラウザ / 音",
        headline: "データを、音で送る。",
        body: "テキストやソースファイル、プロジェクト丸ごとを音楽に変換します。スピーカーで鳴らして別の端末で録音し、その録音を読み込むと元のデータがそのまま戻ります。誤り訂正とパスワード暗号化はブラウザ内の Rust/WebAssembly で動き、Enludus のサーバーには何も送りません。",
        cta: "Logiscore を試す",
      },
      minesweeper: {
        label: "ことば / パズル / 2人対戦",
        headline: "数字を読んで、ことばを当てる。",
        body: "ひとつの画面を2人で囲む、五十音とアルファベットの推理ゲーム。安全な文字を開き、まわりの地雷の数を手がかりに、相手より先に答えのことばを見つけます。",
        cta: "Web で遊ぶ",
      },
    },
  },
  principles: {
    label: "作り方",
    items: [
      {
        title: "まず、理解する。",
        body: "実装の前に、要件と制約、そして困っている人のことを知る。",
      },
      {
        title: "仕組みで考える。",
        body: "速さ・信頼性・コスト・運用・変えやすさも、プロダクトの判断のうち。",
      },
      {
        title: "出して、学ぶ。",
        body: "図や仮説からは得られない手応えを、動くソフトウェアからもらう。",
      },
    ],
  },
  about: {
    label: "Enludus について",
    heading: ["小さく、つくる。", "細部まで、ちゃんと。"],
    body: [
      "Enludus は、長瀬唯楓が日本で立ち上げた独立系のソフトウェアスタジオです。外部資本に頼らず、課題の発見と設計から、実装・公開・運用までを一貫して手がけています。",
      "いまは Web プロダクト、iOS ネイティブアプリ、バックエンド、そして実用的な AI の活用に取り組んでいます。",
    ],
    links: { portfolio: "代表のポートフォリオ", blog: "ブログを読む" },
    facts: [
      ["拠点", "日本・大阪"],
      ["体制", "自己資本"],
      ["代表", "長瀬 唯楓"],
    ],
  },
  contact: {
    label: "お問い合わせ",
    heading: ["その手間、", "減らせるかもしれません。"],
    body: "プロダクトについてのご質問、協業のご相談、ちょっとしたご挨拶まで、お気軽にどうぞ。",
  },
  footer: {
    tagline: "日本から、役に立つソフトウェアを。",
    privacy: "プライバシーポリシー",
    contact: "お問い合わせ",
  },
};

export const copy: Record<Lang, Copy> = { en, ja };
