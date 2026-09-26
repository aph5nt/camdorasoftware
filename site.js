/* Camdora Software — small, dependency-free enhancements */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* footer year */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* nav border on scroll */
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* reveal on enter */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* hero network: nodes, edges, packets travelling along edges */
  var canvas = document.getElementById('net');
  if (!canvas || reduce) { if (canvas) canvas.remove(); return; }
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, nodes = [], edges = [], packets = [];
  var INK = '14,17,22', ACCENT = '47,91,255';

  function resize() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    nodes = []; edges = []; packets = [];
    var count = Math.max(28, Math.min(70, Math.round(W * H / 22000)));
    for (var i = 0; i < count; i++) {
      var x = W * (0.35 + Math.random() * 0.7);        /* bias to the right */
      nodes.push({
        x: x, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: 1.4 + Math.random() * 2.2,
        hub: Math.random() < 0.12
      });
    }
    for (var a = 0; a < nodes.length; a++) {
      var near = [];
      for (var b = 0; b < nodes.length; b++) {
        if (a === b) continue;
        var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        near.push({ i: b, d: dx * dx + dy * dy });
      }
      near.sort(function (p, q) { return p.d - q.d; });
      var k = nodes[a].hub ? 4 : 2;
      for (var n = 0; n < k && n < near.length; n++) {
        var j = near[n].i;
        if (a < j) edges.push([a, j]); else edges.push([j, a]);
      }
    }
    /* dedupe */
    var seen = {}; edges = edges.filter(function (e) { var key = e[0] + '-' + e[1]; if (seen[key]) return false; seen[key] = 1; return true; });
    for (var p = 0; p < Math.min(14, edges.length); p++) spawn();
  }

  function spawn() {
    var e = edges[Math.floor(Math.random() * edges.length)];
    var flip = Math.random() < 0.5;
    packets.push({ e: e, t: Math.random(), s: 0.0025 + Math.random() * 0.004, flip: flip });
  }

  var last = 0;
  function frame(ts) {
    var dt = Math.min(32, ts - last) / 16.67; last = ts;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx * dt; n.y += n.vy * dt;
      if (n.x < W * 0.3 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    ctx.lineWidth = 1;
    for (var k = 0; k < edges.length; k++) {
      var a = nodes[edges[k][0]], b = nodes[edges[k][1]];
      var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
      var alpha = Math.max(0, 0.22 - d / 900);
      if (alpha <= 0) continue;
      ctx.strokeStyle = 'rgba(' + INK + ',' + alpha.toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    for (var q = 0; q < packets.length; q++) {
      var p = packets[q];
      p.t += p.s * dt;
      if (p.t > 1) { packets.splice(q, 1); q--; spawn(); continue; }
      var s = nodes[p.e[p.flip ? 1 : 0]], t = nodes[p.e[p.flip ? 0 : 1]];
      var x = s.x + (t.x - s.x) * p.t, y = s.y + (t.y - s.y) * p.t;
      var g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, 'rgba(' + ACCENT + ',0.9)'); g.addColorStop(1, 'rgba(' + ACCENT + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    }

    for (var m = 0; m < nodes.length; m++) {
      var o = nodes[m];
      ctx.fillStyle = o.hub ? 'rgba(' + ACCENT + ',0.85)' : 'rgba(' + INK + ',0.55)';
      ctx.beginPath(); ctx.arc(o.x, o.y, o.hub ? o.r + 1.2 : o.r, 0, Math.PI * 2); ctx.fill();
      if (o.hub) {
        ctx.strokeStyle = 'rgba(' + ACCENT + ',0.25)'; ctx.beginPath(); ctx.arc(o.x, o.y, o.r + 6, 0, Math.PI * 2); ctx.stroke();
      }
    }
    if (document.visibilityState === 'visible') requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') requestAnimationFrame(frame); });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  resize();
  requestAnimationFrame(frame);
})();
