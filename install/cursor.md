# Install in Cursor

Cursor reads project rules from **`.cursor/rules/*.mdc`** files. Vendor the
folder and add a rule that points the agent at `SKILL.md`.

## 1. Vendor the folder

```bash
git clone https://github.com/ahkamboh/mascot-maker tools/mascot-maker
rm -rf tools/mascot-maker/.git
```

## 2. Add a Cursor rule

Create `.cursor/rules/mascot-maker.mdc`:

```mdc
---
description: Create animated mascots (PNG/GIF/MP4) from Unicode block characters
globs:
alwaysApply: false
---

When the user asks to create, design, animate, or render a mascot, character,
avatar, or brand mascot (or to recreate Clawd), use the mascot-maker skill in
`tools/mascot-maker/`.

1. Read `tools/mascot-maker/SKILL.md` and any relevant `references/*.md`.
2. Copy `tools/mascot-maker/templates/stage.html`; edit `poses`, `sequence`,
   and brand colors. Use ONLY Unicode Block Elements (U+2580–U+259F).
3. Render all three formats:
   node tools/mascot-maker/scripts/render.mjs --input <file>.html \
     --name <name> --selector ".stage" --duration <sum_of_ms> \
     --formats png,gif,mp4
4. Show the PNG; offer the GIF/MP4.
```

`alwaysApply: false` keeps it out of the way until a mascot task comes up; the
`description` lets Cursor pull it in automatically when relevant. Set
`alwaysApply: true` if you want it always in context.

## 3. Install the render dependency once

```bash
cd tools/mascot-maker
npm install && npx playwright install chromium
# ensure ffmpeg is on PATH
```

## 4. Use it

In Cursor chat: *"Make a mascot for my app and export gif/png/mp4."* The rule
points the agent at the skill and it runs the pipeline.
