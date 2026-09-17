# Refinement log

One line per change, its source chapter in `TELETECH-EVENTS-DESIGN-REFERENCE.md`, and a
keep-or-revert decision. Written as the pass runs, not afterwards.

The reference's own README states it was never independently fact-checked. Every value
taken from it was re-verified in a browser before being kept, and where the browser and
the document disagreed the browser won. Those cases are marked **discrepancy**.

Baseline at the start of this pass: 100,813 bytes excluding images.

---

## System 1: the chrome (chapter 8)

| # | Change | Source | Decision |
|---|---|---|---|
| 1.1 | `menu.js` open: force a synchronous reflow (`void menu.offsetWidth`) instead of one `requestAnimationFrame` before adding `.is-open` | 8.4.3 | **keep** |
| 1.2 | `menu.js` close: listen for `transitionend` on the last row's index rather than on the dialog, fallback 400ms → 600ms | 8.4.3 | **keep** |
| 1.3 | Hide the menu trigger at ≥992px; hairline bar metrics (25px wide, 8px gap, `--fq-text-dim`) | 8.3.7, defect 12 | **keep** |
| 1.4 | Bottom-anchor the menu: `.fq-menu__head { margin-block-end: auto }` puts the numbered list in the thumb zone | 8.4.2 | **keep** |
| 1.5 | Current page in the top nav: a 4×8px orange border-triangle, label goes `--fq-text-strong`, instead of colouring a whole word orange | 8.3.3 | **keep** |
| 1.6 | Current row in the menu: label bright, only the index numeral orange (was both) | 8.3.3 | **keep** |
| 1.7 | Publish the baked grain tile as `--fq-grain-tile` and paint it on the dialog | 8.1.1 | **keep** |
| 1.8 | Footer rebuilt as a three-legend datasheet (Index / Contact / Basis) on the 12-column lattice, wordmark and legal line under a rule | 8.5.1, 8.5.3 | **keep** |
| 1.9 | Top bar: drop `backdrop-filter: blur(6px)` and the 88% `color-mix`, go flat opaque | 8.3, 30.15 | **keep** |
| 1.10 | Delete `.fq-menu::backdrop` — unreachable behind an opaque full-viewport dialog | 8.4 | **keep** |
| 1.11 | `.fq-menu { display: flex }` unscoped | — | **REVERT** |

### Notes

**1.1 — kept, but the reported bug did not reproduce.** The mining agent claimed the reveal
"on some loads does not play at all" because a single `rAF` is not guaranteed to land after
`showModal()` commits the display change. I instrumented it and sampled the label's
`translateY` 40ms after opening, five times: the transition was running in **5 of 5** trials.
So this is not a bug fix. It is kept only because forcing the reflow is strictly more
reliable and is 35 bytes shorter than the `rAF` closure. Logged honestly rather than
claimed as a fix.

**1.2 — confirmed by measurement.** `transitionend` bubbles, so listening on the dialog fired
on the first row to finish. Measured: the dialog closed at **285ms** when the last row needs
275ms delay + 250ms duration = **525ms**. Every close was cut roughly in half. After the fix
it completes at **541ms** and the last row is seen to finish.

**1.3 — confirmed.** At 1000px and 1600px both `.fq-topnav` (`display: flex`) and
`.fq-menu-trigger` (`display: flex`) were visible: two complete navigations to the same six
links, which is the reference's own documented defect reproduced. Now verified as a clean
handoff: 390/768/991 show the trigger only, 992/1600 show the top nav only.

**1.7 — confirmed.** A `<dialog>` opened with `showModal()` paints in the top layer, above
every normal-flow element regardless of `z-index`, so the fixed grain host at `z-index: 100`
disappeared the instant the menu opened. The dialog now paints the same tile on itself.

**1.11 — REVERTED, and it was my own regression.** Adding `display: flex` to `.fq-menu` to
bottom-anchor it overrode the UA rule `dialog:not([open]) { display: none }`. The result:
the **closed** dialog rendered as a full-height block at the top of all six pages, pushing
the hero off screen. Caught by looking at a screenshot, not by the audit script, which only
checked images, overflow, `h1` count and alt text. Fixed by scoping to `.fq-menu[open]`, and
the audit script now asserts that a closed dialog is not visible and that `<main>` does not
start more than 400px down the page.

### Rejected from the mining, with reasons

- **The boot grid / preloader, in every form** (8.2). A preloader is only honest when it
  covers real work. These pages are ~10KB and load instantly from disk; the reference's grid
  exists to mask a genuinely slow Webflow boot. A fake delay to justify an animation is the
  definition of cargo-culting. Not built.
- **An ASCII copyright, `(C) 2025 TEAM FUNQTION`** (8.5). Recommended by the mining agent as
  more in-register. It would change mandated Dutch copy, which the brief forbids absolutely.
  The verbatim line stays.
- **"Fixing" index.html's short footer legal line.** Flagged as an inconsistency against the
  other five pages. It is not: `CONTENT.md` specifies `© FEEL THE MUSIQ` for index and the
  long line elsewhere. Left exactly as specified.
- **The character-scramble hover on nav and body links** (8.3, 9.2.2). A `setInterval` at
  75ms is a 13Hz loop, well under the brief's 200ms floor, and it replaces readable link text
  with noise mid-interaction. Forbidden twice over.
- **The nav reveal stagger on page load, the `mix-blend-mode: difference` tagline strip, and
  scrollbar suppression** (8.3). The first is decoration on a six-link bar; the second needs
  video behind it and the page is flat `#040404`; the third removes a real affordance.

---

## System 2: typography (chapter 6)

| # | Change | Source | Decision |
|---|---|---|---|
| 2.1 | Delete all six `font-variant-numeric: tabular-nums` declarations | 6.8, 6.13 | **keep** |
| 2.2 | `::selection` off the accent to `--fq-off-white`, plus `img::selection { transparent }` | 6.15 | **keep** |
| 2.3 | Delete `.fq-hardware-label`; move the system's one positive tracking (`0.03em`) onto `.fq-label` | 6.8 | **keep** |
| 2.4 | `--fq-size-sub` 17px → 21px | 6.5, 6.7 | **keep** |
| 2.5 | Remove `font-style: italic` from `.fq-caption` | 6.18 | **keep** |
| 2.6 | Remove `letter-spacing: var(--fq-track-display)` from `.fq-event__tag` | 6.8 | **keep** |
| 2.7 | Delete dead tokens `--fq-weight-medium`, `--fq-size-micro`, `--fq-size-title` | 6.5 | **keep** |
| 2.8 | Drop weight 500 from the Google Fonts query on all six pages | 6.18, 30.11 | **keep** |
| 2.9 | `text-wrap: balance` on h1/h2/h3, `text-wrap: pretty` on prose | 6.19 | **keep** |
| 2.10 | Remove `-webkit-font-smoothing: antialiased` from `body` | 6.14 | **REVERT** |

### Notes

**2.1 — verified as genuinely dead code before deleting.** The claim was that
`tabular-nums` is a no-op on a monospace stack. Measured in the browser rather than assumed:
the per-digit width spread across `0`–`9` in JetBrains Mono is **0px**, and the string
`0123456789` measures **78.016px with and without** the property. All six declarations were
inert. This is the opposite of the refine brief's expectation, which asked for tabular
numerals to be *added*: the font already guarantees them.

**2.2 — the single best orange saving in the pass.** Dragging a cursor across a Dutch
paragraph painted a solid `#f68712` block behind it: the largest orange area the site could
produce, and reader-triggered rather than designer-controlled. Now an off-white highlight,
confirmed by screenshot.

**2.3 — one rule, not one element.** `.fq-hardware-label` was a byte-for-byte duplicate of
`.fq-label` apart from margin and tracking, used on four rows of one page. The positive
tracking now lives on the panel legend itself, which is the site's silk-screened-label
register and appears on every section. Still exactly one positive-tracking declaration.

**2.5 — no italic axis is loaded.** The font query asks for `wght@300;400` only, so
`font-style: italic` on the gig captions was rendering a synthetic oblique: upright glyphs
sheared by the rasteriser on a monospace face at 11px.

**2.10 — REVERTED.** The argument was that the reference's *effective* smoothing is `auto`,
because its `body { antialiased }` is overridden by a later universal-selector rule, and
that Funqtion had copied the dead half of that pair. Plausible. But I could not demonstrate
any improvement, and could not even observe a difference in headless Chromium on Linux,
where the property is largely inert. A change whose only justification is fidelity to a
document that was never fact-checked, and whose effect I cannot see, does not meet the bar.
Reverted.

### Discrepancy found

**The weight-500 saving was overstated by roughly two orders of magnitude.** The mining
agent argued that dropping `500` from the Google Fonts query saves "a third @font-face,
~25KB of woff2". Checking `document.fonts` at runtime, all three JetBrains Mono 500 faces
report `status: "unloaded"` — the browser declares them from the CSS but never downloads a
face nothing uses. Only weights **300 and 400** are ever computed on the page. The real
saving is the `@font-face` declarations in the stylesheet Google serves plus four characters
of URL on six pages, not 25KB. Kept anyway, because it is free and it makes the request
honest, but logged so the number is not repeated as fact.

### Rejected from the mining

- **`-webkit-line-clamp: 2` on gig titles** (6.12). It exists in the reference to stop a
  43-item CMS grid reflowing when an editor types a long name. There are four gigs and their
  titles are fixed strings in the HTML. Nothing to defend against.
- **Reproducing the reference's 11px prose.** The 15px decision from pass one stands. The
  reference's 11px works because almost nothing it calls prose is prose; this site has real
  Dutch sentences.
- **Raising the uppercase ratio toward the reference's 36-of-65.** Counted here: 18 of 92
  selectors. The gap is almost entirely real prose paragraphs, which must not be uppercased.
  The label, heading and nav registers are already fully uppercase.
- **The justified hero with the `text-indent` staircase, the display face as running body
  copy, and a third technical-label face.** All three need the reference's scale, its video
  layer, or a font it admits was never rendered.

---

## System 3: motion (chapter 10)

| # | Change | Source | Decision |
|---|---|---|---|
| 3.1 | `grain.js`: delete the tile-cycling `setInterval` and drop `frames` 3 → 1 | 10.7.4, 11.1.7 | **keep** |
| 3.2 | `grain.js`: drift from 500ms/`steps(20)` to 3000ms/`steps(6)` | 10.7.4 | **keep** |
| 3.3 | `grain.js`: `will-change: transform` only when an animation actually exists | 10.17, 30.13 | **keep** |
| 3.4 | `grain.js`: listen for `prefers-reduced-motion` changes and cancel for real | 10.17 | **keep** |
| 3.5 | Correct the false claim in the `tokens.css` reduced-motion comment | 10.17 | **keep** |
| 3.6 | Strip the accent from every hover; hover moves up the achromatic ramp, focus keeps the accent | 10.11.1 | **keep** |
| 3.7 | Delete the `translateX(4px)` arrow hover and the dead `transform` transition | 10.11 | **keep** |
| 3.8 | Delete `--fq-ease-out`, orphaned by 3.7 | 10.4 | **keep** |
| 3.9 | One-shot masked heading lift, 420ms, `clip-path` inset, no wrapper and no library | 10.5 | **keep** |
| 3.10 | One-shot 180ms flicker on the hero title | 10.7 | **REVERT** |

### Notes

**3.1 and 3.2 — these were hard-constraint violations that pass one shipped.** The brief
forbids any animation loop faster than 200ms. `grain.js` was running two, on all six pages,
forever:

| Loop | Rate | Status |
|---|---|---|
| `setInterval(1000/12)` cycling three baked tiles | 83ms, 12Hz | deleted outright |
| WAAPI drift, `duration: 500` with `steps(20, end)` | one position jump every 25ms, 40Hz | now 3000ms/`steps(6)` = one move every 500ms |

Verified after the change with `document.getAnimations()` on three pages: exactly one
infinite animation, step interval 500ms, no violation. Dropping to a single baked tile also
removes two 1200×1200 canvases (roughly 75KB of runtime data URL) that existed only to make
a texture nobody can perceive changing, change.

**3.4 and 3.5 — the reduced-motion contract was advertised but not delivered.** `tokens.css`
claimed its global `prefers-reduced-motion` block "kills ... the grain animation". It cannot:
the grain is a WAAPI `element.animate()` animation and CSS `animation-duration` has no effect
on one. The initial check was correct, so a user who loads the page with the preference set
was always fine, but a user who *changes* it mid-session kept the animation. Now there is a
`change` listener that cancels for real, and the comment says what actually happens.
Verified: 0 animations and `will-change: auto` under reduce, on every page.

**3.2 — grain recalibrated and re-measured, not eyeballed.** Opacity also went 0.05 → 0.035,
which is the reference's own formula for this page colour: `opacity × (128 − bg)` =
`0.035 × 124` = 4.34/255. Measured on a guaranteed-flat region: with the grain hidden the
field is `mean 4, sd 0, range 4–4`; with it on, `mean 4.54, sd 1.55, range 3–12`. Nine levels
peak to peak, and the 12 maximum matches the formula's prediction for a full-brightness mark
(`4 + 0.035 × 251 = 12.8`). The texture is present and correctly calibrated.

**3.6 — accent discipline.** Four rules turned things orange on hover. Hover is now a move up
the grey ramp and the accent is reserved for two things: the `:focus-visible` ring, which a
keyboard user must not miss, and the current-page marker.

**3.10 — REVERTED.** Built as specified: one-shot, 180ms, two luminance edges, one element per
page, never looping, absent under reduced motion. Then measured: sampling the hero's computed
opacity fourteen times at 60ms intervals across the animation window returned **1.00 every
time**. A 180ms two-edge dip, firing once, 420ms into the load, immediately after the lift, is
not perceptible. I could not catch it while deliberately looking for it. It bought nothing and
carried a photosensitivity-adjacent pattern, so it is gone.

### Discrepancy found

**The premise that hover in this system is "luminance, never hue" is not what the document
says.** The refine brief asked me to verify it. Section 10.11.1 actually opens "the site's
hover vocabulary is almost entirely COLOUR", and about ten of its fifteen hover rules animate
`color`. The principle survives only in the weaker form "hue never changes" — and even that
has a counterexample inside the evidence cell for the principle itself, which cites a rule
restoring saturation on hover. The recommendation to strip orange still stands, but on the
narrower and better-supported ground that **no hover anywhere in the reference uses the accent
token**, not on a principle the document contradicts.

### Rejected from the mining

- **A count-up to `04` on feesten.html.** The refine brief asks for this as "exactly the
  register". Section 10.12's actual finding is that the reference has no count-up anywhere;
  its numerals are static. Animating a number from 0 to 4 on a page that shows four gigs is
  inventing a behaviour and attributing it to the reference.
- **Blanket `IntersectionObserver` reveals** on gigs, inventory rows and Spotify embeds.
  Content that is already in the document, hidden until scrolled to, for texture.
- **The text-glitch family and the self-alphabet scramble.** Sub-200ms loops that replace
  readable text with noise.
- **Marquees as motion** (10.6) — assessed under components instead.
