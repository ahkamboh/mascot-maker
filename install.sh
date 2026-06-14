#!/usr/bin/env bash
# =============================================================================
# mascot-maker installer
# Installs this skill where your coding agent will find it.
#
#   ./install.sh             # -> Claude Code (~/.claude/skills/mascot-maker)
#   ./install.sh claude      # same as above
#   ./install.sh cursor      # -> ./tools/mascot-maker + a .cursor rule
#   ./install.sh codex       # -> ./tools/mascot-maker + an AGENTS.md pointer
#   ./install.sh here        # -> ./mascot-maker (generic vendor)
#
# Add --deps to also install the render dependency (Playwright + Chromium).
# ffmpeg must be installed separately and on your PATH.
# =============================================================================
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-claude}"
WANT_DEPS="no"
for a in "$@"; do [ "$a" = "--deps" ] && WANT_DEPS="yes"; done

case "$TARGET" in
  claude) DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/mascot-maker" ;;
  cursor|codex) DEST="$(pwd)/tools/mascot-maker" ;;
  here) DEST="$(pwd)/mascot-maker" ;;
  --deps) DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/mascot-maker"; TARGET="claude" ;;
  *) echo "unknown target '$TARGET' (use: claude | cursor | codex | here)"; exit 1 ;;
esac

echo "› installing mascot-maker -> $DEST"
mkdir -p "$(dirname "$DEST")"
rm -rf "$DEST"
cp -R "$HERE" "$DEST"
rm -rf "$DEST/.git" "$DEST/node_modules"

# Wire up agent-specific pointers so the agent discovers the skill.
if [ "$TARGET" = "cursor" ]; then
  mkdir -p "$(pwd)/.cursor/rules"
  cat > "$(pwd)/.cursor/rules/mascot-maker.mdc" <<'RULE'
---
description: Create animated mascots (PNG/GIF/MP4) from Unicode block characters
alwaysApply: false
---
When asked to create/design/animate/render a mascot, character, avatar, or brand
mascot (or recreate Clawd), use the skill in tools/mascot-maker/ — read its
SKILL.md, copy templates/stage.html, edit poses/colors with Unicode Block
Elements only, then render with tools/mascot-maker/scripts/render.mjs to
PNG/GIF/MP4.
RULE
  echo "› wrote .cursor/rules/mascot-maker.mdc"
elif [ "$TARGET" = "codex" ]; then
  touch "$(pwd)/AGENTS.md"
  if ! grep -q "mascot-maker" "$(pwd)/AGENTS.md" 2>/dev/null; then
    cat >> "$(pwd)/AGENTS.md" <<'PTR'

## Mascot generation
When asked to create/design/animate/render a mascot, character, avatar, or brand
mascot (or recreate Clawd), follow tools/mascot-maker/SKILL.md. It renders
PNG + GIF + MP4 from Unicode block-character art.
PTR
    echo "› appended pointer to AGENTS.md"
  fi
fi

if [ "$WANT_DEPS" = "yes" ]; then
  echo "› installing render dependency (Playwright + Chromium)…"
  ( cd "$DEST" && npm install && npx playwright install chromium )
  echo "› NOTE: ensure ffmpeg is installed and on your PATH (gif/mp4 need it)."
fi

echo "✓ done. Read $DEST/SKILL.md, then ask your agent to make a mascot."
