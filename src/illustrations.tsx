/** @jsxRuntime automatic */
/** @jsxImportSource react */
// Hand-drawn vector illustrations in the logo's three colours (navy line, orange, sky)
// plus white. lp-anatomy §7-2: illustrations use only the brand colours, and section
// headings get a small drawing on each side instead of a picture of text.
// Colours come from CSS classes so the palette lives in one place (styles.css).

type Props = { className?: string };

const svg = (className: string | undefined, viewBox: string) => ({
  className: `ill ${className ?? ""}`,
  viewBox,
  "aria-hidden": true,
  focusable: false,
});

/** StudyReel: a phone on a stand, recording, with a small clock. */
export function StudyIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="f-s" d="M18 78h60l-6 10H24z" />
      <path className="ln" d="M18 78h60l-6 10H24z" />
      <rect className="f-w ln" x="30" y="10" width="36" height="64" rx="8" />
      <rect className="f-s" x="35" y="18" width="26" height="44" rx="3" />
      <circle className="f-o" cx="48" cy="40" r="7" />
      <path className="ln" d="M44 68h8" />
      <circle className="f-w ln" cx="74" cy="22" r="12" />
      <path className="ln" d="M74 15v7l5 4" />
    </svg>
  );
}

/** UsefulMap: a folded map, a dashed route and a pin. */
export function MapIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="f-w ln" d="M12 24l22-8 28 8 22-8v56l-22 8-28-8-22 8z" />
      <path className="f-s" d="M34 16v56l28 8V24z" opacity=".55" />
      <path className="ln" d="M34 16v56M62 24v56" />
      <path className="ln dash" d="M22 62c10-4 12-18 24-18s16 10 26-4" />
      <path className="f-o ln" d="M72 14c-7 0-12 5-12 11 0 9 12 20 12 20s12-11 12-20c0-6-5-11-12-11z" />
      <circle className="f-w" cx="72" cy="25" r="4" />
    </svg>
  );
}

/** Career: a briefcase with a check badge. */
export function CareerIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="ln" d="M36 30v-8a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v8" />
      <rect className="f-o ln" x="12" y="30" width="72" height="48" rx="10" />
      <path className="ln" d="M12 50h72" />
      <rect className="f-w ln" x="42" y="44" width="12" height="12" rx="3" />
      <circle className="f-s ln" cx="76" cy="72" r="14" />
      <path className="ln w" d="M69 72l5 5 9-10" />
    </svg>
  );
}

/** Logiscore: two notes and the sound they carry. */
export function SoundIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="ln" d="M38 66V22l36-8v44" />
      <path className="ln" d="M38 34l36-8" />
      <ellipse className="f-o ln" cx="29" cy="67" rx="10" ry="8" />
      <ellipse className="f-o ln" cx="65" cy="59" rx="10" ry="8" />
      <path className="ln-s" d="M14 22c-6 6-6 16 0 22M8 16c-10 10-10 24 0 34" />
      <path className="ln-s" d="M84 70c4 4 4 10 0 14" />
      <text className="t-mono" x="60" y="92">01</text>
    </svg>
  );
}

/** Gojuon Minesweeper: kana tiles, a number and a flag. */
export function KanaIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <rect className="f-s ln" x="10" y="38" width="36" height="36" rx="6" />
      <rect className="f-w ln" x="50" y="38" width="36" height="36" rx="6" />
      <rect className="f-w ln" x="30" y="6" width="36" height="30" rx="6" />
      <text className="t-kana" x="28" y="64">あ</text>
      <text className="t-num" x="68" y="65">2</text>
      <path className="ln" d="M44 12v20" />
      <path className="f-o ln" d="M44 12l16 5-16 5z" />
      <path className="ln" d="M24 84h48" />
    </svg>
  );
}

/** Decision: the camera is optional — a camera with a switch. */
export function CameraSwitchIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="f-w ln" d="M14 34h14l6-10h28l6 10h14v38H14z" />
      <circle className="f-s ln" cx="48" cy="52" r="13" />
      <circle className="f-w" cx="44" cy="48" r="3" />
      <rect className="f-o ln" x="54" y="76" width="30" height="14" rx="7" />
      <circle className="f-w ln" cx="77" cy="83" r="5" />
    </svg>
  );
}

/** Decision: data stays here — a browser window with a lock. */
export function LockedWindowIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <rect className="f-w ln" x="10" y="14" width="76" height="62" rx="8" />
      <path className="ln" d="M10 28h76" />
      <circle className="f-o" cx="20" cy="21" r="3" />
      <circle className="f-s" cx="29" cy="21" r="3" />
      <path className="ln" d="M40 50v-6a8 8 0 0 1 16 0v6" />
      <rect className="f-o ln" x="34" y="50" width="28" height="20" rx="4" />
      <path className="ln w" d="M48 57v6" />
    </svg>
  );
}

/** Decision: don't rebuild — a pin handing off along an arrow. */
export function HandoffIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="f-o ln" d="M26 14c-8 0-14 6-14 13 0 10 14 23 14 23s14-13 14-23c0-7-6-13-14-13z" />
      <circle className="f-w" cx="26" cy="27" r="5" />
      <path className="ln dash" d="M30 62c10 10 26 10 36 0" />
      <path className="ln" d="M60 56l7 6-8 5" />
      <rect className="f-s ln" x="58" y="18" width="28" height="30" rx="6" />
      <path className="ln w" d="M64 28h16M64 36h10" />
    </svg>
  );
}

/** Small doodles that sit on both sides of a section heading. */
export function Pencil({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 64 64")}>
      <path className="f-o ln" d="M12 46l28-28 8 8-28 28-11 3z" />
      <path className="f-w ln" d="M40 18l5-5a3 3 0 0 1 4 0l4 4a3 3 0 0 1 0 4l-5 5" />
      <path className="ln" d="M17 41l8 8" />
    </svg>
  );
}

export function Mug({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 64 64")}>
      <path className="f-s ln" d="M12 24h32v20a10 10 0 0 1-10 10H22a10 10 0 0 1-10-10z" />
      <path className="ln" d="M44 30h4a6 6 0 0 1 0 12h-4" />
      <path className="ln-s" d="M22 8c-3 4 3 6 0 10M32 8c-3 4 3 6 0 10" />
    </svg>
  );
}

export function Leaf({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 64 64")}>
      <path className="f-s ln" d="M12 52C12 26 28 12 54 10c0 26-16 42-42 42z" />
      <path className="ln" d="M12 52L40 24" />
    </svg>
  );
}

export function Note({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 64 64")}>
      <path className="ln" d="M26 46V14l22-5v30" />
      <ellipse className="f-o ln" cx="19" cy="47" rx="8" ry="6" />
      <ellipse className="f-o ln" cx="41" cy="40" rx="8" ry="6" />
    </svg>
  );
}

export function Pin({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 64 64")}>
      <path className="f-o ln" d="M32 6c-10 0-17 7-17 16 0 13 17 32 17 32s17-19 17-32c0-9-7-16-17-16z" />
      <circle className="f-w ln" cx="32" cy="22" r="6" />
    </svg>
  );
}

/** The studio: a laptop, a mug and a plant on a desk. Used next to the company table. */
export function Studio({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 240 180")}>
      <path className="f-s" d="M10 150h220v12H10z" opacity=".5" />
      <path className="ln" d="M10 150h220" />
      <rect className="f-w ln" x="60" y="62" width="104" height="70" rx="8" />
      <rect className="f-s" x="70" y="72" width="84" height="50" rx="3" />
      <path className="ln-w" d="M80 86h40M80 96h56M80 106h30" />
      <circle className="f-o" cx="146" cy="84" r="5" />
      <path className="f-w ln" d="M48 132h128l-8 18H56z" />
      <path className="f-o ln" d="M186 118h22v24a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" />
      <path className="ln" d="M208 124h5a5 5 0 0 1 0 10h-5" />
      <path className="ln-s" d="M192 100c-2 4 2 6 0 10M202 100c-2 4 2 6 0 10" />
      <path className="f-o ln" d="M22 150l4-28h22l4 28z" />
      <path className="f-s ln" d="M36 122c0-18-10-28-20-30 2 14 8 26 20 30z" />
      <path className="f-s ln" d="M37 122c0-22 10-36 24-38-2 18-10 32-24 38z" />
    </svg>
  );
}

/** Nue: a clapper board over a film strip. */
export function VideoIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <rect className="f-s ln" x="12" y="40" width="72" height="42" rx="6" />
      <path className="f-w ln" d="M12 28l68-12 4 14-68 12z" />
      <path className="ln" d="M30 24l8 12M48 21l8 12M66 18l8 12" />
      <path className="f-o ln" d="M42 52v18l16-9z" />
    </svg>
  );
}

/** LP Anatomy: a page under a magnifying glass. */
export function LoupeIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <rect className="f-w ln" x="12" y="10" width="50" height="64" rx="6" />
      <path className="ln" d="M22 24h30M22 34h22M22 44h26" />
      <rect className="f-o" x="22" y="52" width="18" height="10" rx="2" />
      <circle className="f-s ln" cx="62" cy="58" r="16" />
      <path className="ln" d="M74 70l12 12" />
    </svg>
  );
}
