# sealfetch

The seal. One drawing, every asset that derives from it, and the rule that
nothing else holds a competing version.

## The rule

- `seal/og.png` is the illustration: a seal in glasses holding coffee, 2048px,
  the GitHub avatar. It is the identity. Future designs start from it.
- `seal/seal.svg` is the trace: `currentColor` line art with a faint tone layer.
  Every generated asset is this trace at a colour. It was traced from the 460px
  avatar download (`seal/avatar-460.png`) by pitch's pipeline and is **frozen**
  by decision on 2026-09-06: tracing the 2048px original gives visibly better
  whiskers, freckles and zipper teeth, and it was rejected in favour of keeping
  the mark that already ships in pitch and fastfetch.
- `trace/` holds that pipeline, unchanged from pitch, for future designs only.
  Running it on `og.png` today would produce a different trace; do not.
- `variants.toml` is the colour table. A variant is a named `bg` + `fg` pair on
  the trace. Adding one is one entry. There is no project-to-variant map; a
  consumer picks a variant by URL and that is the record.
- The 🦭 emoji belongs to the GitHub profile page only. No README carries the
  seal in any form, emoji or mark, and there is no "built by" colophon.

## Outputs

| path | what | consumer |
|---|---|---|
| `out/avatar/sigil.{svg,png}` | cream on Claude terracotta, 512px | SIGIL, the automation persona, as Discord webhook avatar via the raw GitHub URL |
| `out/avatar/sigil-dark.*` | terracotta on near-black | SIGIL on dark surfaces |
| `out/avatar/terminal.*` | orange on `#1a1a1a` | the seal in the wallpaper palette |
| `out/avatar/mono.svg` | the bare trace, transparent, `currentColor` | pitch pastes it inline |
| `out/wallpaper/{fetch,json}-*.png` | six wallpapers, two designs, three screens | swatch's `seal` theme carries the four Mac ones |

`out/avatar/` is a URL other things point at. Do not rename files in it.

## Seasonal

`seal/seasonal/` holds dated costume versions of `og.png`, worn for a while and then
taken off. They never replace the illustration or the trace.

- `christmas-2026.png`: Santa hat, Fair Isle band, hot chocolate, 1024px. Made
  2026-11-23 with FLUX 3 Image Klein (local, 6-bit) plus a composite step that keeps
  77% of the pixels byte-identical to the original; only the new items are generated.
  Profile pictures only, until 7 January 2027.

## Copies, by convention

The repo is source of truth but published repos keep no local clone, so
consumers hold copies. The trace is frozen, so a copy cannot drift. If it is
ever retraced, update these by hand:

- `~/.config/fastfetch/seal.svg`, recoloured per swatch theme at fetch time by
  `update-logo.sh`.
- `pitch/assets/seal.svg`, pasted inline into every pitch page.
- `~/.config/swatch/themes/seal/wallpapers/`, the four Mac wallpapers.

The `ff` alias passes `--logo none` outside Ghostty: T3 Code's terminal is
xterm.js and drops kitty graphics, leaving a blank column.

## Wallpaper decisions worth not re-deriving

- **Both designs stay.** `fetch` (neofetch layout) and `json` (source file in an
  editor) were built to compete; no winner was picked and none will be.
- **The seal runs off the bottom edge** because the illustration is cropped
  there. It reads as a bust. Closed: by nature of the drawing.
- **60 columns is the floor for the dot grid.** The trace is outline art, so
  below ~48 columns the glasses and mug stop reading. Flood-filling to a
  silhouette fails: the drawing is cropped on three sides, no enclosed region.
- **Dots nearly fill their cell** (0.86 of pitch). Thin dots ghost the seal.
- **The JSON variant needs its own grid.** A character cell is 0.586 wide and
  1.6 tall, so the dot grid as text is ~2.7x stretched. `SEAL_TEXT_40` /
  `SEAL_TEXT_48` are rasterised at the cell's real aspect with half blocks.
- **Two text widths.** 48 columns for the Mac, 40 for the 1170px phone.
- **`ADVANCE = 0.586`** was measured for Cascadia Code NF by rendering a known
  string. Every horizontal measurement derives from it.
- `seal-grid.ts` is baked from the trace, not rasterised at run time.

## Palette

`#1a1a1a` background, `#4d4d4d` seal, `#888` keys, `#fff` values, `#f56b3f`
accent. Lifted from the year-progress wallpaper that started this. swatch's
`seal` theme is hand-typed from these constants.

## History

- 2026-07-27: built as `wallpaper`, renamed and published as `sealfetch`, MIT.
- 2026-09-06: restructured into the seal's source of truth. Avatar variants,
  pitch's tracing pipeline, and the 2048px original moved in. MIT covers the
  artwork too, by decision.
- 2026-11-23: first seasonal costume, `seal/seasonal/christmas-2026.png`.
