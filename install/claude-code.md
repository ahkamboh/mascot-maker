# Install in Claude Code

Claude Code discovers skills as folders containing a `SKILL.md`. Put this whole
folder where Claude Code looks for skills.

## Option A — personal skill (available in every project)

```bash
git clone https://github.com/ahkamboh/mascot-maker ~/.claude/skills/mascot-maker
```

Now `~/.claude/skills/mascot-maker/SKILL.md` exists. In any session, ask
*"make me a mascot"* (or invoke `/mascot-maker` if your build exposes skills as
slash commands) and Claude Code will load it.

## Option B — project skill (checked into a repo, shared with your team)

From the repo root:

```bash
mkdir -p .claude/skills
git clone https://github.com/ahkamboh/mascot-maker .claude/skills/mascot-maker
rm -rf .claude/skills/mascot-maker/.git   # vendor it into your repo
git add .claude/skills/mascot-maker && git commit -m "Add mascot-maker skill"
```

Anyone who clones the repo gets the skill automatically.

## Install the render dependency once

```bash
cd .claude/skills/mascot-maker   # or ~/.claude/skills/mascot-maker
npm install                      # installs Playwright (declared in package.json)
npx playwright install chromium  # downloads the browser
# ffmpeg must already be on your PATH (brew install ffmpeg / apt install ffmpeg)
```

## Verify

```bash
node scripts/render.mjs --input examples/clawd.html --name clawd \
  --selector ".stage" --duration 5000 --formats png,gif,mp4
open assets/clawd.gif   # macOS (use xdg-open on Linux)
```

## Use it

Just describe what you want:
- "Recreate the default Claude mascot as a gif."
- "Design a mascot for my brand **Acme** — colors `#22D3EE`/`#0F172A`, it's a
  developer tool. Give me png, gif, and mp4."

Claude Code reads `SKILL.md`, runs the workflow, and renders the assets.
