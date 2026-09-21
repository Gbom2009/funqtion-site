/* ---------------------------------------------------------------------------
   scope.js  -  the hero oscilloscope, home page only

   What the CRT in boot.js is showing once it has powered on: an X-Y scope
   trace. A beam walks a 3:2 Lissajous figure while the phase drifts, so the
   shape turns slowly. Rationale and rejected alternatives: REFINEMENT-LOG.md.

     - nothing loops faster than 200ms; the beam is a smooth curve.
     - WCAG 2.2.2: every mark fades within one circuit (1.8s), so no single
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
  var CYCLE = 1800;     // ms for the beam to walk the figure once
  var TAIL_MS = 1800;   // how long a phosphor mark stays lit
  var DRIFT = 0.00011;  // radians per ms: a full turn of the figure in ~57s
  var A = 3, B = 2;     // Lissajous ratio
  var SEGMENTS = 240;   // samples per circuit

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

    function point(u, phase) {
      return [ox + rx * Math.sin(A * u + phase), oy + ry * Math.sin(B * u)];
    }

    // One whole figure, no trail: what reduced motion gets.
    function still() {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = 'rgb(240 240 240 / 0.22)';
      cx.lineWidth = 1.25;
      cx.beginPath();
      for (var i = 0; i <= SEGMENTS; i++) {
        var p = point((i / SEGMENTS) * Math.PI * 2, 0.6);
        if (i) { cx.lineTo(p[0], p[1]); } else { cx.moveTo(p[0], p[1]); }
      }
      cx.stroke();
    }

    var raf = 0, running = false, last = 0, u = 0, phase = 0;
    var trail = [];       // {x, y, t} - the phosphor, oldest first

    function frame(t) {
      var dt = last ? Math.min(t - last, 48) : 16;
      last = t;

      phase += DRIFT * dt;
      var from = u;
      u += (dt / CYCLE) * Math.PI * 2;

      // Sample the arc the beam covered this frame. More than one sample per
      // frame so a slow frame still yields a curve rather than a chord.
      var steps = Math.max(1, Math.ceil((u - from) / (Math.PI * 2 / SEGMENTS)));
      for (var i = 1; i <= steps; i++) {
        var p = point(from + (u - from) * (i / steps), phase);
        trail.push({ x: p[0], y: p[1], t: t - dt * (1 - i / steps) });
      }

      // Redrawn from history each frame rather than fading the canvas in
      // place: a destination-out fade multiplies 8-bit alpha by a constant
      // and stops once it rounds to itself, so the oldest marks never reach
      // zero and the figure bakes a permanent haze in as the phase drifts.
      // Measured, that residue sat at alpha 1-3 and never cleared.
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

      if (u > Math.PI * 2) { u -= Math.PI * 2; from -= Math.PI * 2; }
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
