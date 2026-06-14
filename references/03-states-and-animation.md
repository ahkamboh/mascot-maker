# 03 · States & animation

A mascot feels alive when its **states** change meaningfully and its **timing**
breathes. This file covers the state matrix, the loop format, the vertical bounce,
and a richer "interactive" loop (typing into a prompt and getting a result) you
can reuse for product promos.

## State matrix

Idle (`default`) is required. Everything else changes **one feature** so the
silhouette stays recognizable. Pick what fits the character's anatomy.

| State        | What moves                         | Read as          | Anatomy needed     |
|--------------|------------------------------------|------------------|--------------------|
| `default`    | nothing (resting), centered eye    | calm / idle      | any                |
| `blink`      | eye gap filled                     | alive            | has an eye         |
| `look-left`  | eye gap shifted left               | curious / scan   | has an eye         |
| `look-right` | eye gap shifted right              | curious / scan   | has an eye         |
| `excited`    | eye wide / arms up                 | success / joy    | any                |
| `thinking`   | eye narrowed, slight tilt          | processing       | has an eye         |
| `arms-up`    | limbs raised                       | wave / jump      | has limbs (Clawd)  |
| `sleeping`   | eye as a thin line, dimmed         | idle-too-long    | has an eye         |
| `error`      | shake + color flash                | failure          | any                |

Tie **one** state to the product's core action — that's the payoff moment of the
loop. (Xo's eye widens to `excited` exactly when an agent finishes a task.)

## The loop format

A loop is an array of steps; each step is a pose held for `ms`, with an optional
vertical `bob`:

```js
const sequence = [
  { pose: "default",    bob: 0,   ms: 900 },  // hold idle the longest
  { pose: "blink",      bob: 0,   ms: 120 },  // blinks are fast (80–140ms)
  { pose: "look-left",  bob: -2,  ms: 600 },
  { pose: "look-right", bob: -2,  ms: 600 },
  { pose: "excited",    bob: -10, ms: 360 },  // the payoff
  { pose: "default",    bob: 0,   ms: 720 },  // settle back
];
// total = 3300ms  ->  render with --duration 3300
```

Driver:

```js
let step = 0;
function animate() {
  const s = sequence[step % sequence.length];
  render(s.pose, s.bob);
  step++;
  setTimeout(animate, s.ms);
}
animate();
```

### Timing guidelines

- **Idle** holds longest (700–1000ms) — let it breathe.
- **Blinks** are quick (80–140ms).
- **Looks** are medium (400–700ms).
- **The payoff** (`excited`) is short and punchy (300–400ms), often doubled with
  a deeper `bob` for a little "jump."
- **Total period** 3–6s reads well as a GIF and isn't a huge file.

### The bounce (`bob`)

`bob` is a small `translateY` (in px) applied via CSS transform. A 2–4px idle
sway plus a deeper -10 to -14px on the payoff gives weight and life. Keep the
CSS `transition: transform 0.18s ease` so moves are smooth, not robotic.

## Seamless loops

The render captures `fps × duration/1000` frames over real time. For the loop to
close cleanly, **`--duration` must equal the sum of your `sequence` ms.** If the
GIF/MP4 "jumps," that sum is off — fix it and re-render.

## Advanced: the interactive product loop

For a promo (mascot + UI), you can stage a mini-story: a prompt box types a
request, a cursor moves to a send button, it "clicks," the mascot celebrates, and
a result appears. Structure it as tick phases instead of fixed poses:

```js
const promptText = "polish this intro";
const TYPE_TICKS   = Math.ceil(promptText.length / 2); // type 2 chars/tick
const MOVE_TICKS   = 3;   // cursor travels to the send button
const CLICK_TICKS  = 2;   // button pulses, ripple fires, mascot reacts
const RESULT_TICKS = 6;   // result text + sparkles, mascot excited
const RESET_TICKS  = 3;   // fade back to idle
const total = TYPE_TICKS + MOVE_TICKS + CLICK_TICKS + RESULT_TICKS + RESET_TICKS;
// one tick ~130ms; advance phases by comparing (tick % total) to cumulative bounds
```

Each phase sets the prompt text, cursor position, button state, and mascot pose.
The mascot uses the same `poses`/`render` as the idle loop — just driven by the
phase instead of a fixed sequence. This is exactly how the Xotion promo was built;
the same engine renders it to GIF/MP4.

## Handing off to other runtimes

If the user wants the mascot in an app rather than a video, the states map
cleanly to:

- **Lottie**: each state = keyframes on scale/opacity/position; blink = quick
  opacity dip on the eye layer.
- **SwiftUI / CSS**: `default`↔`excited` via `scaleEffect`/`translateY` with
  spring animations; loop with `repeatForever`.

The block-character grid is the source of truth; re-draw those cells as vector
shapes if you need infinite resolution.
