# 02 · Unicode block-character technique

The entire medium is the Unicode **Block Elements** range, `U+2580–U+259F`.
These 32 glyphs are designed to tile on a grid, so they snap together into
seamless shapes in a monospace font. This is the single most important rule:
**stay inside this range for body shapes.**

## The full set

```
U+2580  ▀  upper half
U+2581  ▁  lower 1/8        U+2582 ▂  U+2583 ▃  U+2584 ▄ lower half
U+2585  ▅  U+2586 ▆  U+2587 ▇   U+2588 █  full block
U+2589  ▉  ... U+258F ▏     (left N/8 — rarely needed)
U+2590  ▐  right half
U+2591  ░  light shade   U+2592 ▒ medium shade   U+2593 ▓ dark shade
U+2594  ▔  upper 1/8     U+2595 ▕ right 1/8
U+2596  ▖  lower-left quarter
U+2597  ▗  lower-right quarter
U+2598  ▘  upper-left quarter
U+2599  ▙  upper-left + both lower (3/4)
U+259A  ▚  upper-left + lower-right (diagonal)
U+259B  ▛  upper-left + upper-right + lower-left (3/4)
U+259C  ▜  upper-left + upper-right + lower-right (3/4)
U+259D  ▝  upper-right quarter
U+259E  ▞  upper-right + lower-left (diagonal)
U+259F  ▟  upper-right + both lower (3/4)
```

## The working palette (what you'll actually use)

```
Body fill        █
Rounded top      ▄   (sits above █: looks like a rounded shoulder)
Rounded bottom   ▀   (sits below █: rounded foot)
Left edge        ▐    Right edge   ▌
Corners          ▛ ▜ ▙ ▟     (diagonal shoulders / rounded corners)
Tiny feet/spark  ▘ ▝ ▖ ▗
Texture/shadow   ░ ▒ ▓
Eye / gap        (a space)
```

## Recipes

**A rounded orb (Xo):**
```
 ▄▄▄      row1: rounded top
▐█ █▌     row2: body with a centered eye-window (the space)
 ▀▀▀      row3: rounded bottom
```

**A blocky robot head + arms + feet (Clawd):**
```
 ▐▛███▜▌    row1: head with antenna edges
▝▜█████▛▘   row2: body with shoulders
  ▘▘ ▝▝     row3: feet
```

**Shifting an eye** (look-left / look-right): move the space inside the body row.
```
▐ ██▌  look-left      ▐██ ▌  look-right      ▐█ █▌  center
```

**Closing an eye** (blink): fill the gap — `▐███▌`.
**Widening** (excited): open it up — `▐   ▌`.

## Hard-won rules

1. **Do not mix in Geometric Shapes `◢ ◣ ◤ ◥` (U+25E2–U+25E5).** They look like
   they'd make nice diagonals, but they are sized/positioned for a *different*
   grid than Block Elements. Combining them produces visible **seams and
   notches**, and they often render much larger than the blocks beside them. If
   you need a diagonal, use `▙ ▟ ▛ ▜` or `▚ ▞`.

2. **Font size is part of the design.** The same grid can look completely
   different at 48px, 72px, and 110px:
   - At ~48–88px on a 600px stage: crisp, tiles correctly. **Sweet spot.**
   - At ~110px+: half-blocks (`▐ ▌`) can render as *solid*, collapsing two eye
     slits into one (or filling them entirely), and shapes can overflow the
     stage. **Avoid.**
   Always render at the real stage size before judging the shape.

3. **`white-space: pre` + monospace are mandatory.** Otherwise leading spaces
   collapse and columns drift. Make every row the **same number of characters**
   (pad with spaces) so they stack.

4. **Let the font surprise you.** `▐█ █▌` is "two slits" on paper but frequently
   renders as a single centered window. Render it; if you get a charming
   one-eyed look, keep it. Constraints make character.

5. **Glow, don't outline.** A `text-shadow` in the brand color (e.g.
   `0 0 28px rgba(...)`) gives depth without adding glyphs that could break the
   tiling.

## Quick legibility test

Squint at the PNG (or scale it to 32px). If you can still tell what it is, the
silhouette is good. If it turns to a blob, simplify: fewer columns, bigger
features, one clear eye.
