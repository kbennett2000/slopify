#!/usr/bin/env node
/*
 * Renders the animated README "infomercial stamp" GIFs from assets/emoji/stamps.src.html.
 *
 *   node assets/emoji/render.mjs            # render all stamps
 *   node assets/emoji/render.mjs free knob  # render only the named stamp(s)
 *
 * For each stamp it screenshots N frozen frames in headless Chrome (transparent background,
 * 3x device scale) by driving stamps.src.html?stamp=<name>&f=<0..1>, then encodes a looping
 * transparent GIF with ffmpeg (palettegen/paletteuse). Needs `google-chrome` and `ffmpeg` on
 * PATH and the Impact font installed. Commit the resulting *.gif alongside this script.
 */
import { execFile } from "node:child_process";
import { mkdtemp, rm, mkdir, stat, readdir, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const CHROME = process.env.CHROME || "google-chrome";
const SCALE = 2; // device pixel ratio: 2x is ample for a ~40px display and keeps files lean
const OUT_DIR = new URL("./", import.meta.url);
const SRC_URL = new URL("./stamps.src.html", import.meta.url).href;
const SIZE_WARN = 100 * 1024; // flag any GIF over ~100 KB

// name → render box (CSS px), frame count, and playback fps (loop = frames / fps seconds).
// Every stamp encodes as full, self-contained frames (see encode()), so there is no per-stamp
// diff config: a transparent badge whose silhouette moves can never leave onion-skin trails.
const STAMPS = [
  { name: "as-seen-on-tv", w: 122, h: 122, frames: 2, fps: 2 }, // color flash, fixed shape
  { name: "alert", w: 122, h: 122, frames: 12, fps: 12 },
  { name: "call-now", w: 122, h: 122, frames: 12, fps: 12 },
  { name: "but-wait", w: 236, h: 120, frames: 12, fps: 12 },
  { name: "free", w: 122, h: 122, frames: 12, fps: 12 },
  { name: "slopdial", w: 142, h: 142, frames: 12, fps: 12 }, // disc is static, pointer sweeps
  { name: "guaranteed", w: 124, h: 124, frames: 15, fps: 15 },
];

const CHROME_FLAGS = [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-color-profile=srgb",
  "--default-background-color=00000000", // transparent screenshot
  "--run-all-compositor-stages-before-draw",
  "--virtual-time-budget=1500",
];

async function shot(stamp, f, outPng, userDataDir) {
  const url = `${SRC_URL}?stamp=${stamp.name}&f=${f}`;
  await run(CHROME, [
    ...CHROME_FLAGS,
    `--force-device-scale-factor=${SCALE}`,
    `--window-size=${stamp.w},${stamp.h}`,
    `--user-data-dir=${userDataDir}`,
    `--screenshot=${outPng}`,
    url,
  ]);
  // Chrome exits 0 even when a screenshot silently fails; make sure the file exists.
  await stat(outPng);
}

async function encode(stamp, frameDir, outGif) {
  // Flat palette (dither=none) keeps large color areas from turning into compression-hostile
  // noise; alpha_threshold binarizes the alpha so 1-bit-GIF transparency stays clean.
  //
  // `-gifflags -offsetting-transdiff` is essential: it disables BOTH ffmpeg gif
  // optimizations so every frame is a full-canvas, self-contained image (no bounding-box crop,
  // no cross-frame transparency diff). ffmpeg still tags frames "restore to background" — but
  // because each frame repaints the whole canvas, that clear-to-transparent is harmless. Without
  // this, cropped frames + restore-to-background leave the wiped rectangle un-repainted, which
  // reads as black flicker over GitHub's dark README ("blackspace") and onion-skin trails on the
  // moving stamps. Full frames cost inter-frame compression (watch SIZE_WARN); the smaller diffed
  // encoding is not worth re-breaking compositing for.
  const filter =
    "[0:v]split[a][b];" +
    "[a]palettegen=max_colors=64:reserve_transparent=1:stats_mode=full[p];" +
    "[b][p]paletteuse=alpha_threshold=128:dither=none";
  await run("ffmpeg", [
    "-y",
    "-framerate", String(stamp.fps),
    "-i", join(frameDir, "f_%03d.png"),
    "-filter_complex", filter,
    "-gifflags", "-offsetting-transdiff",
    "-loop", "0",
    outGif,
  ]);
}

// Opaque-content height (px) of a rendered frame, via ffmpeg's alpha bounding box. Headless
// Chrome occasionally screenshots a frame before its clip-path / mask / gradient layers finish
// compositing, leaving a blank or half-painted still. None of the stamp animations ever shrink a
// badge (pulses only scale up, the rest rotate/recolor), so a frame much shorter than its peers
// is always such a bad capture — this lets renderStamp detect and re-shoot them.
async function opaqueHeight(png) {
  try {
    const { stderr } = await run("ffmpeg", [
      "-hide_banner", "-i", png,
      "-vf", "alphaextract,cropdetect=limit=16:round=2:skip=0:reset=0",
      "-frames:v", "1", "-f", "null", "-",
    ]);
    const m = [...stderr.matchAll(/crop=\d+:(\d+):/g)].pop();
    return m ? parseInt(m[1], 10) : 0;
  } catch {
    return 0; // treat an unreadable/alpha-less frame as degenerate -> re-shoot
  }
}

async function renderStamp(stamp) {
  const frameDir = await mkdtemp(join(tmpdir(), `stamp-${stamp.name}-`));
  const udd = await mkdtemp(join(tmpdir(), `chrome-${stamp.name}-`));
  const png = (i) => join(frameDir, `f_${String(i).padStart(3, "0")}.png`);
  const phase = (i) => i / stamp.frames; // 0..1 (never 1, which == 0)
  // Every screenshot gets its own cold profile subdir (reusing one warm profile makes Chrome
  // restore stale window metrics and render the badge undersized). A counter keeps re-shoots cold
  // too. Cold starts are race-prone, which the re-shoot safety net below cleans up.
  let shotN = 0;
  const shoot = (i) => shot(stamp, phase(i), png(i), join(udd, String(shotN++)));
  try {
    for (let i = 0; i < stamp.frames; i++) await shoot(i);

    // Safety net: re-shoot any frame the compositor race left blank/half-painted. The tallest
    // frame is a complete paint; anything under 80% of it is degenerate (legit motion never
    // shrinks a badge below ~88% — the widest is the BUT WAIT rock). Converges in 1–2 passes.
    const heights = [];
    for (let i = 0; i < stamp.frames; i++) heights.push(await opaqueHeight(png(i)));
    const ref = Math.max(...heights, 1);
    for (let pass = 0; pass < 10; pass++) {
      const bad = heights.flatMap((h, i) => (h < 0.8 * ref ? [i] : []));
      if (!bad.length) break;
      if (pass === 9) {
        console.log(`  ⚠ ${stamp.name}: ${bad.length} frame(s) still degenerate: ${bad.join(",")}`);
        break;
      }
      for (const i of bad) {
        await shoot(i);
        heights[i] = await opaqueHeight(png(i));
      }
    }

    // Last-resort guardrail: if a frame is *still* degenerate after every re-shoot (rare, only
    // under heavy machine load), never let it ship as a black flash — clone the nearest good
    // frame over it. Worst case is an imperceptible 1-frame hold instead of a hole in the loop.
    for (const i of heights.flatMap((h, i) => (h < 0.8 * ref ? [i] : []))) {
      let src = -1;
      for (let d = 1; d < stamp.frames && src < 0; d++) {
        if (i - d >= 0 && heights[i - d] >= 0.8 * ref) src = i - d;
        else if (i + d < stamp.frames && heights[i + d] >= 0.8 * ref) src = i + d;
      }
      if (src >= 0) {
        await copyFile(png(src), png(i));
        console.log(`  ↺ ${stamp.name}: cloned frame ${src} over un-renderable frame ${i}`);
      }
    }

    const outGif = fileURLToPath(new URL(`${stamp.name}.gif`, OUT_DIR));
    await encode(stamp, frameDir, outGif);
    const { size } = await stat(outGif);
    const kb = (size / 1024).toFixed(1);
    const flag = size > SIZE_WARN ? "  ⚠ over 100 KB" : "";
    console.log(`  ✓ ${stamp.name}.gif — ${stamp.frames} frames, ${kb} KB${flag}`);
    return size;
  } finally {
    await rm(frameDir, { recursive: true, force: true });
    await rm(udd, { recursive: true, force: true });
  }
}

async function main() {
  const want = process.argv.slice(2);
  const todo = want.length ? STAMPS.filter((s) => want.includes(s.name)) : STAMPS;
  if (!todo.length) {
    console.error(`No matching stamps. Known: ${STAMPS.map((s) => s.name).join(", ")}`);
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Rendering ${todo.length} stamp(s) → assets/emoji/`);
  let total = 0;
  for (const stamp of todo) total += await renderStamp(stamp);
  console.log(`Done. ${(total / 1024).toFixed(1)} KB total.`);
}

main().catch((err) => {
  console.error(err.stderr || err.message || err);
  process.exit(1);
});
