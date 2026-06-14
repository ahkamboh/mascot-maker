# 05 · Brand mascot playbook

This is the main event: designing a mascot for **your own** brand/product/
platform — not just recreating Clawd. The goal is a character that looks like it
was always part of the brand, and that nobody mistakes for someone else's mascot.

## The five rules

1. **Steal the brand, not Clawd.** Use the brand's exact hex colors, its name,
   and its tone. Clawd is the *method*, not the *look* — your mascot should not
   inherit Clawd's silhouette.
2. **Pick a distinct silhouette.** Clawd owns "square limbed robot." Choose a
   body with its own outline (see directions below). One clear shape.
3. **Give it a soul and a name.** One sentence of personality; one short,
   ownable name. Both go in a comment at the top of the HTML.
4. **Wire it to the product.** The mascot's "excited"/payoff state should fire on
   the product's core action (task done, message sent, file saved, deploy green).
5. **Brand the whole stage.** Background gradient, optional wordmark + tagline, in
   brand colors — so the exported PNG/GIF/MP4 drops straight into a README,
   landing page, app onboarding, or launch tweet.

## Six silhouette directions (all Block-Element-friendly)

Each is deliberately different from Clawd's robot. Start from one and adapt.

**1. Orb / tile** — one rounded body, a single eye-window. Calm, friendly,
modern. (This is Xo.)
```
 ▄▄▄
▐█ █▌
 ▀▀▀
```

**2. Drop / blob** — rounded bottom, pointed-ish top. Soft, liquid, approachable.
```
  ▄
 ███
▐███▌
 ▀▀▀
```

**3. Arrow / chevron creature** — forward-leaning, implies speed/shipping.
```
▐▙
▐██▖
▐██▘
▐▛
```

**4. Spark / flame** — energetic, "ideas," creative tools.
```
 ▝▙▘
 ▟█▙
▝▀ ▀▘
```

**5. Fox / ears** — two top points (ears), a face. Clever, characterful.
```
▟▖ ▗▙
▐█▀█▌
 ▝▄▘
```

**6. Comet / streak** — a head with a motion tail. Momentum, launches.
```
░▒▓██▖
  ▝▀▀
```

> These are starting points — render each at your stage size and refine. Some
> will surprise you (a font may merge or split cells); keep what reads cleanly.

## Matching brand colors

Set them once as CSS variables on `.stage` (the template does this):

```css
:root {
  --brand:   #D2563A;   /* mascot body            */
  --accent:  #F2F0E5;   /* wordmark / highlights  */
  --bg-core: #1a1a1a;   /* backdrop center        */
  --bg-edge: #000000;   /* backdrop edge          */
}
```

The mascot color is `var(--brand)`; the glow (`text-shadow`) should be a
translucent version of it. A dark radial backdrop (`--bg-core` → `--bg-edge`)
makes the glow pop and keeps the export versatile.

---

## Worked case study: **Xo** for Xotion

Xotion is "the editor for AI agents." Brand: terracotta `#D2563A` + cream
`#F2F0E5` on black, wordmark `X[▶]otion` (a play-button icon for the "o").

**Step 1 — Concept.** "A calm one-eyed orb that perks up when an agent finishes a
task." Friendly, minimal, technical-but-warm — matching Xotion's tone.

**Step 2 — Identity.**
```
// Name:       Xo
// Soul:       a calm one-eyed orb that perks up when work is done
// Silhouette: one rounded tile with a single eye-window (no limbs)
// Palette:    #D2563A on #000, cream #F2F0E5 accent
```

**Step 3 — Distinct silhouette.** Deliberately *not* Clawd's robot. A single
compact orb, no arms/legs. The whole character is one shape + one eye.

**Step 4 — Glyph grid.** Pure Block Elements at ~88px:
```
 ▄▄▄
▐█ █▌    ← the space is the eye-window
 ▀▀▀
```

**Step 5 — States.** The eye is the only actor: `default` (centered), `blink`
(closed `▐███▌`), `look-left` `▐ ██▌`, `look-right` `▐██ ▌`, `excited` (wide
`▐   ▌`). Silhouette never changes.

**Step 6 — Loop.** Idle → blink → glance L/R → blink → **excited** (the payoff,
mapped to "agent finished") → settle. Total 4800ms.

**Step 7 — Render.**
```bash
node scripts/render.mjs --input examples/xo.html --name xo \
  --selector ".stage" --duration 4800 --formats png,gif,mp4
```

**Design history (what to skip).** Earlier Xo attempts that failed: a quadrant-
block "X-spark" (scattered, unreadable); a droplet using `◢◣◤◥` (seams + a
detached "foot"); a blob at 110px (half-blocks collapsed to a solid square). The
winning move was pure Block Elements at a smaller size — render, look, adjust.

### Going further: a product promo

For a launch asset, embed Xo in a mini UI story (prompt types a request → send
button pulses → Xo gets excited → "✓ DONE" appears), branded with the `X[▶]otion`
wordmark and the tagline "THE EDITOR FOR AI AGENTS." Same render engine outputs
the GIF/MP4. See the interactive-loop pattern in `03-states-and-animation.md`.
