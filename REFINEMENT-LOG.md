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

---

## System 4: texture and degradation (chapter 11)

Most of this chapter's grain work landed in system 3, because the same two defects were the
motion chapter's top findings: the tile cycle, the drift rate, the opacity calibration and
the mobile opacity override are all recorded there (3.1–3.5).

| # | Change | Source | Decision |
|---|---|---|---|
| 4.1 | Gig separator from solid to dashed | 11.3.4 | **keep** |
| 4.2 | Delete the `@media (max-width: 479px) { .fq-grain-host { opacity: 0.35 } }` override | 11.1.5, 11.1.8 | **keep** |
| 4.3 | Hover pixelation on the four gig photos | 11.3.1 (requested by the refine brief) | **REVERT** |
| 4.4 | WebGL RGB-shift glitch on the gig photos | 11.5 | **not built** |

### Notes

**4.1.** In this system a dashed rule means "this row continues off-screen". The gig log is a
running record rather than four closed cards, so the separator between articles is now
dashed. One property.

**4.2.** The reference drops grain opacity to 0.2 on small screens to hide DPR haze, which it
gets because it authors the tile in CSS pixels and a 3× phone resamples a crisp 1px line
across three device pixels. `grain.js` bakes at `devicePixelRatio` instead, so the haze never
occurs and the workaround was inherited for a problem the site does not have.

**4.3 — REVERTED, after building it and testing two settings.** Implemented as a 48px-wide
canvas drawn with `imageSmoothingEnabled = false` and scaled back up by CSS, shown on
`pointerenter` and on `focusin` for keyboard parity. It worked. It is still wrong here:

- At **48 blocks** it is strong and genuinely on-language, and it renders the photo
  unreadable. These four photos are the duo's proof of work and the single reason a booker
  is on the page. Rewarding a hover, which is an expression of interest in the photo, by
  destroying the photo is backwards.
- At **150 blocks** it is imperceptible. There is no useful middle at the size these images
  render, so the effect is either hostile or absent.
- It is hover-only, so the phone audience this site is mostly for never sees it.

Reverted in full: script, CSS and the `<script>` tag.

**4.4 — not built, and the reason is not taste.** I tested whether it *can* run in the
delivery environment the brief specifies. From `file://`, `texImage2D` with a local `<img>`
throws **`SecurityError: the image element contains cross-origin data`**. The image taints
the context, so a WebGL effect textured from these photos cannot run at all when the site is
opened by double-clicking, which is a stated requirement. (A 2D canvas is subject to the same
taint, but only for *reads*: `drawImage` succeeds and `getImageData`/`toDataURL` throw, which
is why 4.3 was buildable at all.) Even setting the environment aside, ~4KB of raw WebGL to
degrade four photographs on a page whose job is to show them clearly is not a trade worth
making.

### Discrepancy found

**There is no pixelation in the reference to port.** The refine brief asks for hover
pixelation "(11.3)" as though it were an extraction. Section 11.3.1 states that
`.pixel-image` appears 82 times across the 16 mirrored documents and carries **zero CSS
rules** — the class is inert markup. So 4.3 was an original effect built to the brief's
request in the reference's register, not a port, and it is logged that way.

---

## System 5: components (chapter 9)

| # | Change | Source | Decision |
|---|---|---|---|
| 5.1 | `.fq-cursor` from accent to `--fq-text`; one `--live` accent variant, used once | 9.5 | **keep** |
| 5.2 | Delete `.fq-event { display: flex }` | 9.5 | **keep** |
| 5.3 | Delete `.fq-event__head` and unwrap it in the markup | 9.5 | **keep** |
| 5.4 | Delete `.fq-event__media { margin-block-end }` | 9.5 | **keep** |
| 5.5 | Delete the `[data-priority="3"]` breakpoint rule | 9.8 | **keep** |
| 5.6 | Hero meta and the `over.html` member specs become real `<dl>`s | 9.5, 9.12 | **keep** |
| 5.7 | `aria-hidden` on the decorative 01–04 numerals in `bieden.html` | 9.8 | **keep** |
| 5.8 | CSS-only marquee on the footer wordmark | 9.10, 10.6 | **REVERT** |

### Notes

Every deletion here was verified as dead before removal, not assumed:

- `.fq-cursor` — counted: **9 instances on tip.html**, 1 on index. Nine orange blocks down a
  track list was the largest remaining accent overshoot on the site. The reference's
  equivalent, its date square, is off-white for exactly this reason. Now off-white, with a
  single `--live` accent mark on the home descriptor.
- `.fq-event__head` — parsed all four instances on feesten.html: every one contains exactly
  one child, an `<h3>`. It is a `justify-content: space-between` flexbox with nothing to
  space, inherited from a reference tile that had a date on the right. Funqtion's gigs have
  no dates.
- `.fq-event` — never appears standalone in the markup, only as `class="fq-gig fq-event"`,
  and `.fq-gig` sets `display: grid` from a later stylesheet. The flex declaration never
  applied.
- `[data-priority="3"]` — grepped: the site uses priorities **1 and 2 only**, eight of each.
  The rule matched nothing.
- `.fq-event__media { margin-block-end }` — `.fq-gig` is a grid with its own `gap`, so the
  margin was invisible at desktop and double-counted at mobile (2rem gap + 1.25rem margin).
  Removing it took 80px off feesten.html's rendered height.

**5.6 and 5.7 — semantics the reference never had.** The brief asks for "metadata hanging off
a left hairline as a `<dl>`". The visual construction was already right from pass one; the
markup was spans. The hero meta and the Rol/Stijl specs are now real `<dl>`/`<dt>`/`<dd>`, so
a screen reader announces "Rol: creatieve kracht" as a pair. The 01–04 numerals on bieden are
the opposite case: they are a visual register, not information, so announcing "Speakers 01"
is noise. They are now `aria-hidden`. All six pages re-validated for tag structure afterwards.

**5.8 — REVERTED, after building it and looking at it.** A seamless two-copy CSS marquee, no
JS, pausing on hover and absent under reduced motion. Two reasons it is wrong here, one
aesthetic and one that is a genuine defect in my own implementation:

1. **It truncates the brand.** The screenshot shows the footer reading `EL THE MUSIQ    FEEL
   THE MUSIQ`. For most of the 24-second loop the site's own tagline is cut off mid-word. A
   static wordmark is the footer's sign-off; a moving one is a ticker, and this phrase is too
   important to present half-legible.
2. **The pause mechanism does not work.** WCAG 2.2.2 requires a way to pause movement lasting
   over five seconds. I wrote `:hover` and `:focus-within` pauses — but the track contains
   only `<p>` elements, so nothing inside it can ever receive focus and `:focus-within` can
   never match. That leaves hover as the sole mechanism, which does not exist on touch, where
   most of this audience is. The compliance was illusory.

In the reference the marquee is a band of repeating text used as page texture. Here it would
be the single most important phrase on the site, moving. Removed entirely.

### Rejected from the mining

- **The two-line title reservation** (`min-block-size: 2lh`). Its stated purpose is to keep
  detail stacks sharing a baseline **across a row of tiles**. feesten.html renders gigs as
  stacked two-column blocks, never a row, so there is no baseline to share.
- **`-webkit-line-clamp` and the truncate utilities.** Defences against unbounded CMS strings.
  Four gig titles, hand-written, fixed.
- **The image-card hover reveal, the filter chip, the search field, the results counter and
  the drag carousel.** All scale artefacts: they exist for 43 tiles, 100 archive items and 57
  track rows.

---

## System 6: performance and accessibility (chapters 30, 31)

| # | Change | Source | Decision |
|---|---|---|---|
| 6.1 | New `--fq-text-quiet` `#7a7a7a`; move eight small-text selectors off the 3.90:1 grey | 31.7.2 | **keep** |
| 6.2 | Remove `dialog` from the global `:focus-visible` selector | 31.6.1 | **keep** |
| 6.3 | Remove `border-radius: 2px` from the `:focus-visible` rule | 31.15.3 | **keep** |
| 6.4 | `@media (forced-colors: active)` fallback: real border for the bracket button | 31.15.3 | **keep** |
| 6.5 | `@media (prefers-contrast: more)` escalating every text rung one step | 31.15.2 | **keep** |
| 6.6 | Delete 7 dead classes and 8 orphaned tokens | 30.15 | **keep** |
| 6.7 | Delete `img/logo.png`, referenced by nothing | 30.14 | **keep** |
| 6.8 | Re-encode all six photos: progressive, q78, dimensions untouched | 30.9 | **keep** |

### Notes

**6.1 — the most important fix in the pass, and it was my own bug.** `tokens.css` annotated
`#6c6c6c` as "rules and decoration ONLY, never text" and then used it as `color` on ten
selectors, eight of them real text including the **gig captions, the footer legal line and
the Canva credit**. Measured at **3.90:1** on the page colour: a WCAG AA failure at body
size, shipped while the file claimed otherwise.

The fix is a new rung rather than a flattening, so the hierarchy survives:

| Token | Value | On `#040404` | Role |
|---|---|---:|---|
| `--fq-text-strong` | `#f0f0f0` | 17.99:1 | headings |
| `--fq-text` | `#d9d9d9` | 14.52:1 | body |
| `--fq-text-dim` | `#8d8d8d` | 6.18:1 | metadata, labels |
| `--fq-text-quiet` | `#7a7a7a` | **4.78:1** | numerals, captions, legal — **new** |
| `--fq-text-decorative` | `#6c6c6c` | 3.90:1 | one `aria-hidden` arrow. Never text. |

`#7a7a7a` also clears AA on `#0a0a0a` (4.61:1). One decorative consumer remains and it is an
`aria-hidden` glyph.

**6.2.** `.fq-menu` is a full-viewport `<dialog>`, so including `dialog` in the global focus
selector drew a 2px accent ring around the entire screen when the menu was opened by
keyboard. The reference's rule is "replaced, not removed"; this was one element too wide.

**6.8 — 812KB saved, 39%, for free.** The photos were the site's real payload: 2,070,738
bytes against 112KB of code. Dimensions are untouched at 1400px on the long edge, as the
client prepared them and as 2× DPR needs for a ~700px slot. Only the encoding changed:
progressive, 4:2:0, quality 78. Checked at render size against the original: no visible
artefacts in the laser beams or the dark gradients, which is where this would show first.

| | before | after |
|---|---:|---:|
| photos | 2,070,738 B | 1,258,710 B |
| plus `logo.png` | 28,734 B | deleted |

### Closing verification

- **Contrast:** every text token recomputed from sRGB relative luminance. All clear AA at
  body size. The one sub-4.5 token is confined to a single `aria-hidden` arrow.
- **Render:** six pages × three widths. No broken images, no horizontal overflow, one `h1`
  each, `header`/`nav`/`main`/`footer` on every page, every image with written Dutch alt.
- **Motion:** with no preference, exactly one infinite animation at a 500ms step interval
  plus one 420ms one-shot. Under `prefers-reduced-motion: reduce`, **zero** animations and
  no compositor promotion. Nothing loops faster than 200ms anywhere.
- **Keyboard:** all six pages pass end to end at 390px. First Tab reaches the skip link with
  a visible ring; every one of the site's own focus stops has a ring (0 without); the menu
  opens with Enter, traps focus, and closes on Escape.

### Rejected from the mining

- **Deduplicating the shared chrome into a JS include.** ~3.6KB per page of header, dialog
  and footer. Turning six static pages into six pages that assemble themselves with
  JavaScript, to save bytes on a site already 25% under budget, trades the thing that makes
  it robust for nothing.
- **Replacing the outline focus ring with a corner-bracket ring.** The reference needs it
  because it has twelve rules killing `outline`. This site has none.
- **Preloading the woff2 files.** Correct for a self-hosted origin; this site uses Google
  Fonts, where the CSS must be fetched before the font URLs are even known.
- **`animation-play-state: paused` on the grain under reduced motion.** Inoperative: the
  grain is WAAPI, not CSS. Handled properly in 3.4 instead.
- **Adding `defer` to the scripts.** Both are already the last elements before `</body>`.

---
---

# Revision pass: boot, a living background, a centred hero, a new nav hover

A separate pass with a different brief. Where the refinement pass *removed* motion, this
one adds a deliberate, visible motion system. Both are in this file because the tension
between them is the interesting part, and section 0 of the revise brief asked for it to be
argued rather than quietly resolved.

Baseline at the start of this pass: **112,745 bytes** excluding images.
At the end: **134,398 bytes** (131.2 KB), against a 150 KB budget — 19,202 bytes of
headroom. 28,027 of those bytes (21%) are comments and blank lines; the code alone is
103.9 KB. Gzipped, which is what GitHub Pages actually serves, the whole site is **35.2 KB**.

## The tension with the last pass, and what I am and am not reinstating

The refinement pass reverted motion three times, and those reverts still stand:

- **§3, the 0.03s infinite flicker.** A 33Hz strobe. Not reinstated, not softened, not
  revisited. Nothing in this pass loops faster than 200ms.
- **§3, the marquee.** Reverted because WCAG 2.2.2 requires a pause control for anything
  moving, automatic and longer than five seconds, and a pause control that works on touch
  is a real component, not a hover state. That reasoning is why the scanline prototype
  below was rejected too — it fails on the same criterion.
- **§5, the accent on hover.** Reverted from four rules so the accent stays a marker rather
  than a decoration. The new nav hover is luminance-only, and the accent in the top bar is
  still doing exactly one job: marking the current page.

**One revert I am arguing should be read differently.** §3 concluded that ambient
background motion was not worth its cost. That conclusion was reached about *decorative*
motion with no brief behind it. The client has now asked for the site to look alive, which
changes the cost side of the trade, not the safety side. So the lattice below is new work
built to the §3 safety rules — under 200ms, no single movement over five seconds, dead
under `prefers-reduced-motion` — rather than a quiet reinstatement of anything reverted.
The §3 reasoning is not being overturned; it is being applied.

---

## System 1: the boot sequence (chapter 10.8.1)

**Kept.** A 32×32 power-on dissolve on the home page only.

The reference: 1,024 tiles of `--darkest-hour` #0a0a0a over a #040404 body, each fading
over 4ms, start times scattered randomly across a 500ms window. Not a curtain lifting; a
dither that resolves, like a display settling after power-on.

### Notes

- **Verified the two greys really are six levels apart** by histogram on a real frame: the
  overlay paints exactly `10` and the page is exactly `4`. The reference's claim holds.
- **Canvas, not 1,024 divs, and the choice was measured, not assumed.** Benchmarked
  in-browser: 1,024 DOM nodes with per-tile `transition-delay` cost 12.0ms to build;
  one canvas with a `clearRect` per expiring cell cost 5.2ms to build and 0.3ms for all
  1,024 clears. The reference ships the 1,024 divs as static markup on fifteen pages.
- **The 4ms fade is not reproducible and reproducing it would be dishonest.** At 60fps a
  frame is 16.7ms, so a 4ms tile fade is sub-frame — it cannot render as a fade on any
  display. Clearing the cell when its start time passes is the faithful reading.
- **It never fakes a delay.** The overlay is added by JS over content the browser has
  already painted. With JS off or broken there is simply no overlay and no blank screen.
- **Once per session, not once per navigation**, via `sessionStorage`. Verified over both
  `file://` and `http://`: overlay on first load, absent on `over.html`, absent on the way
  back to `index.html`.
- **Measured:** 681ms from load to removal on a fresh session; cleared in 197ms on a
  keypress; absent entirely under `prefers-reduced-motion`; absent on all five interior
  pages.

### Rejected

- **Running it on all six pages.** Six boots per visit is a tax, not an identity.
- **Shortening it under reduced motion instead of removing it.** The brief is explicit and
  it is the right call: a shortened animation is still an animation.

---

## System 2: the living background — three prototypes, one kept

The brief asked for at least three approaches, built rather than guessed, with the
rejected ones documented. All three were built and measured.

### Rejected: the scanline sweep

A single hairline traversing the viewport top to bottom. The most legible "this is a
display" signal of the three, and the one closest to the reference's CRT vocabulary.

Rejected on WCAG 2.2.2. One traverse is a **single continuous movement lasting ~10s**,
which is automatic, longer than five seconds, and therefore owes the user a pause control.
That is the exact obligation that killed the marquee in §3 of the last pass, and the
reason it was killed — a pause affordance that works honestly on touch is a real component
— has not changed. Speeding the sweep up to duck under five seconds makes it a strobe.

### Rejected: the VU-style signal rail

A vertical level meter in the margin, segments rising and falling. Visually the strongest
of the three by some distance.

Rejected as dishonest. A level meter that is not driven by audio claims to measure
something it is not measuring, on a site whose entire design language is instrumentation —
part numbers, datasheet rows, `FQ-01`. Every other readout on this site is true. A fake
one would undermine them all, and it would do it on a DJ duo's site, where a visitor has
every reason to read a level meter as audio.

### Kept: the idling lattice

The same 32×32 grid as the boot dissolve, left alive at low duty. Three cells light every
280ms to somewhere between #0a0a0a and #141414 and fade out again over 0.9–2.1s, positions
random, brightness on a `sin` curve so there is no hard edge in or out. The display powers
on, then it idles. Boot and idle share a grid deliberately, so they read as one machine
rather than two effects.

### Notes

- **Nothing loops faster than 200ms.** Cells spawn every 280ms; each lives 900–2,100ms.
  The rAF loop paints at 60fps, but that is a paint clock, not a movement rate — measured,
  the worst single-pixel change **between two consecutive frames is 5 of 255 levels**, and
  that worst case is a cell expiring at its `BASE` value of 4, which is the page colour
  and therefore invisible on screen.
- **The longest single movement is one cell's fade, ≤2.1s**, comfortably under the
  five-second threshold, so WCAG 2.2.2 imposes no pause obligation. It is also
  `aria-hidden` ambient texture carrying no information.
- **`prefers-reduced-motion` is enforced in JS, with a live `change` listener.** A CSS
  block cannot stop a rAF loop any more than `animation-duration` can stop a WAAPI
  animation — the trap §3.4 of the last pass documented. Measured under `reduce` on all six
  pages: `document.getAnimations()` returns **0** and the canvas diffs at **0.00%**.
- **Luminance only, inside the grey ramp.** Peak #141414 against a #040404 page. No accent
  anywhere near it, per the brief.
- **Fixed host, canvas-painted, `z-index: -1`, `pointer-events: none`.** Scrolling never
  repaints it and it never intercepts a click.
- **Pauses on `visibilitychange`,** so it costs nothing in a background tab.
- **5,255 bytes.**

### The verification the brief called the hardest requirement

Two real screenshots, three seconds apart, diffed:

| page | pixels differing after 3s | max level delta |
|---|---:|---:|
| `index.html` | 2.64% | 16 |
| `feesten.html` | 2.22% | 13 |
| under `prefers-reduced-motion: reduce` | **0.00%** | 0 |

With the content layers hidden so the background stands alone, 61.83% of pixels differ
over the same interval. An amplified (×16) difference image shows roughly twenty-eight
distinct lattice cells changed between the two frames, over the grain floor. It is not
identical. It has not failed.

---

## System 3: the centred hero (chapters 7, 8.2)

**Kept, variant A.** The logo and the name now sit on the grid's true centre line.

Two variants were built and looked at:

- **A — kept.** Mark and name centred in a 6-column cell starting at column 4; the section
  number stays a left-aligned rail at column 1; the datasheet becomes a full-width bottom
  rail under a hairline. Measured on a 1600px viewport, the title's centre is at exactly
  **800px**. The page's asymmetric instrument furniture is preserved around a symmetric
  centre, which is the point — centring the mark should not centre the whole layout.
- **B — rejected.** Everything centred, including the section number and the datasheet.
  It reads as a title card, not an index page, and it throws away the left rail that every
  other page on the site uses to anchor its section number.

### Notes

- `min-block-size: calc(100svh - 73px)` with `align-content: center`. `svh`, not `vh`, so
  the hero does not jump when a mobile browser's toolbar retracts.
- `clamp(120px, 20vw, 240px)` on the mark, so it scales with the viewport and stops.
- Checked at 390 / 768 / 1600. The datasheet wraps to two rows at 390 without overflow.

---

## System 4: the top-bar hover (chapters 10.11, 8.3)

**Kept.** Mask-and-swap, the brief's recommended option, replacing a colour-only
transition the brief fairly called invisible.

Each of the 36 nav labels is a two-copy column inside a one-line mask. Hover and
`:focus-visible` slide it up by exactly half its height over 160ms, so the label leaves and
its duplicate arrives; the brightness step from `--fq-text-dim` to `--fq-text-strong` is
the base layer underneath and works on its own, so the transform lives inside a
`prefers-reduced-motion: no-preference` block.

### Discrepancy with my own previous comment

I first documented this as "the same idiom as `.fq-menu__label`". That is wrong, and
reading the menu's CSS rather than trusting my note is what caught it: `.fq-menu__mask`
**reveals** a single label rising from `translateY(110%)` to `0`. It never duplicates text.
This is a *swap*, which is a different move with a different cost, and the comment now says
so. The distinction matters because the duplication is where both defects below came from.

### Two defects found before this landed

- **The current-page triangle was on `.fq-topnav__t:first-child::before`,** so it would
  have slid out of the mask along with the first copy on hover. It is on both copies now
  and survives the swap.
- **`overflow: hidden` made every nav link a scroll container** wrapped around a rendered
  duplicate. Find-in-page scrolls to clipped text: forcing it left the mask parked at
  `scrollTop` 11, showing the wrong copy, with no hover to reset it. `overflow: clip`
  masks without creating a scroll box — measured, forced `scrollTop` goes 12 → 0 — and
  `hidden` is kept as the preceding declaration so a browser without `clip` still masks.

### Discrepancy: computed style passed a state that was visibly broken

`clip-path: inset(0)` fixes the scrolling too, and was my first choice. It also clips the
element's own outline and **silently deletes the focus ring**. `getComputedStyle` still
reported `outline: solid 2px rgb(246, 135, 18)` on the focused link with nothing on screen
at all. Only the screenshot caught it. Worth recording as a general point: an assertion
against computed style is not a check that something is visible.

### Rejected: the two-digit index

The brief's second option — `02`, `03` rising in where the label rises out, matching the
menu's numbering. Genuinely tempting: no duplicated text, so none of the costs below, and
it adds the menu's numbering to a bar that lacks it. Built it and looked at it. It removes
the word you are pointing at and leaves a visible hole in the bar, because `03` is a
quarter the width of `FEESTEN` while the link box keeps the label's width. Screenshotted,
compared, rejected.

### Rejected: the drawing hairline

The brief's fourth option. No duplication, no a11y cost, no selection cost — genuinely
defect-free, and it looked fine. Rejected on two grounds: it is the most generic hover on
the web, and a line under the hovered item competes directly with the accent triangle that
marks the current page, which is the one thing in that bar that must stay unambiguous.

### Known cost, accepted

Two real text nodes mean drag-selecting the bar copies each label twice
(`HOME HOME OVER ONS OVER ONS…`) and find-in-page counts two matches per nav word. Neither
is visible and the accessible name is unaffected — the duplicate is `aria-hidden`, and
Chrome's accessibility tree reports `FEESTEN`, once. `user-select: none` on the duplicate
was tried and does not remove it from the selection string in Chrome. A `::after` with
`content: attr(data-label)` does fix selection and find-in-page, but Chrome folds generated
content into the accessible name, which turned it into `FEESTEN FEESTEN` — trading an
invisible cost for a real one. Not worth it.

### Measured

Zero layout shift (46.2×11.0 at the same coordinates before and after), bar 65px both
ways, 160ms, focus ring intact at 2px #f68712, keyboard and pointer identical. At 991px and
below `.fq-topnav` is `display: none`, the menu trigger takes over, no link paints a box,
and there is no horizontal overflow at 390, 768 or 991.

---

## Closing verification

- **Render:** six pages × three widths. No broken images, no horizontal overflow, one `h1`
  each, all four landmarks on every page, every image with written Dutch alt, no JS errors.
- **Motion, no preference:** exactly two animations on the home page — a 420ms one-shot
  lift on the hero title, and the grain at 3,000ms in `steps(6)`, one discrete move every
  500ms. Plus the lattice's rAF loop, whose worst consecutive-frame delta is 5 of 255
  levels. **Nothing loops faster than 200ms anywhere.**
- **Motion, `reduce`:** `document.getAnimations()` returns 0 on all six pages, the lattice
  canvas diffs at 0.00%, and the boot overlay never exists.
- **Keyboard:** all six pages pass end to end. Skip link first, every focus stop has a
  ring, 0 without, the menu opens, traps and closes on Escape.
- **Weight:** 112,745 → 134,398 bytes excluding images, against 150 KB. 35.2 KB gzipped.
- **Dutch copy:** every text node and every piece of attribute copy on all six pages was
  extracted and diffed against the commit this pass started from. Five pages are
  byte-identical. **One string was added, and it is the one thing on this list a reviewer
  should look at:** `01 / Index` on the home page's new hero rail.

  It is not in `CONTENT.md`, so it is flagged rather than buried. The reasoning: all five
  interior pages already carry a `NN / Section` rail — `02 / Over ons`, `03 / Feesten`, and
  so on — and the home page was the only one without. Centring the mark (system 3) created
  the left rail that carries it, and that rail is precisely what makes variant A an index
  page rather than a title card. The string invents no voice: `Index` already appears three
  times on the page as a `.fq-label`, and the numbering is the site's own. If the client
  would rather the home page stayed the exception, deleting the one `<p>` reverts it and
  nothing else moves. No other text node, `alt`, or `aria-label` changed by a character.

### Rejected, general

- **Turning up the grain to satisfy "make it alive".** The brief forbids it and it would be
  the wrong answer anyway: grain is texture, not movement, and cranking it degrades text
  legibility to fake liveliness the lattice provides honestly.
- **Putting the accent in the background.** Explicitly out of bounds, and the whole reason
  the accent still reads as a marker.
- **Minifying to buy back the 21% spent on comments.** It would need a build step, which
  the brief forbids, and the site is 19 KB under budget and 35 KB over the wire.

---

# Follow-up: the boot becomes a CRT power-on

Client note after the revision pass shipped: make the startup look like a CRT
starting up. This replaces system 1 of that pass rather than adding to it.

## What changed, and why it is a different thing from the dissolve

The dissolve was faithful to chapter 10.8.1, and the reference describes it as
reading like "a CRT settling". Settling is what a tube does once its raster is
already open — it is the end of the process. The client asked for the start of
it. So the sequence is now the order the hardware actually powers up in:

| phase | ms | what is on screen |
|---|---|---|
| heater | 0–80 | nothing; the screen is dark |
| strike | 80–210 | the beam lands with no deflection: a point at the centre |
| horizontal ramp | 210–~430 | the point stretches into a bright hairline |
| vertical ramp | 300–600 | the line opens into a full raster; the page is behind it |
| settle | 600–640 | phosphor overshoot decays, scanlines fade |
| removed | 700 | |

Five layers, one WAAPI animation each. The scanline layer is not invented: it
uses the same **5px horizontal pitch as `#grained`** (reference 11.1.3), so the
boot and the permanent texture are one raster at two strengths.

The dither dissolve is in git history and is a one-file revert if it is wanted
back.

### Notes

- **Nothing loops.** All five animations are `iterations: 1`; the shortest is
  300ms. The 200ms floor is not in play because there is no repetition at all.
- **Flash safety, measured rather than asserted.** Mean screen relative
  luminance sampled every 35ms across the whole sequence rises monotonically
  from 0.0010 to a peak of 0.0424 and settles at 0.0298 — a peak-to-trough
  swing of **0.041**, in one rise and one fall over ~560ms. WCAG 2.3.1's
  general flash threshold is a ≥0.1 swing occurring more than three times in a
  second. Clear on magnitude and on frequency, with room to spare on both.
- **The overlay cannot interfere with the page it is covering.** `aria-hidden`,
  zero focusable descendants, `pointer-events: none`. Verified: mid-boot,
  `elementFromPoint` at the centre of the screen returns the hero, a Tab lands
  on the skip link, and a click on a nav link navigates.
- **Measured:** ~800ms from navigation start to a clear page against a 900ms
  budget; skip clears it in 10ms; absent under `prefers-reduced-motion` with
  `document.getAnimations()` at 0; once per session over both `file://` and
  `http://`; never on the five interior pages.
- **Weight:** 134,398 → 136,707 bytes excluding images. 16,893 bytes of
  headroom.

### Discrepancy found by looking, which reasoning would have missed

Under `forced-colors: active` the shutters are repainted in the user's Canvas
colour. On the default Windows high-contrast themes that is white — the same
white the page itself becomes. The sequence stops being a CRT and becomes *the
top and bottom of the page silently missing for half a second*, with the beam
and the scanlines both forced to invisible, so nothing on screen explains why.

Every automated check passed: the animations ran, the timings were right, the
transforms were correct. Only the screenshot showed it. `boot.js` now declines
to run under `forced-colors`, on the same grounds as reduced motion — someone
who has asked the OS to strip decoration to legible colour is not the audience
for a power-on sequence — with a CSS rule as a safety net.

### Rejected

- **Keeping the dither as a final settle phase after the raster opens.** It
  would layer two boot ideas inside a 900ms budget, and under the scanlines and
  bloom at that point the dither is not legible anyway. The CRT should be one
  idea, clearly.
- **Widening the boot to all six pages** so that "first load" is literally true
  for someone arriving on a deep link. Once-per-session gating means it would
  still be one boot per visit, so the cost is not six boots — but it would put
  a 600ms decorative curtain in front of someone who followed a link straight
  to the booking page for information. Theatre belongs on the front door. Home
  page only, unchanged.
- **A hard white flash at the strike.** Authentic to some tubes, and the wrong
  call on a site this dark: it would have dominated the sequence and pushed the
  luminance swing toward the threshold above for no gain. The bloom peaks at
  12% white over a #040404 page instead.

### A note on the test harness, not the site

Two pages failed the keyboard audit during this change and neither loads
`boot.js`. Both embed cross-origin iframes — nine Spotify players on `tip.html`,
a Canva frame on `boeken.html` — and the audit's focus-stop count swung
11/20/27/29 run to run while the menu intermittently reported as not opening.

It was the harness, not the site: the audit tabbed into an embed first, so the
browser's real focus was inside a cross-origin frame, and focusing the trigger
from main-frame script does not reliably bring it back, so the Enter went to
the player. With the page settled the menu opens **6/6**. The harness now runs
the menu test before the tab walk and waits for `readyState === 'complete'`;
five consecutive runs pass on all six pages. Recorded because a flaky check
that gets waved away once is a check that stops being worth running.
