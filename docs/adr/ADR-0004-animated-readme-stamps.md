# ADR-0004 — README emoji → animated "infomercial stamp" GIFs rendered from HTML

**Status:** Accepted · 2026-07-08
**Builds on:** the `assets/banner.png` + `assets/banner.src.html` render pattern (commit `2b2e28d`)

## Context

The README decorated its headings with plain Unicode emoji (🚨 📞 🖥️ 🎁 ⚙️ 🛡️). The web UI
(`web/public/index.html`) and the banner already speak a much louder, on-brand "As Seen On TV"
infomercial language — gold/red/ink starbursts, a hot-pink "BUT WAIT" banner, a red "FREE" price
seal, the SlopDial amp knob that goes to 11. The ask: replace the README emoji with **on-theme,
animated** decorations drawn from that same vocabulary.

Two constraints shape how:

1. **A GitHub README cannot run CSS animation.** It renders inline `<img>` (the README already uses
   one for the banner) and loops animated images, but there is no `<style>`/JS/CSS-animation. So
   "animated + on-theme in the README" means an **animated raster** — a GIF (or APNG).
2. **The repo already has the pipeline to make one.** `assets/banner.png` is rendered from
   `assets/banner.src.html` by headless Chrome, with the regen command baked into the source file's
   comment. This ADR extends that "author HTML → headless render → commit artifact **and** its
   editable source" pattern from one still frame to many.

## Decision

Add a self-contained **`assets/emoji/`** directory holding **7 animated GIF "stamps,"** each lifted
from a real web-UI element, plus the source that produces them:

- **`stamps.src.html`** — one dependency-free page defining all 7 stamps from the banner's `:root`
  tokens and the `--burst` starburst `clip-path`. Normal CSS `@keyframes` drive the motion; a
  `?stamp=<name>&f=<0..1>` query freezes any phase deterministically (paused animation + negative
  `animation-delay`) so frames are reproducible, not wall-clock-timed.
- **`render.mjs`** — a small Node script (no new deps) that screenshots each frozen frame in headless
  Chrome and encodes a looping transparent GIF with ffmpeg.
- **The 7 `*.gif`** — committed alongside their source, matching the repo's "artifact + editable
  source, side by side" ethos.

Each stamp maps an emoji to a web-UI element: 🚨→"AS SEEN ON TV" seal (H1) and a red "!" alert seal
(the honest-part blockquote), 📞→"CALL NOW", 🖥️→the pink "BUT WAIT!" tag, 🎁→the "FREE" price seal,
⚙️→the SlopDial knob, 🛡️→a gold "100% SAFE" guarantee rosette. They embed as inline `<img>` with the
**original emoji kept as `alt`** (screen-reader meaning + graceful fallback).

Concrete choices:

- **Not covered by ADR-0001's prompt-only rule.** These are *presentation assets for the README*,
  not the skill; the skill stays prompt-only. What carries over is the "commit the source next to the
  artifact" habit — hence `stamps.src.html` + `render.mjs` are committed, not just the GIFs.
- **No new dependencies.** Reuses the banner's toolchain: system `google-chrome` (already required)
  and `ffmpeg`. Needs the **Impact font** installed — the same caveat the banner already documents.
- **Transparent GIF, theme-independent.** GitHub renders READMEs in light *and* dark, so stamps are
  transparent (1-bit alpha) and shaped to the badge silhouette. The two dark badges (the ink "AS
  SEEN ON TV" seal, the near-black knob) carry a light gold/cream keyline so they read on dark.
- **Motion is transforms + opaque color swaps only — never opacity.** Under 1-bit alpha a
  semi-transparent pixel drops to fully transparent, so an opacity "blink" would make a badge
  *vanish*, not dim. Blinks are done as opaque fill swaps; pulses/rocks/spins are transforms.
- **Scope: 7 spots** — the 5 section headers + the H1 + the blockquote siren. The 3 inline body
  emoji (✅ ☀️ 📈) stay as text; tiny GIFs mid-sentence hurt readability and baseline alignment.

## Consequences

- **Good — on-theme and reproducible.** The stamps are built from the same tokens/components as the
  web UI and banner, so they stay visually in sync; anyone can edit `stamps.src.html` and re-run
  `node assets/emoji/render.mjs` to regenerate every GIF.
- **Good — accessible and degradable.** The original emoji lives in each `alt`, so meaning survives
  for screen readers and if an image fails to load.
- **Trade-off — binary assets in git.** Seven GIFs (~432 KB total; the detailed SlopDial is the
  heaviest at ~122 KB) are committed and live permanently in history. This is in line with the one
  binary the repo already commits (`banner.png`, ~400 KB); the flat-palette encoder keeps them lean.
- **Trade-off — motion is always on.** GitHub does not honor `prefers-reduced-motion` for GIFs.
  Mitigated by keeping badges tiny (small flash area) and blink rates low; the obnoxiousness is,
  after all, the point.
- **Trade-off — rendering needs the Impact font** (same as the banner); without it the wordmark-y
  text falls back to Arial Black and looks off.
- **Note:** presentation only. This changes no execution rule, so the model doc stays at **v1.0** and
  the skill's version line is unchanged — no version bump.

## Correction — 2026-07-08 · encoder + capture fixes (still v1.0, presentation-only)

The first cut of the stamps rendered badly on GitHub: **black flicker on the dark theme
("blackspace") and choppy holes / onion-skin trails.** Two independent bugs in `render.mjs`, both
now fixed; `stamps.src.html`, the README markup, and the stamp inventory are unchanged.

1. **Frame disposal (the "blackspace").** `encode()` let ffmpeg crop each frame to its changed-pixel
   bounding box *and* tag it "restore to background." On a transparent looping badge that clears
   each frame's rectangle to transparent before the next (cropped) frame draws, leaving the un-
   repainted remainder — which reads as **black over the dark README**, and as onion-skin trails on
   the moving stamps. Fix: encode **full, self-contained frames** with `-gifflags -offsetting-transdiff`
   (no crop, no cross-frame diff); each frame repaints the whole canvas, so the background-clear is
   harmless. The per-stamp `diff` config is gone — every stamp encodes uniformly. Cost is lost
   inter-frame compression (~432 KB → ~496 KB total; all stamps stay within budget), accepted for
   correctness.
2. **Headless-Chrome capture race (the "choppy").** Each frame is screenshot in a cold Chrome, which
   occasionally captured *before* the expensive clip-path / mask / gradient layers finished
   compositing — yielding a blank or half-painted still that flickered once per loop (non-
   deterministic; the bad frame moved run to run). Since no stamp animation ever shrinks a badge,
   `renderStamp()` now measures each frame's opaque height (via ffmpeg's alpha bounding box) and
   **re-shoots any frame under 80 % of the tallest**, with a last-resort guardrail that clones the
   nearest good frame over any still-degenerate one so a hole can never ship.

Regenerate as before — `node assets/emoji/render.mjs` — now self-validating and reproducible.
