# AGENTS.md — instructions for coding agents

This repository **is** a skill: it teaches you to design and render mascots.

When the user asks you to **create, design, animate, or render a mascot,
character, avatar, "logo creature," or brand mascot** — or to recreate the
default Claude Code mascot (Clawd) — follow the workflow in **[`SKILL.md`](SKILL.md)**.

## Fast path

1. Read `SKILL.md` (and the relevant files in `references/` for depth).
2. Pin the concept + identity + brand colors. Choose a silhouette that is
   distinct (don't clone Clawd for a custom brand mascot).
3. Copy `templates/stage.html`, then edit the `poses`, the `sequence`, and the
   colors. **Use only Unicode Block Elements** (`█ ▀ ▄ ▌ ▐ ▛ ▜ ▙ ▟ …`).
4. Render all three formats:
   ```bash
   node scripts/render.mjs --input <your-file>.html --name <name> \
     --selector ".stage" --duration <sum-of-sequence-ms> --formats png,gif,mp4
   ```
5. Show the user the PNG; offer the GIF/MP4. Iterate on font-size/timing.

## Worked examples to learn from

- `examples/clawd.html` — the default Claude Code mascot (limbed robot).
- `examples/xo.html` — a custom brand mascot (one-eyed orb).
- `examples/dash.html` — a non-creature mascot (rocket; animates via exhaust).

## Requirements

Node 18+, Playwright + Chromium (`npm install && npx playwright install
chromium`), and ffmpeg on PATH. See `references/04-rendering.md` for details and
troubleshooting.
