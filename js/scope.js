/* ---------------------------------------------------------------------------
   scope.js  -  the hero oscilloscope, home page only

   What the CRT in boot.js is showing once it has powered on: an X-Y scope
   trace. Two detuned oscillators draw a roughly 3:2 Lissajous that precesses
   and reshapes continuously, the way a real scope does when the two tones are
   not in exact ratio. Rationale and rejects: REFINEMENT-LOG.md.

     - nothing loops faster than 200ms; the beam is a smooth curve.
     - WCAG 2.2.2: every mark fades within one circuit (2.8s), so no single
       movement approaches five seconds. Same reasoning as the lattice.
     - prefers-reduced-motion draws one static frame and never runs.
     - pauses off-screen and in a background tab.
     - the accent is the beam head only, never the trail.
   --------------------------------------------------------------------------- */

(function () {
  'use strict';

  // Phosphor life == circuit time, so the whole figure is always on screen,
  // brightest at the head. Shorter and it reads as a comet on an invisible
  // path. Both stay well under the five seconds that would owe a pause.
  // Two independent oscillators, not one parameter with a phase term bolted
  // on: a real X-Y scope draws from two tones, and detuning them off exact
  // ratio is what makes the figure precess and reshape instead of sitting
  // still. The modulation periods are deliberately not harmonically related,
  // so the shape never repeats.
  var TAIL_MS  = 2800;   // phosphor life, and one nominal circuit
  var RATIO    = 1.5;    // 3:2 base relationship
  var DETUNE_A = 0.055, PER_A = 9400;   // ratio wander
  var DETUNE_B = 0.022, PER_B = 3700;
  var BREATH_X = 0.075, PER_BX = 6100;  // amplitude breathing
  var BREATH_Y = 0.055, PER_BY = 4300;
  var SEGMENTS = 260;    // samples per nominal circuit

  // How the trace is painted. Sized against the real page, with the title
  // and the grain on top, not against an empty canvas.
  var BANDS    = 12;     // age bands in the core pass
  var CORE_MIN = 0.22;   // alpha at the tail -- a floor, not a fade to nothing
  var CORE_MAX = 1;      // alpha at the head
  var GLOW_A   = 0.1;
  // Stroke weights scale with the viewport, set in size(). A fixed 3px core
  // and 9px glow read correctly at 1400px and swamped the hero at 390, where
  // the figure already fills proportionally far more of the screen.
  var CORE_W = 3, GLOW_W = 9, HEAD_R = 5;

  // Pointer tuning. An X-Y scope's figure is decided by the two input
  // frequencies and the gain on each axis, so pointing at it and changing
  // the shape is the honest interaction for this instrument: you are
  // turning its knobs, not steering a toy. X retunes the ratio, Y sets the
  // vertical gain. Both are eased toward their resting value when the
  // pointer leaves, so the figure never snaps.
  var TUNE_RATIO = 0.42;   // how far the pointer can pull the ratio
  var TUNE_GAIN  = 0.45;   // how far it can pull the vertical gain
  var TUNE_EASE  = 0.055;  // per-frame approach to the target

  function init() {
    var host = document.getElementById('fq-scope');
    if (!host) return;
    var cv = document.createElement('canvas');
    cv.className = 'fq-scope__layer';
    var cx = cv.getContext('2d');
    if (!cx) return;
    host.appendChild(cv);

    // The accent head gets its own canvas in a sibling host, so the
    // difference blend on the trace never inverts it. See the note on
    // .fq-scope-head in primitives.css.
    var headHost = document.getElementById('fq-scope-head');
    var hv = null, hx = null;
    if (headHost) {
      hv = document.createElement('canvas');
      hv.className = 'fq-scope__head';
      hx = hv.getContext('2d');
      if (hx) { headHost.appendChild(hv); } else { hv = null; }
    }

    var w = 0, h = 0, dpr = 1, rx = 0, ry = 0, ox = 0, oy = 0;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.scale(dpr, dpr);
      if (hx) {
        hv.width = cv.width; hv.height = cv.height;
        hx.setTransform(1, 0, 0, 1, 0, 0);
        hx.scale(dpr, dpr);
        hx.lineCap = 'round'; hx.lineJoin = 'round';
      }
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      // Sized off each axis rather than the short side. Driving both from
      // Math.min meant the figure shrank to whatever the smaller dimension
      // allowed and left a wide screen mostly empty; this fills the host and
      // is allowed to bleed a little past it, which the host clips.
      rx = w * 0.46; ry = h * 0.44;
      ox = w / 2; oy = h / 2;
      // Much bolder than it was. With the difference blend the depth of the
      // contrast is already maximal -- white on a white glyph is black -- so
      // the only lever on how much you notice it is AREA, and a ~3px line
      // crossing 316px letters darkened 1.14% of the title's glyph pixels.
      // Technically inverting, visually nothing.
      CORE_W = Math.max(3.5, Math.min(w / 200, 9));
      GLOW_W = CORE_W * 2.2;
      HEAD_R = Math.max(5, Math.min(w / 190, 8));
    }

    // Pointer tuning, held as -1..1 on each axis with 0 at rest. The handler
    // only stores the target; all the work happens in the frame loop, so a
    // fast pointer cannot outrun the renderer.
    var tgtX = 0, tgtY = 0, curX = 0, curY = 0, pointing = false;

    function onMove(e) {
      if (mq.matches || !visible) return;     // not under reduce, not off-screen
      // Mouse and pen only. On touch a pointermove is usually a scroll, and
      // retuning the figure while someone drags the page is noise, not
      // interaction.
      if (e.pointerType === 'touch') return;
      var b = host.getBoundingClientRect();
      if (!b.width || !b.height) return;
      tgtX = ((e.clientX - b.left) / b.width  - 0.5) * 2;
      tgtY = ((e.clientY - b.top)  / b.height - 0.5) * 2;
      tgtX = Math.max(-1, Math.min(1, tgtX));
      tgtY = Math.max(-1, Math.min(1, tgtY));
      pointing = true;
    }
    function onLeave() { tgtX = 0; tgtY = 0; pointing = false; }

    // Everything slow lives here; the frame loop only advances two phases.
    function ratioAt(t) {
      return RATIO + DETUNE_A * Math.sin(t / PER_A) + DETUNE_B * Math.sin(t / PER_B)
           + curX * TUNE_RATIO;
    }
    function ampAt(t) {
      var gain = 1 + curY * TUNE_GAIN;
      return [rx * (1 + BREATH_X * Math.sin(t / PER_BX)),
              ry * (1 + BREATH_Y * Math.sin(t / PER_BY + 1.1)) * gain];
    }

    // Reduced motion: one closed 3:2 figure at rest amplitude, no detune or
    // breathing, so it reads as composed rather than as a frozen frame.
    function still() {
      cx.clearRect(0, 0, w, h);
      // Weighted to match the animated trace. At the old 0.22 on a 1.25px
      // line this was far fainter than what everyone else sees, so reduced
      // motion got a worse-composed hero, not just a stiller one.
      cx.strokeStyle = 'rgb(240 240 240 / 0.5)';
      cx.lineWidth = CORE_W;
      cx.beginPath();
      for (var i = 0; i <= SEGMENTS; i++) {
        var u = (i / SEGMENTS) * Math.PI * 2;
        var x = ox + rx * Math.sin(RATIO * u * 2 + 0.6);
        var y = oy + ry * Math.sin(u * 2);
        if (i) { cx.lineTo(x, y); } else { cx.moveTo(x, y); }
      }
      cx.closePath();
      cx.stroke();
    }

    var raf = 0, running = false, last = 0;
    var px = 0, py = 0;   // the two oscillator phases, in radians
    var trail = [];       // {x, y, t} - the phosphor, oldest first

    // The slower tone completes the figure in TAIL_MS; a 3:2 needs two of
    // its cycles, which sets the base rate.
    var WY = (Math.PI * 2) / (TAIL_MS / 2);

    function frame(t) {
      var dt = last ? Math.min(t - last, 48) : 16;
      last = t;

      // Approach the pointer's target rather than jumping to it, so the
      // figure retunes the way a dial moves and settles back when you leave.
      curX += (tgtX - curX) * TUNE_EASE;
      curY += (tgtY - curY) * TUNE_EASE;

      var wy = WY;
      var wx = WY * ratioAt(t);
      var amp = ampAt(t);

      // Multiple samples per frame so a slow frame yields a curve, not a chord.
      var span = Math.max(Math.abs(wx), Math.abs(wy)) * dt;
      var steps = Math.max(1, Math.ceil(span / ((Math.PI * 2) / SEGMENTS)));
      for (var i = 1; i <= steps; i++) {
        var f = i / steps;
        trail.push({
          x: ox + amp[0] * Math.sin(px + wx * dt * f),
          y: oy + amp[1] * Math.sin(py + wy * dt * f),
          t: t - dt * (1 - f)
        });
      }
      px += wx * dt;
      py += wy * dt;
      // Bounded so precision never degrades on a long visit.
      if (px > Math.PI * 2) { px %= Math.PI * 2; }
      if (py > Math.PI * 2) { py %= Math.PI * 2; }

      // Redrawn from history each frame rather than fading the canvas in
      // place: a destination-out fade multiplies 8-bit alpha by a constant
      // and stops once it rounds to itself, so the oldest marks never reach
      // zero and the figure bakes a permanent haze in. Measured, that
      // residue sat at alpha 1-3 and never cleared.
      var cut = t - TAIL_MS;
      while (trail.length && trail[0].t < cut) { trail.shift(); }

      cx.clearRect(0, 0, w, h);

      // Drawn in age bands, not segment by segment. Two reasons. It is far
      // cheaper -- 13 strokes a frame instead of one per sample, ~170 -- and
      // the saving pays for a wide soft pass under a bright core, which is
      // what makes a phosphor trace read as light rather than as a hairline.
      //
      // The first version stroked every segment individually at
      // (1-age)^2 * 0.9 on a 1.6px line. Measured on the real page, that put
      // 11,561 pixels at alpha 0-31 against 181 above 224: almost the whole
      // figure was nearly transparent, and next to a 184px title it simply
      // could not be seen. The ramp is linear off a 0.22 floor now, so the
      // oldest part of the trace is still clearly lit.
      var n = trail.length;
      if (n > 1) {
        // Soft wide pass: the glow around the beam.
        cx.lineWidth = GLOW_W;
        cx.strokeStyle = 'rgb(240 240 240 / ' + GLOW_A + ')';
        cx.beginPath();
        cx.moveTo(trail[0].x, trail[0].y);
        for (var g = 1; g < n; g++) { cx.lineTo(trail[g].x, trail[g].y); }
        cx.stroke();

        // Core pass, banded by age so the head still reads brightest.
        var per = Math.max(1, Math.ceil(n / BANDS));
        cx.lineWidth = CORE_W;
        for (var band = 0; band < BANDS; band++) {
          var from = band * per;
          var to = Math.min(n - 1, from + per);
          if (to <= from) break;
          var age = 1 - (from + per / 2) / n;          // 1 oldest, 0 newest
          var a = CORE_MIN + (1 - age) * (CORE_MAX - CORE_MIN);
          cx.strokeStyle = 'rgb(240 240 240 / ' + a.toFixed(3) + ')';
          cx.beginPath();
          cx.moveTo(trail[from].x, trail[from].y);
          for (var k = from + 1; k <= to; k++) { cx.lineTo(trail[k].x, trail[k].y); }
          cx.stroke();
        }
      }

      // The beam head: the one accent in this layer, and now big enough to
      // find. It was 2.3px, which is a speck on a 1400px screen.
      if (hx) { hx.clearRect(0, 0, w, h); }
      if (n && hx) {
        var head = trail[n - 1];
        hx.fillStyle = '#f68712';
        hx.shadowColor = '#f68712';
        hx.shadowBlur = 26;
        hx.beginPath();
        hx.arc(head.x, head.y, HEAD_R, 0, Math.PI * 2);
        hx.fill();
        hx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !w) return;
      running = true; last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      trail.length = 0;
      if (hx) { hx.clearRect(0, 0, w, h); }
    }

    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var visible = true;

    function apply() {
      if (mq.matches) { stop(); cx.clearRect(0, 0, w, h); still(); return; }
      if (visible && !document.hidden) { start(); } else { stop(); }
    }

    size();
    if (mq.addEventListener) { mq.addEventListener('change', function () {
      cx.clearRect(0, 0, w, h); apply();
    }); }
    document.addEventListener('visibilitychange', apply);

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting; apply();
      }, { threshold: 0 }).observe(host);
    }

    // Bound on the window, not the host: .fq-scope is pointer-events:none so
    // it can never receive an event of its own, and listening wider means the
    // whole first screen tunes the figure rather than just the pixels over it.
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    var rt = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(rt);
      rt = window.setTimeout(function () { size(); apply(); }, 200);
    });

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
