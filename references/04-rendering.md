# 04 · Rendering to PNG · GIF · MP4

`scripts/render.mjs` is the export engine. It drives headless **Chromium**
(Playwright) to screenshot animation frames, then **ffmpeg** to encode them. No
paid services, fully local.

```
HTML ──▶ Chromium frame capture (fps × duration) ──▶ ffmpeg ──▶ PNG · GIF · MP4
```

## Requirements

- **Node 18+**
- **Playwright + Chromium**: `npm i -D playwright && npx playwright install chromium`
- **ffmpeg** on `PATH` (for GIF/MP4; PNG-only needs no ffmpeg)

Chromium is auto-detected from common locations
(`PLAYWRIGHT_BROWSERS_PATH`, `/opt/pw-browsers`, `~/.cache/ms-playwright`).
Override explicitly with `export CHROMIUM_PATH=/path/to/chrome`.

## All flags

| Flag         | Default       | Meaning                                            |
|--------------|---------------|----------------------------------------------------|
| `--input`    | *(required)*  | `.html` file path, or an `http(s)://` URL          |
| `--name`     | *(required)*  | output basename (`xo` → `xo.png/.gif/.mp4`)        |
| `--out`      | `./assets`    | output directory                                   |
| `--width`    | `600`         | capture width (px)                                 |
| `--height`   | `600`         | capture height (px)                                |
| `--fps`      | `12`          | frames per second captured & encoded               |
| `--duration` | `4000`        | one loop length in ms (**= sum of sequence ms**)   |
| `--selector` | *(none)*      | CSS selector to clip to, e.g. `.stage`             |
| `--hero`     | `mid`         | frame index for the PNG still (or `mid`)           |
| `--scale`    | `2`           | device scale factor (2 = crisp/retina)             |
| `--formats`  | `png,gif,mp4` | any comma subset                                   |
| `--bg`       | `#000000`     | fallback solid background                          |

## Recommended invocation

```bash
node scripts/render.mjs --input my-mascot.html --name my-mascot \
  --selector ".stage" --width 600 --height 600 \
  --fps 12 --duration <SUM_OF_MS> --scale 2 --formats png,gif,mp4
```

Always pass `--selector ".stage"` so output is clipped to the 600×600 stage
(not the whole viewport), and `--duration` = the exact sum of your sequence ms.

## What each format is tuned for

- **PNG** — a single "hero" still (default: middle frame). Use `--hero N` to pick
  a specific frame (e.g. the `excited` payoff). Great for README badges, favicons,
  social cards, app icons. Rendered at `--scale 2` for crispness.
- **GIF** — two-pass `palettegen` + `paletteuse` (lanczos scaling, diff stats,
  Bayer dither) for clean color and small size, `-loop 0` for infinite looping.
  Great for GitHub READMEs, tweets, Slack.
- **MP4** — h264 / `yuv420p` / `+faststart`, even dimensions. Great for landing
  pages, ads, slides, anywhere that won't autoplay a GIF.

## Quality tuning

| Want…                    | Do                                                       |
|--------------------------|---------------------------------------------------------|
| smaller GIF              | lower `--fps` (8–10) or `--width/height`                |
| smoother motion          | raise `--fps` (15–24); larger files                     |
| crisper still/video      | raise `--scale` to 3 (slower, bigger)                   |
| PNG of the payoff pose   | `--hero <frame index of the excited moment>`            |
| transparent PNG          | give `.stage` `background: transparent` (PNG keeps alpha)|

## Troubleshooting

| Symptom                            | Cause / fix                                            |
|------------------------------------|--------------------------------------------------------|
| `Playwright not found`             | `npm i -D playwright && npx playwright install chromium`|
| `ffmpeg not found on PATH`         | install ffmpeg; or render `--formats png` only          |
| Chromium fails to launch           | `export CHROMIUM_PATH=/abs/path/to/chrome`             |
| Output is the whole page, not stage| pass `--selector ".stage"`                              |
| GIF/MP4 jumps at the loop seam     | `--duration` must equal the sum of your sequence ms     |
| Blurry text                        | raise `--scale`; ensure monospace font is available     |
| Colors look washed out             | already forcing sRGB; check your CSS uses real hex      |
| Frames look identical / frozen     | your JS animation isn't running — check the console     |

## How it works (for hacking on it)

1. Launch Chromium headless at `viewport = width×height`, `deviceScaleFactor =
   scale`.
2. `goto` the file/URL, wait for `networkidle` + 250ms (let fonts settle).
3. Loop `frames = round(fps × duration/1000)` times: screenshot (clip to selector
   if given), then `waitForTimeout(1000/fps)` so the page's own `setTimeout`
   animation advances in real time.
4. **PNG**: copy the hero frame.
   **GIF**: `palettegen` then `paletteuse`.
   **MP4**: `libx264 -crf 18 -pix_fmt yuv420p -movflags +faststart`.
5. Clean up the temp frame directory.

It's ~200 lines of dependency-light Node — fork it freely.
