import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

// Open Graph images (1200×630), one per page and per post, drawn at build time in the
// portfolio's look: ground + ink, one orange dot. Fonts are fetched from Google Fonts
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
const GROUND = "#ebe7e0";
const INK = "#14171c";
const ACCENT = "#e0612b";

type Font = { name: string; data: ArrayBuffer; weight: 400 | 800; style: "normal" };

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
  const [latin, japanese, mono] = await Promise.all([
    ttf("Manrope", 800),
    ttf("Noto Sans JP", 800, chars),
    ttf("DM Mono", 400),
  ]);
  return [
    { name: "Manrope", data: latin, weight: 800, style: "normal" },
    { name: "Noto Sans JP", data: japanese, weight: 800, style: "normal" },
    { name: "DM Mono", data: mono, weight: 400, style: "normal" },
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

function tree(card: Card): Node {
  const dot = h("div", { width: 28, height: 28, borderRadius: 14, background: ACCENT, marginLeft: 10, marginBottom: 22 });
  const body =
    card.variant === "name"
      ? h("div", { display: "flex", flexDirection: "column", fontFamily: "Manrope", fontSize: 196, lineHeight: 0.82, letterSpacing: -9 }, [
          h("div", { display: "flex" }, card.title.split(" ")[0]),
          h("div", { display: "flex", alignItems: "flex-end", paddingLeft: 110 }, [card.title.split(" ").slice(1).join(" "), dot]),
        ])
      : h(
          "div",
          {
            display: "flex",
            fontFamily: "Noto Sans JP, Manrope",
            flexWrap: "wrap",
            fontSize: card.title.length > 34 ? 54 : 64,
            lineHeight: 1.42,
            letterSpacing: 1.5,
            maxWidth: 1000,
          },
          phrases(card.title).map((p) => h("span", { whiteSpace: "pre" }, p)),
        );
  return h(
    "div",
    {
      width: W,
      height: H,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "56px 72px",
      background: GROUND,
      color: INK,
    },
    [
      h("div", { display: "flex", justifyContent: "space-between", paddingBottom: 18, borderBottom: `2px solid ${INK}`, fontFamily: "DM Mono, Noto Sans JP", fontSize: 22, letterSpacing: 2 }, [
        h("div", { display: "flex" }, card.kicker),
        h("div", { display: "flex" }, "ENLUDUS.COM"),
      ]),
      body,
      h("div", { display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Noto Sans JP, Manrope", fontSize: 28 }, [
        h("div", { display: "flex", alignItems: "center" }, [
          h("div", { width: 34, height: 34, borderRadius: 9, background: INK, marginRight: 14 }),
          "Enludus",
        ]),
        h("div", { display: "flex", alignItems: "center" }, [
          "長瀬 唯楓",
          card.variant === "name" ? "" : h("div", { width: 16, height: 16, borderRadius: 8, background: ACCENT, marginLeft: 14 }),
        ]),
      ]),
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
