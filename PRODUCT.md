# sealfetch

Matching Mac and iPhone wallpapers that know they are wallpapers.

The avatar (`seal.svg`) is the logo, rasterised to a 60x57 dot grid. The palette
is lifted from the year-progress wallpaper that started this: `#1a1a1a`
background, `#4d4d4d` seal, `#888` keys, `#fff` values, `#f56b3f` accent.
Type is Cascadia Code NF, the terminal font, with Nerd Font glyphs in the keys.

## Two variants, one idea

Both report on the wallpaper's own working conditions, in the register of a
resigned employee. They are competing for the job.

- **fetch** — neofetch-style output, seal left, `key -> value` right. Accent on
  the hostname, the mug, and the cursor.
- **json** — the same facts as `wallpaper.json` in an editor, with a line-number
  gutter. The whole seal is the `"avatar"` array. Accent on the mug, `null`,
  bare numbers, and the cursor.

## Build

```
bun wallpaper.ts           # six PNGs into out/
bun wallpaper.ts --check   # self-check, no rendering
```

Needs `rsvg-convert` (`brew install librsvg`) and Cascadia Code NF installed.

Outputs: `mac-4096x2304` (UltraGear), `mac-3024x1964` (built-in),
`iphone-1170x2532`, each in both variants.

## Decisions worth not re-deriving

- **60 columns is the floor for the seal.** `seal.svg` is outline art, not a
  silhouette, so it has no low-frequency mass to fall back on. Below ~48
  columns the glasses and mug stop reading. Flood-filling it into a silhouette
  does not work: the drawing is cropped by its own canvas on three sides, so
  there is no enclosed region to fill.
- **Dots nearly fill their cell** (0.86 of pitch). Thin dots turned the seal
  into a ghost at wallpaper scale.
- **The JSON variant needs its own grid.** A character cell is 0.586 wide and
  1.6 tall, so the dot grid rendered as text comes out ~2.7x stretched: only the
  head fits and it looks cut off. `SEAL_TEXT_40` / `SEAL_TEXT_48` are rasterised
  at the cell's real aspect and encoded with half blocks (`▀▄█`), which doubles
  vertical resolution. The whole seal then lands in 14 or 17 lines and no fold
  is needed.
- **Two text widths.** 48 columns puts the JSON block at 59 columns; on a 1170px
  phone that is 26px type. The phone gets 40.
- **The last avatar row drops its trailing comma.** It is pretending to be a
  real file.
- **`ADVANCE = 0.586`** was measured by rendering a known string and reading
  pixel offsets. Every horizontal measurement derives from it. Remeasure if the
  font changes.
- The seal grid is baked into `seal-grid.ts` rather than rasterised at run time.
  The drawing never changes.

## Open

- Published public at github.com/nitrimandylis/sealfetch (2026-07-27) with both
  variants. No winner picked; both stay until one is boring.
- The seal's body outline runs off the bottom edge because the source art is
  cropped there. Reads as a bust, but it is not a deliberate choice.
