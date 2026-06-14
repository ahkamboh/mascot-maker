# 01 · The design process — concept to ship

A mascot is not "some characters that look cute." It's a small **identity**. This
is the process that takes a one-line idea to a finished, on-brand, animated
asset. Follow it in order; each step constrains the next.

## Step 1 — Pin the concept

Write one sentence: **what is it + what is its personality.**

- "A friendly blocky robot." (Clawd)
- "A curious one-eyed orb that lights up when an agent finishes." (Xo)
- "A determined little spark."

If the request names a **brand/product** ("make one for Xotion"), do brand
discovery *first*:

- **Colors** — exact hex values (primary, secondary, background).
- **Name & wordmark** — how is the brand written? Any logo motif (Xotion's is a
  play-button)? The mascot can echo it.
- **Tone** — playful? technical? premium? minimal? This sets pose energy.

## Step 2 — Give it an identity

Lock three things and write them as a comment at the top of the HTML so the
character stays consistent across edits:

```
// Name:       Xo
// Soul:       a calm one-eyed orb that perks up when work is done
// Silhouette: one rounded tile with a single eye-window (no limbs)
// Palette:    #D2563A terracotta on #000 black, cream #F2F0E5 accent
```

A **name** makes it referable. A **soul** (one line) decides every expression. A
**palette** keeps it on-brand.

## Step 3 — Choose a distinct silhouette

The silhouette is what people recognize at a glance. Two rules:

1. **It must read as one clear shape** at small size. Busy shapes turn to mud.
2. **If it's a custom brand mascot, it must NOT clone Clawd.** Clawd owns the
   "square limbed robot." Pick a different body so yours is ownable. See the six
   directions in `05-brand-mascot-playbook.md` (orb, drop, arrow, flame, fox,
   comet).

Sketch the outline in your head as a 2–4 row grid before touching glyphs.

## Step 4 — Build the glyph grid

Lay the silhouette out in text rows using **only Block Elements**. Keep it
compact: ~3–6 columns, 2–4 rows. Equal-length rows. See
`02-unicode-technique.md` for the full character set and the seam pitfalls.

**Test-render immediately** — block glyphs render differently at different font
sizes. Don't design blind; render the `default` pose, look at the PNG, adjust.

## Step 5 — Design states

Idle (`default`) is required. Add expression states that change **one feature**
(eye, arms, mouth) while keeping the silhouette stable. See the state matrix in
`03-states-and-animation.md`. Tie at least one state to the product's core action
(the "excited"/success moment).

## Step 6 — Sequence the loop

Order the states into a timed `sequence` of `{pose, bob, ms}`. Keep idle longest,
expressions short. **Sum the ms** — that's your `--duration` for a seamless loop.

## Step 7 — Render, inspect, iterate

Run `scripts/render.mjs`, open the PNG, and check:

- Is the silhouette clean (no seams, no overlap)?
- Is it legible at small size (it'll be a favicon/README badge someday)?
- Does the loop feel alive but not frantic?

Tune font-size, spacing, and timing. When the PNG is right, ship all three
formats (PNG/GIF/MP4) and hand them to the user.

## A note on iteration (from real sessions)

Expect 2–4 silhouette attempts before one clicks. Things that went wrong before,
so you can skip them:

- A star/X made of quarter-blocks (`▘ ▝ ▖ ▗`) scattered into disconnected
  rectangles — too sparse to read as one shape.
- A droplet using `◢◣◤◥` rendered with seams and an awkward detached "foot."
- A blob at 110px rendered as a single solid square — half-blocks collapsed.

The fix each time was the same: **pure Block Elements, smaller font, render and
look.** Don't trust the sketch; trust the render.
