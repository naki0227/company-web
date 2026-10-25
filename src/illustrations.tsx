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

/** StudyReel: a film reel with its strip running out, and a small recording light. */
export function StudyIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="f-s ln" d="M52 66l34 10-5 14-34-10z" />
      <path className="ln-w" d="M56 74l2 1M66 77l2 1M76 80l2 1" />
      <circle className="f-w ln" cx="40" cy="42" r="30" />
      <circle className="f-s ln" cx="40" cy="25" r="7" />
      <circle className="f-s ln" cx="57" cy="42" r="7" />
      <circle className="f-s ln" cx="40" cy="59" r="7" />
      <circle className="f-s ln" cx="23" cy="42" r="7" />
      <circle className="f-o ln" cx="40" cy="42" r="5" />
      <circle className="f-o ln" cx="80" cy="16" r="6" />
    </svg>
  );
}

/** Useful Map: the app's diamond with a mountain and a winding road. */
export function MapIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="f-s ln" d="M42 10a8 8 0 0 1 12 0l32 32a8 8 0 0 1 0 12L54 86a8 8 0 0 1-12 0L10 54a8 8 0 0 1 0-12z" />
      <path className="f-o ln" d="M32 40l16-18 10 10 6-6 12 14z" />
      <path className="ln" d="M46 79c-6-10 14-14 6-24s-16-10-4-20" style={{ strokeWidth: 12 }} />
      <path className="ln-w" d="M46 79c-6-10 14-14 6-24s-16-10-4-20" style={{ strokeWidth: 6.5 }} />
    </svg>
  );
}

/** job match: a briefcase with a check badge. */
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

/** Logiscore: the app's level bars, the last one in orange. */
export function SoundIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <rect className="f-n ln" x="12" y="12" width="72" height="72" rx="20" />
      <rect className="f-s" x="24" y="44" width="10" height="26" rx="5" />
      <rect className="f-s" x="37" y="26" width="10" height="44" rx="5" />
      <rect className="f-s" x="50" y="52" width="10" height="18" rx="5" />
      <rect className="f-o" x="63" y="34" width="10" height="36" rx="5" />
    </svg>
  );
}

/** Gojuon Minesweeper: the app's four tiles — a kana, a number, a flag and a mine. */
export function KanaIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <rect className="f-s ln" x="8" y="8" width="38" height="38" rx="9" />
      <rect className="f-w ln" x="50" y="8" width="38" height="38" rx="9" />
      <rect className="f-w ln" x="8" y="50" width="38" height="38" rx="9" />
      <rect className="f-s ln" x="50" y="50" width="38" height="38" rx="9" />
      <text className="t-kana" x="27" y="35">あ</text>
      <text className="t-num" x="69" y="35">1</text>
      <path className="ln" d="M20 59v20" />
      <path className="f-o ln" d="M20 59l15 5-15 5z" />
      <path className="ln" d="M69 57v4M69 77v4M57 69h4M77 69h4M61 61l3 3M74 74l3 3M77 61l-3 3M61 77l3-3" />
      <circle className="f-n ln" cx="69" cy="69" r="7" />
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

/** Asobi Yokocho: a festival stall with a striped awning, a goldfish bag and a kendama. */
export function StallIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="f-s ln" d="M10 30l8-18h60l8 18z" />
      <path className="ln" d="M14 44v40M82 44v40" />
      <path className="f-o ln" d="M10 30h12.67v8a6.33 6.33 0 0 1-12.67 0z" />
      <path className="f-w ln" d="M22.67 30h12.67v8a6.33 6.33 0 0 1-12.67 0z" />
      <path className="f-o ln" d="M35.33 30h12.67v8a6.33 6.33 0 0 1-12.67 0z" />
      <path className="f-w ln" d="M48 30h12.67v8a6.33 6.33 0 0 1-12.67 0z" />
      <path className="f-o ln" d="M60.67 30h12.67v8a6.33 6.33 0 0 1-12.67 0z" />
      <path className="f-w ln" d="M73.33 30h12.67v8a6.33 6.33 0 0 1-12.67 0z" />
      <path className="ln" d="M32 44v5" />
      <path className="f-s ln" d="M28 49h8l5 10c0 4-4 7-9 7s-9-3-9-7z" />
      <path className="f-o" d="M27 59c2-3 7-3 9 0-2 3-7 3-9 0zM35 59l4-3v6z" />
      <rect className="f-w ln" x="61" y="58" width="6" height="12" rx="2" />
      <rect className="f-w ln" x="53" y="56" width="22" height="6" rx="3" />
      <circle className="f-o ln" cx="64" cy="48" r="7" />
      <circle className="f-w" cx="61.5" cy="45.5" r="2" />
      <rect className="f-w ln" x="8" y="70" width="80" height="16" rx="4" />
      <path className="ln-s" d="M18 78h14M42 78h14M66 78h12" />
    </svg>
  );
}

/** Umeda Underground Navi: stairs going down from a street entrance, and an arrow along the passage below. */
export function UndergroundIcon({ className }: Props) {
  return (
    <svg {...svg(className, "0 0 96 96")}>
      <path className="f-w ln" d="M40 58h44a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H40z" />
      <path className="f-s ln" d="M12 48h8v9h8v9h8v9h8v11H12z" />
      <path className="ln" d="M14 32v16M46 32v16" />
      <rect className="f-o ln" x="8" y="22" width="44" height="10" rx="4" />
      <path className="ln" d="M4 48h88" />
      <path className="ln" d="M70 48V12" />
      <path className="f-o ln" d="M58 12h22l7 7-7 7H58z" />
      <path className="ln w" d="M63 19h12" />
      <path className="ln-s" d="M52 72h26M71 65l7 7-7 7" />
    </svg>
  );
}
