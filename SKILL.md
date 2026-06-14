---
name: mascot-maker
description: >-
  Design and generate animated mascots built from Unicode block characters —
  recreate the default Claude Code mascot (Clawd), or invent a brand-new mascot
  for your own product, brand, or platform — then export it as high-quality PNG,
  GIF, and MP4. Use when someone wants to create, design, animate, or render a
  mascot, character, avatar, or "logo creature"; build a brand mascot from a
  concept; recreate Clawd; or turn a mascot idea into shareable image/video
  assets. Triggers: "mascot", "make a mascot", "brand mascot", "character",
  "avatar", "Clawd", "animated logo", "mascot gif/png/mp4".
license: MIT
---

# mascot-maker

Create animated mascots out of Unicode **Block Element** characters and export
them as **PNG + GIF + MP4** in high quality. Works for the default Claude Code
mascot **Clawd**, and — more importantly — for a brand-new mascot you design for
**your own brand, product, or platform**.

This skill is portable: drop it into Claude Code, Codex, Cursor, or any coding
agent (see `install/`). The whole pipeline is plain HTML + Node + ffmpeg, no
paid services.

```
concept ─▶ identity ─▶ silhouette ─▶ glyph grid ─▶ states ─▶ loop ─▶ render
  (1)        (2)          (3)            (4)         (5)       (6)      (7)
                                                              PNG · GIF · MP4
```

---

## Quick start

```bash
# 1. (once) install the render dependency
npm i -D playwright && npx playwright install chromium   # ffmpeg must be on PATH

# 2. render the bundled default mascot in all three formats
node scripts/render.mjs --input examples/clawd.html --name clawd \
  --selector ".stage" --duration 5000 --formats png,gif,mp4

# 3. design your own: copy a template, edit the poses, render it
cp templates/stage.html my-mascot.html        # then edit the `poses` + sequence
node scripts/render.mjs --input my-mascot.html --name my-mascot \
  --selector ".stage" --duration 4800 --formats png,gif,mp4
```

Outputs land in `assets/` (or `--out <dir>`): `my-mascot.png`, `.gif`, `.mp4`.

---

## When the user asks for a mascot, do this

1. **Pin the concept (Step 1).** One sentence: *what is it, and what is its
   personality?* "A friendly one-eyed orb." "A blocky robot." "A spark." If the
   user gave a brand (e.g. "for Xotion"), grab its **colors**, **name**, and
   **vibe** first — the mascot has to belong to that brand.
2. **Give it an identity (Step 2).** A name + a one-line "soul" + brand palette.
   Write these as a comment at the top of the HTML so the character stays
   consistent. See `references/01-design-process.md`.
3. **Choose a silhouette that is *distinct* (Step 3).** If you're making a
   custom brand mascot, it must **not** copy Clawd's limbed-robot outline. Pick a
   different body: orb, drop, arrow, flame, fox, comet, leaf. One clear shape
   reads better than a busy one. See `references/05-brand-mascot-playbook.md`.
4. **Build the glyph grid (Step 4).** Lay the shape out in 2–4 text rows using
   **only Block Element characters** (cheat sheet below). Keep it to ~3–6
   columns. Test-render early — block glyphs render differently at different font
   sizes. See `references/02-unicode-technique.md`.
5. **Design states (Step 5).** Idle is mandatory. Add expression states that
   change *one feature* (eye/arms/mouth): `blink`, `look-left/right`, `excited`,
   `thinking`. Keep the outer silhouette stable; animate the inside.
6. **Sequence the loop (Step 6).** A timed array of `{pose, bob, ms}` steps.
   Sum the `ms` — that total is your `--duration` for a seamless loop.
7. **Render (Step 7).** Run `scripts/render.mjs`. Inspect the PNG. Iterate on
   font-size / spacing until the silhouette is clean, then ship all 3 formats.

Then show the user the PNG (and offer the GIF/MP4). If it's for their brand, ask
whether they want it dropped into their repo / README / landing page.

---

## The medium: Unicode Block Elements (cheat sheet)

Everything is built from the **Block Elements** range `U+2580–U+259F`. These are
the *only* glyphs that tile seamlessly into each other — no gaps, no seams.

```
Full / halves      █  ▀  ▄  ▌  ▐
Quarter corners    ▘  ▝  ▖  ▗
Three-quarter      ▛  ▜  ▙  ▟
Shades (texture)   ░  ▒  ▓
```

| Want a…             | Use                                  |
|---------------------|--------------------------------------|
| solid body          | `█`                                  |
| rounded top corners | `▄` on the row above, `█` below      |
| rounded bottom      | `▀` on the row below                 |
| left / right edge   | `▐` (left-filled) / `▌` (right-filled)|
| diagonal shoulder   | `▛ ▜ ▙ ▟`                            |
| eye / gap           | a space ` ` inside a solid row       |
| soft shading        | `░ ▒ ▓`                              |

**Hard rules (learned the hard way):**

- ✅ **Stay inside Block Elements.** Mixing in Geometric Shapes `◢ ◣ ◤ ◥` looks
  fine in a sketch but renders with visible **seams/notches** — they don't align
  to the block grid. Don't use them for body shapes.
- ⚠️ **Font size changes the render.** The same grid looks different at 48px vs
  88px vs 110px. Half-blocks (`▐ ▌`) can collapse to solid at large sizes.
  **Always test-render at your real stage size**; 48–88px on a 600px stage is the
  sweet spot. ~110px tends to break.
- ✅ **Embrace what the font gives you.** `▐█ █▌` may render as *one* eye-window
  instead of two depending on the font — that can become the character's
  charm (a cute one-eyed orb). Render first, then decide.
- ✅ **Use `white-space: pre`** and a monospace font so columns line up.
- ✅ **One silhouette, internal motion.** Keep the outline constant across
  states; move the eyes/arms/mouth inside it.

Full reference + more shapes: `references/02-unicode-technique.md`.

---

## The mascot HTML (anatomy)

Every mascot is one self-contained HTML file on a 600×600 **stage**. Structure:

```html
<div class="stage">           <!-- 600x600, radial-gradient brand background -->
  <div id="mascot"></div>     <!-- the block-character art, font-size ~48–88px -->
  <div id="label">name</div>  <!-- optional wordmark / tagline -->
</div>
<script>
  const poses = {             // each pose = the same rows, one feature changed
    default: { r1: " ▄▄▄ ", r2: "▐█ █▌", r3: " ▀▀▀ " },
    blink:   { r1: " ▄▄▄ ", r2: "▐███▌", r3: " ▀▀▀ " },
    excited: { r1: " ▄▄▄ ", r2: "▐   ▌", r3: " ▀▀▀ " },
  };
  // render(pose, bob): join rows with "\n", set transform translateY(bob)
  // sequence: [{pose, bob, ms}, ...]  ->  loop with setTimeout
</script>
```

Start from `templates/stage.html` (copy it, swap the `poses` + `sequence` +
colors). Two complete, working references:

- `examples/clawd.html` — the **default Claude Code mascot** (blocky robot, 4
  poses, idle loop). Render with `--duration 5000`.
- `examples/xo.html` — a **custom brand mascot** for Xotion (one-eyed orb, 5
  expression states). Render with `--duration 4800`. This is the worked example
  of "design your own."
- `examples/dash.html` — an **object mascot** (a rocket) that emotes through
  *exhaust thrust* instead of an eye, and uses two colors. Render with
  `--duration 4200`. Shows the medium isn't limited to creatures.

---

## States & animation

Pick states from this menu (idle is required), changing **one feature** per state
so the silhouette stays recognizable:

| State        | What changes                       | Use for            |
|--------------|------------------------------------|--------------------|
| `default`    | resting / centered eye             | idle (required)    |
| `blink`      | eye closed (fill the gap)          | liveliness         |
| `look-left`  | eye/gap shifted left               | curiosity, scan    |
| `look-right` | eye/gap shifted right              | curiosity, scan    |
| `excited`    | eye wide / arms up                 | success, celebrate |
| `thinking`   | eye narrowed / tilt                | processing         |
| `arms-up`    | limbs raised (for limbed bodies)   | wave, jump         |

The loop is a timed array; the sum of `ms` is the loop period → pass it as
`--duration`. Example (period = 4800ms):

```js
const sequence = [
  { pose: "default",   bob: 0,   ms: 900 },
  { pose: "blink",     bob: 0,   ms: 120 },
  { pose: "look-left", bob: -2,  ms: 600 },
  { pose: "excited",   bob: -10, ms: 360 },
  // ... sums to 4800
];
```

`bob` is a few-px vertical bounce (`translateY`) that gives the mascot life.
Deeper patterns + a "prompt-and-send" interactive loop: `references/03-states-and-animation.md`.

---

## Rendering to PNG · GIF · MP4

`scripts/render.mjs` drives headless Chromium to capture frames, then ffmpeg to
encode. It auto-detects Chromium (override with `CHROMIUM_PATH`).

```bash
node scripts/render.mjs \
  --input  examples/xo.html \   # html file or http(s):// url
  --name   xo \                 # output basename
  --out    assets \             # output dir (default ./assets)
  --selector ".stage" \         # clip to the stage element (recommended)
  --width 600 --height 600 \    # capture size
  --fps 12 \                    # frames per second
  --duration 4800 \             # = your loop period in ms (clean loop!)
  --scale 2 \                   # device scale for crisp output
  --formats png,gif,mp4         # any subset
```

- **PNG** = a "hero" still (default: middle frame; pick another with `--hero N`).
- **GIF** = `palettegen`/`paletteuse` (lanczos) for clean color + small size,
  `-loop 0` (infinite).
- **MP4** = h264 / yuv420p / faststart — safe for web, social, slides.

**Key rule:** set `--duration` to the *exact* sum of your `sequence` ms so the
last frame meets the first → no visible jump. More flags + troubleshooting:
`references/04-rendering.md`.

---

## Designing for YOUR brand (not just Clawd)

This is the main event. To make a mascot that's *yours*:

1. **Steal the brand, not Clawd.** Pull the brand's exact hex colors, name, and
   tone. The mascot should look like it was always part of that brand.
2. **Different silhouette from Clawd.** Clawd is a square limbed robot. Make
   yours an orb, drop, arrow, flame, fox, comet — anything with its own outline.
3. **Give it a soul + a name.** One sentence of personality drives every pose.
4. **Tie it to the product.** Xo's eye widens when an agent finishes a task; a
   writing app's mascot could hold a cursor. Let the product's core action be the
   mascot's "excited" moment.
5. **Brand the stage.** Background gradient, wordmark, and tagline in brand
   colors so the exported asset is drop-in for a README, landing page, or tweet.

Full playbook with 6 silhouette directions and the Xotion/Xo case study:
`references/05-brand-mascot-playbook.md`.

---

## File map

```
SKILL.md                     ← you are here (the workflow)
scripts/render.mjs           ← HTML → PNG + GIF + MP4 engine
templates/stage.html         ← copy-me starter mascot stage
examples/clawd.html          ← default Claude Code mascot (reference)
examples/xo.html             ← custom brand mascot (worked example)
examples/dash.html           ← object mascot (rocket; thrust-driven animation)
assets/                      ← rendered PNG/GIF/MP4 output
references/
  01-design-process.md       ← concept → identity → ship, in depth
  02-unicode-technique.md     ← full block-character reference & pitfalls
  03-states-and-animation.md  ← state matrix, timing, interactive loops
  04-rendering.md             ← render flags, quality tuning, troubleshooting
  05-brand-mascot-playbook.md ← design for a brand (silhouettes + Xo case study)
install/                     ← install in Claude Code / Codex / Cursor / others
```

## Troubleshooting (fast)

| Symptom                         | Fix                                                        |
|---------------------------------|-----------------------------------------------------------|
| Seams / notches in the body     | You used `◢◣◤◥`. Rebuild with Block Elements only.        |
| Shape huge / panels overlap     | Font too big. Drop to 48–72px and re-render.              |
| Columns don't line up           | Need `white-space: pre` + monospace; equal-length rows.   |
| GIF/MP4 "jumps" on loop         | `--duration` ≠ sum of sequence ms. Make them equal.       |
| "Playwright not found"          | `npm i -D playwright && npx playwright install chromium`. |
| "ffmpeg not found"              | Install ffmpeg and ensure it's on PATH.                   |
| Chromium won't launch           | `export CHROMIUM_PATH=/path/to/chrome` and retry.         |
