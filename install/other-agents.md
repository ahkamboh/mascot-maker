# Install in any other coding agent

mascot-maker is just a folder of Markdown + one Node script. Any agent that can
**read files** and **run shell commands** can use it. The pattern is always the
same:

1. **Vendor the folder** somewhere in (or near) your project:
   ```bash
   git clone https://github.com/ahkamboh/mascot-maker tools/mascot-maker
   rm -rf tools/mascot-maker/.git
   ```
2. **Point the agent at `SKILL.md`** using whatever instruction mechanism it has:
   | Agent / tool            | Where to add the pointer                         |
   |-------------------------|--------------------------------------------------|
   | Claude Code             | `.claude/skills/` folder (see `claude-code.md`)  |
   | Codex / AGENTS.md tools | `AGENTS.md` (see `codex.md`)                      |
   | Cursor                  | `.cursor/rules/*.mdc` (see `cursor.md`)          |
   | Windsurf                | `.windsurfrules`                                 |
   | Cline / Roo             | `.clinerules`                                    |
   | Aider                   | a `CONVENTIONS.md` referenced with `--read`      |
   | Continue.dev            | a rule block in `config.json`/`config.yaml`      |
   | Zed                     | project instructions / `.rules`                  |
   | Gemini CLI              | `GEMINI.md`                                       |
   | anything else           | its system prompt / project-instructions file     |

   Pointer text to paste:
   > When asked to create, design, animate, or render a **mascot / character /
   > avatar / brand mascot** (or recreate Clawd), follow
   > `tools/mascot-maker/SKILL.md`. Copy `templates/stage.html`, edit the poses
   > and colors with Unicode Block Elements only, then render with
   > `node tools/mascot-maker/scripts/render.mjs --input <file>.html --name <n>
   > --selector ".stage" --duration <sum_of_ms> --formats png,gif,mp4`.

3. **Install the render dependency once:**
   ```bash
   cd tools/mascot-maker
   npm install && npx playwright install chromium   # ffmpeg must be on PATH
   ```

## No-agent / manual use

You don't even need an agent. Humans can use it directly:

```bash
cp templates/stage.html my-mascot.html      # edit poses + colors by hand
node scripts/render.mjs --input my-mascot.html --name my-mascot \
  --selector ".stage" --duration 4680 --formats png,gif,mp4
```

The skill is the documentation; the script is the tool. Both are MIT-licensed —
fork, edit, and redistribute freely.
