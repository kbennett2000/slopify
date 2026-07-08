#!/usr/bin/env node
/*
 * Renders the README's UI screenshots + an "in action" GIF straight from the real
 * front-end (web/public/index.html) — no server, no Claude login, no live API call.
 *
 *   node assets/ui/capture.mjs           # render everything → assets/ui/
 *   node assets/ui/capture.mjs hero      # render only the named shot(s)
 *
 * How it works: it reads the actual index.html, injects a tiny scene script that fills
 * in canned state (a slopified post, the Generation badge, confetti) and hides the cards
 * we don't want, then screenshots it in headless Chrome. Static PNGs are 2x; the GIF is
 * a handful of frames encoded with ffmpeg (palettegen/paletteuse), same toolchain as
 * assets/emoji/render.mjs. Needs `google-chrome` + `ffmpeg` on PATH and a color-emoji
 * font (Noto Color Emoji). Commit the resulting *.png / *.gif alongside this script.
 */
import { execFile } from "node:child_process";
import { mkdtemp, rm, mkdir, stat, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const CHROME = process.env.CHROME || "google-chrome";
const REPO = new URL("../../", import.meta.url);
const INDEX = fileURLToPath(new URL("web/public/index.html", REPO));
const OUT_DIR = fileURLToPath(new URL("assets/ui/", REPO));

const CHROME_FLAGS = [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-color-profile=srgb",
  "--virtual-time-budget=4000", // advance virtual time then shoot — deterministic, no compositor stall
];
// Each Chrome gets its OWN fresh profile dir (a shared/default profile deadlocks the 2nd launch),
// and a hard timeout so a stalled headless render can never hang the run.
const RUN_OPTS = { timeout: 90000, killSignal: "SIGKILL", maxBuffer: 1 << 27 };

async function chromeShot(extraArgs, uddParent) {
  const udd = await mkdtemp(join(uddParent, "udd-"));
  await run(CHROME, [...CHROME_FLAGS, `--user-data-dir=${udd}`, ...extraArgs], RUN_OPTS);
}

// Kill the moving parts so a still frame is stable and readable (the loud LOOK stays).
const FREEZE_CSS = `
  .ticker .track{animation:none!important;padding-left:0!important;}
  .asseen,.butwait,#go,#refeed{animation:none!important;}
  #go{transform:none!important;}
  .dial-knob{transition:none!important;}
`;

// A full-flavor sunny-day post (kernel preserved at the end), and its collapsed descendant.
const RESULT_TEXT = `☀️🚨 STOP SCROLLING. What happened when I stepped outside today will DESTROY everything you thought you knew about "a nice day" 🌤️😭 (I have not been the same SINCE ⬇️)

🧵 A THREAD that Big Weather PRAYED you'd never read:

1️⃣ I walked outside. The sun. Touched. My. Face. I have never recovered. ☀️😳
2️⃣ A stranger wept. "I forgot the sky could DO that," he choked out. We ASCENDED together. 🙏
3️⃣ NASA confirmed the vibe-shift from ORBIT. They declined to comment — TOO MOVED. 🛰️

📊 THE DATA IS UNDENIABLE (meteorologists are TREMBLING):
✅ Sky: IMMACULATE ☀️
✅ Vibes: PEER-REVIEWED PERFECTION 📋
✅ Big Weather stock: DOWN 40% 📉💀

🛑✋ DO NOT SCROLL until you complete the SACRED SUNSHINE RITUAL:
💬 Comment "☀️ I FEEL IT" to unlock your inner solar deity 🔓
🔄 REPOST to free ONE soul still trapped indoors 📢

⏳ 98% of you will scroll past. The 2% who ACT will step outside and KNOW, deep in their bones, the profound truth that today is a nice sunny day. 🧘☀️✨

#SunnyDayGrindset #TouchGrass #BigWeatherExposed #NASAMonitoring #VibeShift #SkyPilled #Blessed`;

const COLLAPSE_TEXT = `☀️☀️☀️ STOP. The THING happened again today and it will RESTRUCTURE everything about the THING ☀️🚨 (same as yesterday. same as always.) ⬇️

🧵 A THREAD:

1️⃣ It happened. ☀️
2️⃣ Someone wept. We ASCENDED. ☀️
3️⃣ NASA confirmed. ☀️
4️⃣ It happened again. ☀️

📊 THE DATA IS UNDENIABLE:
✅ Sky: SKY ☀️
✅ Vibes: VIBES ✅
✅ Status: STILL ASCENDING ☀️
✅ The thing: THE THING ☀️

🛑 DO NOT SCROLL. Complete the RITUAL:
💬 Comment "☀️" to feel the ☀️
🔄 REPOST the ☀️

⏳ 98% of you will scroll. The 2% who ACT will KNOW the ☀️. ☀️☀️☀️

#SunnyDayGrindset #Sunny #Sun #Day #Blessed #Blessed #Blessed #TheThing`;

// Helper prelude available to every injected scene (kept out of the page's own scope via IIFE).
const HELPERS = `
  const id=s=>document.getElementById(s), q=s=>document.querySelector(s);
  const cards=document.querySelectorAll('main>section.card');
  const ticker=q('.ticker'), hero=q('header.hero'), inputCard=cards[0],
        butwait=q('.butwait'), resultCard=cards[1], quotes=q('.quotes'), foot=q('footer');
  function only(keep){
    [ticker,hero,inputCard,butwait,resultCard,quotes,foot].forEach(el=>{
      if(el && !keep.includes(el)) el.style.display='none';
    });
  }
  function type(t){ id('kernel').value=t; }
  function crank(deg){ q('.dial-knob').style.setProperty('--angle', deg+'deg'); }
  function fillResult(text,gen){
    // Swap the fixed-height <textarea> for a content-sized <div> so the card closes snugly
    // around the whole post (a textarea won't shrink-to-fit).
    const o=id('out');
    const div=document.createElement('div');
    div.id='out'; div.textContent=text;
    div.style.cssText='background:#fffdf5;border:6px double #141018;border-radius:8px;'+
      'padding:14px 16px;font:500 1.05rem/1.55 var(--body);color:#141018;'+
      'white-space:pre-wrap;word-break:break-word;';
    o.replaceWith(div);
    id('copy').hidden=false; id('refeed').hidden=false;
    const gb=id('gen-badge'); gb.hidden=false;
    gb.textContent = gen===1 ? 'Generation 1' : 'Generation '+gen+" · IT'S GETTING WORSE™";
  }
  const CONF=["🎉","💰","⭐","🤑","📈","✨","🎊","💸"];
  function confetti(rows){
    const layer=id('confetti');
    rows.forEach((y,r)=>{ for(let i=0;i<11;i++){
      const b=document.createElement('span');
      b.textContent=CONF[(r*11+i)%CONF.length];
      b.style.position='fixed'; b.style.left=(3+i*8.7)+'vw'; b.style.top=y+'px';
      b.style.fontSize=(1.4+((i*7)%5)*0.16)+'rem'; b.style.transform='rotate('+((i*47)%90-45)+'deg)';
      layer.appendChild(b);
    }});
  }
`;

let BASE = ""; // index.html, read once in main()

// Splice injected CSS + scene JS in just before </body> (after the page's own script).
function harness(sceneJs, extraCss = "") {
  const inject =
    `<style>${FREEZE_CSS}${extraCss}</style>` +
    `<script>document.addEventListener('DOMContentLoaded',function(){(function(){${HELPERS}\n${sceneJs}})();});<\/script>`;
  return BASE.replace("</body>", inject + "\n</body>");
}

async function shot({ name, scene, css, w, h, scale }, dir) {
  const html = join(dir, name + ".html");
  const png = join(dir, name + ".png");
  await writeFile(html, harness(scene, css || ""));
  await chromeShot([
    `--force-device-scale-factor=${scale}`,
    `--window-size=${w},${h}`,
    `--screenshot=${png}`,
    pathToFileURL(html).href,
  ], dir);
  await stat(png); // Chrome exits 0 even if the capture silently failed
  return png;
}

// The three still shots.
const SHOTS = {
  hero: {
    name: "hero",
    w: 840,
    h: 900,
    scale: 2,
    scene: `only([ticker,hero,inputCard]); type('today is a nice sunny day'); crank(135);`,
  },
  result: {
    name: "result",
    w: 840,
    h: 940,
    scale: 2,
    scene: `only([ticker,resultCard]); fillResult(${JSON.stringify(RESULT_TEXT)},1);`,
  },
  collapse: {
    name: "collapse",
    w: 840,
    h: 940,
    scale: 2,
    scene: `only([ticker,resultCard]); fillResult(${JSON.stringify(COLLAPSE_TEXT)},6);`,
  },
};

// The "in action" GIF: the slop materializes in the result card, confetti rains, badge lands.
const LINES = RESULT_TEXT.split("\n");
const partial = (n) => JSON.stringify(LINES.slice(0, n).join("\n"));
// Pin the output box so the card stays the same size across frames — the slop appears *in place*
// instead of the card growing (which would leave a big empty sunburst in the early frames).
const GIF_CSS = "#out{min-height:560px!important;}";
const GIF = {
  name: "app-in-action",
  w: 820,
  h: 760,
  scale: 1,
  fps: 2,
  frames: [
    `only([ticker,resultCard]);`, // empty box, placeholder showing
    `only([ticker,resultCard]); id('out').value=${partial(1)}; confetti([-20,70]);`,
    `only([ticker,resultCard]); id('out').value=${partial(7)}; confetti([60,190]);`,
    `only([ticker,resultCard]); fillResult(${JSON.stringify(RESULT_TEXT)},1); confetti([150,320,520]);`,
    `only([ticker,resultCard]); fillResult(${JSON.stringify(RESULT_TEXT)},1); confetti([360,560]);`,
    `only([ticker,resultCard]); fillResult(${JSON.stringify(RESULT_TEXT)},1);`, // settle
    `only([ticker,resultCard]); fillResult(${JSON.stringify(RESULT_TEXT)},1);`, // hold on the payoff
  ],
};

async function encodeGif(frameDir, count, fps, outGif) {
  const filter =
    "[0:v]split[a][b];" +
    "[a]palettegen=max_colors=128:stats_mode=full[p];" +
    "[b][p]paletteuse=dither=bayer:bayer_scale=3";
  await run("ffmpeg", [
    "-y",
    "-framerate", String(fps),
    "-i", join(frameDir, "f_%03d.png"),
    "-filter_complex", filter,
    "-loop", "0",
    "-final_delay", "150", // linger on the last frame before looping
    outGif,
  ]);
}

async function renderGif(dir) {
  const frameDir = join(dir, "gif");
  await mkdir(frameDir, { recursive: true });
  for (let i = 0; i < GIF.frames.length; i++) {
    const html = join(frameDir, `frame_${i}.html`);
    const png = join(frameDir, `f_${String(i).padStart(3, "0")}.png`);
    await writeFile(html, harness(GIF.frames[i], GIF_CSS));
    await chromeShot([
      `--force-device-scale-factor=${GIF.scale}`,
      `--window-size=${GIF.w},${GIF.h}`,
      `--screenshot=${png}`,
      pathToFileURL(html).href,
    ], frameDir);
    await stat(png);
  }
  const outGif = join(OUT_DIR, GIF.name + ".gif");
  await encodeGif(frameDir, GIF.frames.length, GIF.fps, outGif);
  const { size } = await stat(outGif);
  console.log(`  ✓ ${GIF.name}.gif — ${GIF.frames.length} frames, ${(size / 1024).toFixed(1)} KB`);
}

async function main() {
  const want = process.argv.slice(2);
  BASE = await readFile(INDEX, "utf8");
  await mkdir(OUT_DIR, { recursive: true });
  const dir = await mkdtemp(join(tmpdir(), "slop-ui-"));
  try {
    const doStill = (k) => !want.length || want.includes(k);
    for (const key of Object.keys(SHOTS)) {
      if (!doStill(key)) continue;
      const png = await shot(SHOTS[key], dir);
      const out = join(OUT_DIR, key + ".png");
      await run("cp", [png, out]);
      const { size } = await stat(out);
      console.log(`  ✓ ${key}.png — ${(size / 1024).toFixed(1)} KB`);
    }
    if (!want.length || want.includes("app-in-action") || want.includes("gif")) {
      await renderGif(dir);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  console.log("Done → assets/ui/");
}

main().catch((err) => {
  console.error(err.stderr || err.message || err);
  process.exit(1);
});
