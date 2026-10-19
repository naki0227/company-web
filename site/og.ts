import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

// Open Graph images (1200×630), one per page and per post, drawn at build time in the
// site's warm look: paper ground, brown text, the logo's orange, sky and navy. Fonts are fetched from Google Fonts
// as TrueType, with the Japanese face subset to just the characters the cards use.

export type Card = {
  /** Output path, e.g. "og/blog/site-renewal.png". */
  file: string;
  kicker: string;
  title: string;
  /** "name" sets the title huge in Latin caps; "title" is a wrapped headline. */
  variant?: "name" | "title";
};

const W = 1200;
const H = 630;
const GROUND = "#f4efe8";
const CARD = "#ffffff";
const INK = "#33261e";
const NAVY = "#1d2a3a";
const SKY = "#92ddff";
const ACCENT = "#c95424";
const ACCENT_L = "#f08c4f";

type Font = { name: string; data: ArrayBuffer; weight: 600 | 700; style: "normal" };

async function ttf(family: string, weight: number, text?: string) {
  const query = `family=${family.replace(/ /g, "+")}:wght@${weight}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
  // Without a browser user agent, Google Fonts answers with TrueType, which satori reads.
  const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`)).text();
  const url = /src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
  if (!url) throw new Error(`no TrueType source for ${family} ${weight}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font download failed (${res.status}) for ${family}`);
  return res.arrayBuffer();
}

async function fonts(cards: Card[]): Promise<Font[]> {
  const chars = [...new Set(cards.map((c) => c.title + c.kicker).join("") + "長瀬唯楓enludus.com")].join("");
  const [latin, japanese] = await Promise.all([
    ttf("Fredoka", 600),
    ttf("Zen Maru Gothic", 700, chars),
  ]);
  return [
    { name: "Fredoka", data: latin, weight: 600, style: "normal" },
    { name: "Zen Maru Gothic", data: japanese, weight: 700, style: "normal" },
  ];
}

// satori takes React-element-shaped objects; building them by hand keeps React out of the build.
type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

/**
 * Splits a Japanese headline into phrases (word + trailing kana/punctuation), so the
 * card wraps between phrases instead of in the middle of a word like ポー|トフォリオ.
 */
function phrases(text: string) {
  const out: string[] = [];
  for (const { segment } of new Intl.Segmenter("ja", { granularity: "word" }).segment(text)) {
    const tail = /^[\p{Script=Hiragana}\p{P}ー\s]+$/u.test(segment);
    if (tail && out.length) out[out.length - 1] += segment;
    else out.push(segment);
  }
  return out;
}

function logo(size: number) {
  const u = size / 30;
  const bar = (top: number, width: number) =>
    h("div", { position: "absolute", left: 7 * u, top: top * u, width: width * u, height: 3 * u, borderRadius: 8 * u, background: SKY });
  return h("div", { position: "relative", display: "flex", width: size, height: size, borderRadius: 9 * u, background: NAVY }, [
    bar(7, 16),
    bar(13, 12),
    bar(19, 16),
    h("div", { position: "absolute", right: 5 * u, top: 5 * u, width: 5 * u, height: 5 * u, borderRadius: 3 * u, background: "#ff9b61" }),
  ]);
}

function tree(card: Card): Node {
  const dot = h("div", { width: 30, height: 30, borderRadius: 15, background: ACCENT_L, marginLeft: 8, marginBottom: 26 });
  const body =
    card.variant === "name"
      ? h("div", { display: "flex", flexDirection: "column", color: NAVY, fontFamily: "Fredoka", fontSize: 176, lineHeight: 0.9, letterSpacing: -3 }, [
          h("div", { display: "flex" }, card.title.split(" ")[0]),
          h("div", { display: "flex", alignItems: "flex-end", paddingLeft: 96 }, [card.title.split(" ").slice(1).join(" "), dot]),
        ])
      : h(
          "div",
          {
            display: "flex",
            flexWrap: "wrap",
            fontFamily: "Zen Maru Gothic, Fredoka",
            fontSize: card.title.length > 34 ? 52 : 62,
            lineHeight: 1.45,
            letterSpacing: 1.5,
            maxWidth: 960,
          },
          phrases(card.title).map((p) => h("span", { whiteSpace: "pre" }, p)),
        );
  return h(
    "div",
    { width: W, height: H, display: "flex", padding: 36, background: GROUND, color: INK },
    [
      h(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "40px 56px",
          borderRadius: 44,
          background: CARD,
          borderBottom: "8px solid #e6d8c8",
        },
        [
          h("div", { display: "flex", justifyContent: "space-between", fontFamily: "Fredoka, Zen Maru Gothic", fontSize: 26 }, [
            h("div", { display: "flex", color: ACCENT }, card.kicker),
            h("div", { display: "flex", color: "#8a766a" }, "enludus.com"),
          ]),
          body,
          h("div", { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30 }, [
            h("div", { display: "flex", alignItems: "center", fontFamily: "Fredoka" }, [
              logo(40),
              h("div", { display: "flex", marginLeft: 14 }, "Enludus"),
            ]),
            h("div", { display: "flex", alignItems: "center", fontFamily: "Zen Maru Gothic" }, [
              "長瀬 唯楓",
              h("div", { width: 16, height: 16, borderRadius: 8, background: ACCENT_L, marginLeft: 14 }),
            ]),
          ]),
        ],
      ),
    ],
  );
}

/**
 * Renders every card. When the fonts cannot be fetched (offline build), each card falls
 * back to a copy of site/og-fallback.png so no page points at a missing image.
 */
export async function renderCards(root: string, cards: Card[], warn: (m: string) => void) {
  const out = new Map<string, Uint8Array>();
  let loaded: Font[];
  try {
    loaded = await fonts(cards);
  } catch (error) {
    warn(`OG images: fonts unavailable (${String(error)}); using site/og-fallback.png`);
    const fallback = readFileSync(join(root, "site/og-fallback.png"));
    for (const card of cards) out.set(card.file, fallback);
    return out;
  }
  for (const card of cards) {
    const svg = await satori(tree(card) as never, { width: W, height: H, fonts: loaded });
    out.set(card.file, new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng());
  }
  return out;
}
