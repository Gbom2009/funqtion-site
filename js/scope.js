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

  function init() {
    var host = document.getElementById('fq-scope');
    if (!host) return;
    var cv = document.createElement('canvas');
    cv.className = 'fq-scope__layer';
    var cx = cv.getContext('2d');
    if (!cx) return;
    host.appendChild(cv);

    var w = 0, h = 0, dpr = 1, rx = 0, ry = 0, ox = 0, oy = 0;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.scale(dpr, dpr);
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      var r = Math.min(w, h) * 0.42;
      rx = r * 1.35; ry = r;
      ox = w / 2; oy = h / 2;
    }

    // Everything slow lives here; the frame loop only advances two phases.
    function ratioAt(t) {
      return RATIO + DETUNE_A * Math.sin(t / PER_A) + DETUNE_B * Math.sin(t / PER_B);
    }
    function ampAt(t) {
      return [rx * (1 + BREATH_X * Math.sin(t / PER_BX)),
              ry * (1 + BREATH_Y * Math.sin(t / PER_BY + 1.1))];
    }

    // Reduced motion: one closed 3:2 figure at rest amplitude, no detune or
    // breathing, so it reads as composed rather than as a frozen frame.
    function still() {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = 'rgb(240 240 240 / 0.22)';
      cx.lineWidth = 1.25;
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
      cx.lineWidth = 1.6;
      for (var j = 1; j < trail.length; j++) {
        var age = (t - trail[j].t) / TAIL_MS;         // 0 newest, 1 oldest
        var a = (1 - age) * (1 - age) * 0.9;          // squared, so the head reads
        if (a <= 0.004) continue;
        cx.strokeStyle = 'rgb(240 240 240 / ' + a.toFixed(3) + ')';
        cx.beginPath();
        cx.moveTo(trail[j - 1].x, trail[j - 1].y);
        cx.lineTo(trail[j].x, trail[j].y);
        cx.stroke();
      }

      // Exactly one bright point, drawn onto a cleared canvas so it cannot
      // smear into the dotted orange line a decaying canvas produced.
      if (trail.length) {
        var head = trail[trail.length - 1];
        cx.fillStyle = '#f68712';
        cx.shadowColor = '#f68712';
        cx.shadowBlur = 12;
        cx.beginPath();
        cx.arc(head.x, head.y, 2.3, 0, Math.PI * 2);
        cx.fill();
        cx.shadowBlur = 0;
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
