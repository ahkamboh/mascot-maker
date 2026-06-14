# Install in Codex (and other AGENTS.md agents)

Codex and several other CLI agents read an **`AGENTS.md`** file for project
instructions. There's no skill folder convention, so you wire the skill in by
vendoring the folder and pointing `AGENTS.md` at `SKILL.md`.

## 1. Vendor the folder

```bash
mkdir -p tools
git clone https://github.com/ahkamboh/mascot-maker tools/mascot-maker
rm -rf tools/mascot-maker/.git
```

## 2. Reference it from `AGENTS.md`

Add this block to your repo's `AGENTS.md` (create it if missing):

```markdown
## Mascot generation

When asked to create, design, animate, or render a **mascot / character /
avatar / brand mascot** (or to recreate Clawd), follow the workflow in
`tools/mascot-maker/SKILL.md`. It produces PNG + GIF + MP4 from Unicode
block-character art.

Quick path:
1. Read `tools/mascot-maker/SKILL.md` and the relevant `references/*.md`.
2. Copy `tools/mascot-maker/templates/stage.html`, edit poses/colors.
3. Render: `node tools/mascot-maker/scripts/render.mjs --input <file>.html
   --name <name> --selector ".stage" --duration <sum_of_ms> --formats png,gif,mp4`
```

## 3. Install the render dependency once

```bash
cd tools/mascot-maker
npm install && npx playwright install chromium
# ensure ffmpeg is on PATH
```

## 4. Use it

Ask Codex: *"Design a mascot for my product and render gif/png/mp4."* It will
read `SKILL.md` via the `AGENTS.md` pointer and run the pipeline.

> The same approach works for any agent that reads a root instruction file —
> just add the pointer block to whatever file that agent loads.
