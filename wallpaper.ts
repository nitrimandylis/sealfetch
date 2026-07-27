// Builds two wallpapers that know they are wallpapers, at three screen sizes.
//
//   variant A "fetch"  - neofetch-style output, seal as the logo
//   variant B "json"   - the same facts as a source file in an editor
//
// Each variant is laid out as an SVG string and handed to rsvg-convert.
// Run: bun wallpaper.ts        Self-check: bun wallpaper.ts --check

import {
  SEAL,
  MUG,
  SEAL_COLS,
  SEAL_ROWS,
  SEAL_TEXT_40,
  SEAL_TEXT_48,
  TEXT_MUG_40,
  TEXT_MUG_48,
} from "./seal-grid";

// ---------------------------------------------------------------- constants

const C = {
  bg: "#1a1a1a",
  seal: "#4d4d4d",
  punct: "#4a4a4a",
  key: "#888888",
  val: "#ffffff",
  accent: "#f56b3f",
};

const FONT = "Cascadia Code NF";

// Measured for Cascadia Code NF by rendering a known string and reading the
// pixel offsets: one character advances 0.586 em. Everything horizontal is
// derived from this, so if the font changes this number has to be remeasured.
const ADVANCE = 0.586;
const LINE_HEIGHT = 1.6;

const TARGETS = [
  { name: "mac-4096x2304", w: 4096, h: 2304, phone: false },
  { name: "mac-3024x1964", w: 3024, h: 1964, phone: false },
  { name: "iphone-1170x2532", w: 1170, h: 2532, phone: true },
];

// ---------------------------------------------------------------- svg pieces

type Seg = { text: string; color: string };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// One line of monospace text. Segments flow left to right; the font is
// monospace so every line started at the same x stays in column.
function textLine(x: number, y: number, size: number, segs: Seg[]): string {
  const spans = segs
    .map((s) => `<tspan fill="${s.color}">${esc(s.text)}</tspan>`)
    .join("");
  return (
    `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" ` +
    `font-weight="400" xml:space="preserve">${spans}</text>`
  );
}

function dots(x: number, y: number, pitch: number): string {
  // Nearly filling the cell: the source is outline art, so thin dots leave the
  // seal as a ghost. Fat dots read as a drawn line.
  const r = (pitch * 0.86) / 2;
  const out: string[] = [];
  for (let row = 0; row < SEAL_ROWS; row++) {
    for (let col = 0; col < SEAL_COLS; col++) {
      if (SEAL[row][col] !== "#") continue;
      const inMug =
        col >= MUG.x0 && col <= MUG.x1 && row >= MUG.y0 && row <= MUG.y1;
      const cx = x + (col + 0.5) * pitch;
      const cy = y + (row + 0.5) * pitch;
      out.push(
        `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" ` +
          `fill="${inMug ? C.accent : C.seal}"/>`,
      );
    }
  }
  return out.join("");
}

function document_(w: number, h: number, body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
    `viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${C.bg}"/>` +
    body +
    `</svg>`
  );
}

// ---------------------------------------------------------------- content

// The joke: each wallpaper reports on its own working conditions.
type Row = { icon: string; tree: string; key: string; value: string };

const g = (hex: string) => String.fromCodePoint(parseInt(hex, 16));

const MAC_ROWS: (Row | null)[] = [
  { icon: g("f03e"), tree: " ", key: "Kind", value: "wallpaper" },
  { icon: g("f0b1"), tree: "├", key: "Job", value: "be behind things" },
  { icon: g("f06e"), tree: "└", key: "Seen", value: "rarely" },
  null,
  { icon: g("f2d2"), tree: " ", key: "Covered", value: "6 windows, 1 dock" },
  { icon: g("f05b"), tree: "├", key: "Focus", value: "never me" },
  { icon: g("f245"), tree: "└", key: "Clicks", value: "0" },
  null,
  { icon: g("f252"), tree: " ", key: "Uptime", value: "since login" },
  { icon: g("f021"), tree: "└", key: "Redraw", value: "never" },
];

const PHONE_ROWS: (Row | null)[] = [
  { icon: g("f03e"), tree: " ", key: "Kind", value: "wallpaper" },
  { icon: g("f0b1"), tree: "├", key: "Job", value: "be looked at" },
  { icon: g("f11c"), tree: "└", key: "Input", value: "none accepted" },
  null,
  { icon: g("f06e"), tree: " ", key: "Glances", value: "94 today" },
  { icon: g("f2d2"), tree: "├", key: "Covered", value: "clock, 4 rows" },
  { icon: g("f023"), tree: "└", key: "Unlocked", value: "not my call" },
  null,
  { icon: g("f007"), tree: " ", key: "Audience", value: "1" },
  { icon: g("f021"), tree: "└", key: "Refresh", value: "never" },
];

// The same facts as JSON. `null` and bare numbers carry the accent, the way a
// syntax theme would colour them.
const MAC_JSON: [string, string, "str" | "lit" | "arr"][] = [
  ["kind", '"wallpaper"', "str"],
  ["job", '"be behind things"', "str"],
  ["seen", '"rarely"', "str"],
  ["covered", '["6 windows", "1 dock"]', "arr"],
  ["focus", "null", "lit"],
  ["clicks", "0", "lit"],
  ["redraw", '"never"', "str"],
];

const PHONE_JSON: [string, string, "str" | "lit" | "arr"][] = [
  ["kind", '"wallpaper"', "str"],
  ["job", '"be looked at"', "str"],
  ["input", "null", "lit"],
  ["covered", '["clock", "4 rows"]', "arr"],
  ["glances", "94", "lit"],
  ["unlocked", "false", "lit"],
  ["audience", "1", "lit"],
];

// ---------------------------------------------------------------- variant A

function fetchLines(phone: boolean): Seg[][] {
  const host = phone ? "seal@iphone" : "seal@macbook";
  const rows = phone ? PHONE_ROWS : MAC_ROWS;
  const keyWidth = Math.max(...rows.filter(Boolean).map((r) => r!.key.length));

  const lines: Seg[][] = [];
  lines.push([{ text: host, color: C.accent }]);
  lines.push([{ text: "─".repeat(host.length), color: C.punct }]);
  for (const r of rows) {
    if (!r) {
      lines.push([]);
      continue;
    }
    lines.push([
      { text: `${r.tree}${r.icon} ${r.key.padEnd(keyWidth)} `, color: C.key },
      { text: "-> ", color: C.punct },
      { text: r.value, color: C.val },
    ]);
  }
  lines.push([]);
  lines.push([
    { text: "❯ ", color: C.punct },
    { text: "█", color: C.accent },
  ]);
  return lines;
}

function renderFetch(w: number, h: number, phone: boolean): string {
  const lines = fetchLines(phone);
  const cols = Math.max(...lines.map((l) => l.reduce((n, s) => n + s.text.length, 0)));

  if (phone) {
    // Stacked: seal above, block below, sitting in the band the lock screen
    // leaves free between the clock and the bottom buttons.
    const pitch = (w * 0.5) / SEAL_COLS;
    const size = (w * 0.74) / (cols * ADVANCE);
    const step = size * LINE_HEIGHT;
    const sealH = SEAL_ROWS * pitch;
    const textH = lines.length * step;
    const gap = size * 2.4;
    // Centred a little below the middle, clear of the lock-screen clock.
    const top = h * 0.53 - (sealH + gap + textH) / 2;
    const sealX = (w - SEAL_COLS * pitch) / 2;
    const textX = (w - cols * ADVANCE * size) / 2;
    const body =
      dots(sealX, top, pitch) +
      lines
        .map((l, i) => (l.length ? textLine(textX, top + sealH + gap + (i + 1) * step, size, l) : ""))
        .join("");
    return document_(w, h, body);
  }

  // Side by side, one centred unit. The seal is sized to the height of the
  // text block so the pair reads as a single object at any aspect ratio.
  const size = solveMacFontSize(w, cols, lines.length);
  const step = size * LINE_HEIGHT;
  const textH = lines.length * step;
  const pitch = (textH * 1.15) / SEAL_ROWS;
  const sealW = SEAL_COLS * pitch;
  const sealH = SEAL_ROWS * pitch;
  const textW = cols * ADVANCE * size;
  const gap = size * ADVANCE * 6;
  const left = (w - (sealW + gap + textW)) / 2;
  const top = (h - textH) / 2;
  const body =
    dots(left, top - (sealH - textH) / 2, pitch) +
    lines
      .map((l, i) => (l.length ? textLine(left + sealW + gap, top + (i + 1) * step, size, l) : ""))
      .join("");
  return document_(w, h, body);
}

// Total unit width is sealW + gap + textW, all proportional to the font size,
// so the size that fills the target fraction can be solved directly.
function solveMacFontSize(w: number, cols: number, nLines: number): number {
  const perFont =
    (SEAL_COLS * nLines * LINE_HEIGHT * 1.15) / SEAL_ROWS + (cols + 6) * ADVANCE;
  return (w * 0.54) / perFont;
}

// ---------------------------------------------------------------- variant B

function jsonLines(phone: boolean): { n: number | null; segs: Seg[] }[] {
  const entries = phone ? PHONE_JSON : MAC_JSON;
  const art = phone ? SEAL_TEXT_40 : SEAL_TEXT_48;
  const mug = phone ? TEXT_MUG_40 : TEXT_MUG_48;
  const out: { n: number | null; segs: Seg[] }[] = [];
  let n = 1;
  const push = (segs: Seg[]) => out.push({ n: n++, segs });

  push([{ text: "{", color: C.punct }]);
  for (const [key, value, kind] of entries) {
    push([
      { text: '  "', color: C.punct },
      { text: key, color: C.key },
      { text: '": ', color: C.punct },
      { text: value, color: kind === "lit" ? C.accent : C.val },
      { text: ",", color: C.punct },
    ]);
  }
  push([
    { text: '  "', color: C.punct },
    { text: "avatar", color: C.key },
    { text: '": [', color: C.punct },
  ]);

  art.forEach((row, i) => push(sealRow(row, i, mug, i === art.length - 1)));

  push([{ text: "  ]", color: C.punct }]);
  push([{ text: "}", color: C.punct }]);
  out.push({ n: null, segs: [{ text: "█", color: C.accent }] });
  return out;
}

// One row of the half-block seal as a JSON string literal, split so the mug
// keeps the accent.
type Box = { x0: number; x1: number; y0: number; y1: number };

function sealRow(row: string, i: number, mug: Box, last: boolean): Seg[] {
  const inBand = i >= mug.y0 && i <= mug.y1;
  return [
    { text: '    "', color: C.punct },
    { text: row.slice(0, mug.x0), color: C.seal },
    { text: row.slice(mug.x0, mug.x1 + 1), color: inBand ? C.accent : C.seal },
    { text: row.slice(mug.x1 + 1), color: C.seal },
    { text: last ? '"' : '",', color: C.punct },
  ];
}

function renderJson(w: number, h: number, phone: boolean): string {
  const lines = jsonLines(phone);
  const gutter = 4; // "999 " right-aligned
  const cols =
    gutter + Math.max(...lines.map((l) => l.segs.reduce((n, s) => n + s.text.length, 0)));

  // The seal rows make this block 70-odd columns wide and 24 lines tall, so on
  // a landscape screen height binds before width does. Take whichever fits.
  const byWidth = (w * (phone ? 0.92 : 0.54)) / (cols * ADVANCE);
  const byHeight = (h * (phone ? 0.72 : 0.84)) / ((lines.length + 3) * LINE_HEIGHT);
  const size = Math.min(byWidth, byHeight);
  const step = size * LINE_HEIGHT;
  const blockW = cols * ADVANCE * size;
  // Lines are laid out from (top + 3*step): one for the filename, one blank.
  const blockH = (lines.length + 3) * step;
  const left = (w - blockW) / 2;
  const top = (phone ? h * 0.53 : h / 2) - blockH / 2;

  const parts: string[] = [];
  parts.push(
    textLine(left, top + step, size, [
      { text: "wallpaper", color: C.key },
      { text: ".json", color: C.punct },
    ]),
  );
  lines.forEach((l, i) => {
    const y = top + (i + 3) * step;
    if (l.n !== null) {
      parts.push(
        textLine(left, y, size, [{ text: String(l.n).padStart(3) + " ", color: C.punct }]),
      );
    }
    parts.push(textLine(left + gutter * ADVANCE * size, y, size, l.segs));
  });
  return document_(w, h, parts.join(""));
}

// ---------------------------------------------------------------- driver

async function render(svg: string, out: string) {
  const tmp = `${out}.svg`;
  await Bun.write(tmp, svg);
  const p = Bun.spawn(["rsvg-convert", tmp, "-o", out]);
  if ((await p.exited) !== 0) throw new Error(`rsvg-convert failed for ${out}`);
  await Bun.file(tmp).delete();
}

function check() {
  const lit = SEAL.reduce((n, row) => n + [...row].filter((c) => c === "#").length, 0);
  if (lit < 300) throw new Error(`seal grid looks empty: ${lit} dots`);
  if (SEAL.some((row) => row.length !== SEAL_COLS))
    throw new Error("seal grid rows are not all 60 wide");

  const mugDots = SEAL.slice(MUG.y0, MUG.y1 + 1).reduce(
    (n, row) => n + [...row.slice(MUG.x0, MUG.x1 + 1)].filter((c) => c === "#").length,
    0,
  );
  if (mugDots < 20) throw new Error(`mug region holds no dots: ${mugDots}`);

  // The text grids are hand-checked against their mug boxes; catch a regrid
  // that moves the mug out from under the accent.
  for (const [art, box, label] of [
    [SEAL_TEXT_40, TEXT_MUG_40, "40"],
    [SEAL_TEXT_48, TEXT_MUG_48, "48"],
  ] as const) {
    const width = art[0].length;
    if (art.some((row) => row.length !== width))
      throw new Error(`text grid ${label} has ragged rows`);
    const ink = art
      .slice(box.y0, box.y1 + 1)
      .reduce((n, row) => n + [...row.slice(box.x0, box.x1 + 1)].filter((c) => c !== " ").length, 0);
    if (ink < 8) throw new Error(`text grid ${label}: mug box is empty (${ink})`);
  }

  const svg = renderFetch(4096, 2304, false);
  if (/[<>&][^;]*?(?:amp|lt|gt);/.test(svg) === false && svg.includes("&"))
    throw new Error("unescaped ampersand in output");
  if (!svg.includes(C.accent)) throw new Error("accent colour never used");

  console.log(`ok: ${lit} dots, ${mugDots} in the mug, svg ${svg.length} bytes`);
}

if (Bun.argv.includes("--check")) {
  check();
} else {
  for (const t of TARGETS) {
    await render(renderFetch(t.w, t.h, t.phone), `out/fetch-${t.name}.png`);
    await render(renderJson(t.w, t.h, t.phone), `out/json-${t.name}.png`);
    console.log(`${t.name}  fetch + json`);
  }
}
