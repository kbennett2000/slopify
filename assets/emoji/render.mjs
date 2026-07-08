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
import { mkdtemp, rm, mkdir, stat, readdir } from "node:fs/promises";
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
// diff:true enables the cross-frame GIF diff — only safe when the opaque silhouette never
// changes (e.g. the SlopDial's disc; the knob moves over an opaque face), else it leaves trails.
const STAMPS = [
  { name: "as-seen-on-tv", w: 122, h: 122, frames: 2, fps: 2, diff: true }, // color flash, fixed shape
  { name: "alert", w: 122, h: 122, frames: 12, fps: 12 },
  { name: "call-now", w: 122, h: 122, frames: 12, fps: 12 },
  { name: "but-wait", w: 236, h: 120, frames: 12, fps: 12 },
  { name: "free", w: 122, h: 122, frames: 12, fps: 12 },
  { name: "slopdial", w: 142, h: 142, frames: 12, fps: 12, diff: true }, // disc is static, pointer sweeps
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
  // `-gifflags -transdiff` writes each frame in full (no cross-frame diff): with transparent
  // frames whose opaque silhouette moves (scale/rotate), a diff would leave onion-skin trails.
  const filter =
    "[0:v]split[a][b];" +
    "[a]palettegen=max_colors=64:reserve_transparent=1:stats_mode=full[p];" +
    "[b][p]paletteuse=alpha_threshold=128:dither=none";
  await run("ffmpeg", [
    "-y",
    "-framerate", String(stamp.fps),
    "-i", join(frameDir, "f_%03d.png"),
    "-filter_complex", filter,
    "-gifflags", stamp.diff ? "+transdiff" : "-transdiff",
    "-loop", "0",
    outGif,
  ]);
}

async function renderStamp(stamp) {
  const frameDir = await mkdtemp(join(tmpdir(), `stamp-${stamp.name}-`));
  const udd = await mkdtemp(join(tmpdir(), `chrome-${stamp.name}-`));
  try {
    for (let i = 0; i < stamp.frames; i++) {
      const f = i / stamp.frames; // phase 0..1 (never 1, which == 0)
      const png = join(frameDir, `f_${String(i).padStart(3, "0")}.png`);
      await shot(stamp, f, png, join(udd, String(i)));
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
