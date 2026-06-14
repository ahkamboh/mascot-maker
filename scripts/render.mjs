#!/usr/bin/env node
/**
 * mascot-maker render engine
 * -------------------------------------------------------------------------
 * Turns a self-contained mascot HTML file into high-quality PNG, GIF and MP4.
 *
 * Pipeline:  HTML  ->  Playwright (Chromium) frame capture  ->  ffmpeg encode
 *
 * Usage:
 *   node scripts/render.mjs --input examples/clawd.html --name clawd \
 *        --out assets --width 600 --height 600 --fps 12 --duration 5000 \
 *        --formats png,gif,mp4
 *
 * Options:
 *   --input     Path to an .html file (or an http(s):// URL).            [required]
 *   --name      Output basename (clawd -> clawd.png/.gif/.mp4).          [required]
 *   --out       Output directory.                              [default: ./assets]
 *   --width     Capture width in px.                           [default: 600]
 *   --height    Capture height in px.                          [default: 600]
 *   --fps       Frames per second to capture and encode.       [default: 12]
 *   --duration  One full loop length in ms (frames = fps*ms/1000). [default: 4000]
 *   --selector  CSS selector to clip to (e.g. ".stage").  [default: full viewport]
 *   --hero      Frame index used for the PNG still (or "mid"). [default: mid]
 *   --formats   Comma list of png,gif,mp4.                     [default: png,gif,mp4]
 *   --scale     Device scale factor for crisp output.         [default: 2]
 *   --bg        Solid background fallback color.               [default: #000000]
 *
 * Requirements: Node 18+, Playwright (chromium), ffmpeg on PATH.
 * The script auto-detects a Chromium binary; override with env CHROMIUM_PATH.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

// ---- tiny arg parser -----------------------------------------------------
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) { out[key] = true; }
      else { out[key] = next; i++; }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

const INPUT = args.input;
const NAME = args.name;
if (!INPUT || !NAME) {
  console.error("ERROR: --input and --name are required.\n" +
    "Example: node scripts/render.mjs --input examples/clawd.html --name clawd");
  process.exit(1);
}

const OUT = resolve(args.out || "assets");
const WIDTH = parseInt(args.width || "600", 10);
const HEIGHT = parseInt(args.height || "600", 10);
const FPS = parseInt(args.fps || "12", 10);
const DURATION = parseInt(args.duration || "4000", 10);
const SELECTOR = args.selector || null;
const SCALE = parseFloat(args.scale || "2");
const FORMATS = String(args.formats || "png,gif,mp4").split(",").map(s => s.trim());
const FRAMES = Math.max(1, Math.round((FPS * DURATION) / 1000));
const HERO = args.hero === undefined || args.hero === "mid"
  ? Math.floor(FRAMES / 2)
  : parseInt(args.hero, 10);

// ---- chromium discovery --------------------------------------------------
function findChromium() {
  if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) {
    return process.env.CHROMIUM_PATH;
  }
  // Common Playwright install roots.
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    "/opt/pw-browsers",
    join(process.env.HOME || "", ".cache/ms-playwright"),
  ].filter(Boolean);
  for (const root of roots) {
    if (!existsSync(root)) continue;
    try {
      for (const dir of readdirSync(root)) {
        if (!dir.startsWith("chromium")) continue;
        const candidates = [
          join(root, dir, "chrome-linux", "chrome"),
          join(root, dir, "chrome-mac", "Chromium.app/Contents/MacOS/Chromium"),
          join(root, dir, "chrome-win", "chrome.exe"),
        ];
        for (const c of candidates) if (existsSync(c)) return c;
      }
    } catch { /* ignore */ }
  }
  return null; // let Playwright try its own bundled browser
}

// ---- locate Playwright (works whether installed locally or globally) -----
async function loadChromium() {
  const candidates = [
    "playwright",
    "/opt/node22/lib/node_modules/playwright/index.js",
    join(process.env.HOME || "", ".npm-global/lib/node_modules/playwright/index.js"),
  ];
  for (const mod of candidates) {
    try {
      const target = isAbsolute(mod) ? pathToFileURL(mod).href : mod;
      const pkg = await import(target);
      // Some builds expose chromium as a named export, others only on default.
      const chromium = pkg.chromium || (pkg.default && pkg.default.chromium);
      if (chromium) return chromium;
    } catch { /* try next */ }
  }
  throw new Error(
    "Playwright not found. Install it with:  npm i -D playwright  &&  npx playwright install chromium"
  );
}

function run(cmd, argv) {
  const r = spawnSync(cmd, argv, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} exited with code ${r.status}`);
}

function hasFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return r.status === 0;
}

// ---- main ----------------------------------------------------------------
(async () => {
  if ((FORMATS.includes("gif") || FORMATS.includes("mp4")) && !hasFfmpeg()) {
    throw new Error("ffmpeg not found on PATH (needed for gif/mp4). Install ffmpeg or use --formats png.");
  }

  mkdirSync(OUT, { recursive: true });
  const frameDir = mkdtempSync(join(tmpdir(), "mascot-frames-"));

  const chromium = await loadChromium();
  const exe = findChromium();
  const launchOpts = { headless: true, args: ["--force-color-profile=srgb", "--hide-scrollbars"] };
  if (exe) launchOpts.executablePath = exe;

  console.log(`> launching chromium${exe ? ` (${exe})` : " (bundled)"}`);
  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
  });

  const url = /^https?:\/\//.test(INPUT) ? INPUT : pathToFileURL(resolve(INPUT)).href;
  console.log(`> loading ${url}`);
  await page.goto(url, { waitUntil: "networkidle" });

  // Let fonts settle before the first frame.
  await page.waitForTimeout(250);

  const clip = SELECTOR ? await page.$(SELECTOR) : null;
  const interval = 1000 / FPS;
  console.log(`> capturing ${FRAMES} frames @ ${FPS}fps (${DURATION}ms loop)`);

  for (let i = 0; i < FRAMES; i++) {
    const file = join(frameDir, `f${String(i).padStart(4, "0")}.png`);
    if (clip) await clip.screenshot({ path: file });
    else await page.screenshot({ path: file });
    if (i < FRAMES - 1) await page.waitForTimeout(interval);
  }
  await browser.close();

  // ---- PNG still --------------------------------------------------------
  if (FORMATS.includes("png")) {
    const heroIdx = Math.min(Math.max(0, HERO), FRAMES - 1);
    const src = join(frameDir, `f${String(heroIdx).padStart(4, "0")}.png`);
    const dst = join(OUT, `${NAME}.png`);
    copyFileSync(src, dst);
    console.log(`> wrote ${dst}`);
  }

  // ---- GIF (palettegen + paletteuse for clean color) --------------------
  if (FORMATS.includes("gif")) {
    const palette = join(frameDir, "palette.png");
    const vf = `fps=${FPS},scale=${WIDTH}:${HEIGHT}:flags=lanczos`;
    run("ffmpeg", ["-y", "-i", join(frameDir, "f%04d.png"),
      "-vf", `${vf},palettegen=stats_mode=diff`, palette]);
    const dst = join(OUT, `${NAME}.gif`);
    run("ffmpeg", ["-y", "-framerate", String(FPS), "-i", join(frameDir, "f%04d.png"),
      "-i", palette,
      "-lavfi", `${vf}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
      "-loop", "0", dst]);
    console.log(`> wrote ${dst}`);
  }

  // ---- MP4 (h264, yuv420p, even dims, loop-friendly) --------------------
  if (FORMATS.includes("mp4")) {
    const dst = join(OUT, `${NAME}.mp4`);
    run("ffmpeg", ["-y", "-framerate", String(FPS), "-i", join(frameDir, "f%04d.png"),
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos,format=yuv420p",
      "-c:v", "libx264", "-profile:v", "high", "-crf", "18",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", dst]);
    console.log(`> wrote ${dst}`);
  }

  rmSync(frameDir, { recursive: true, force: true });
  console.log("> done.");
})().catch((err) => {
  console.error("RENDER FAILED:", err.message);
  process.exit(1);
});
