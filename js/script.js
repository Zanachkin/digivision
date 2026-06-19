/* ═════════ HERO: канвас-движок (дерево слияний → хаб) ═════════ */
(() => {
  const root = document.documentElement, heroSec = document.getElementById('hero');
  const cv = document.getElementById('net'), ctx = cv.getContext('2d');
  const term = document.getElementById('term'), title = document.getElementById('title');
  const heroContent = document.getElementById('heroContent');
  const magnetEls = [document.querySelector('.hero .cta')];
  let curMagnet = null;
  const ACC = '#ED2024';
  let W, H, DPR, mobile = false, rings = [], traces = [], primary = [], pulses = [];
  let introStart = 0, INTRO = 1700;
  let portRing = null, phA = 0, ripples = [], orbiters = [];
  let regenning = false, regenT0 = 0; const REGEN = 1500;   // регенерация трасс по клику (хаб остаётся)
  const photo = new Image(); photo.src = 'img/DSC04498-a.jpg';
  const easeOut = v => 1 - Math.pow(1 - v, 3);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function spawnOrbiter(ang){ orbiters.push({ ang, kr: 1.02 + Math.random() * 0.30, sp: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 1.1), col: Math.random() < 0.6 ? '#ED2024' : '#ffffff', size: 1.6 + Math.random() * 1.5, life: 1 }); }
  let BOOT = 1900, H1_AT = 820, timers = [];   // H1_AT — H1 проявляется рано, сразу после прелоадера (терминал ещё бежит)
  const mouse = { x: -9999, y: -9999, on: false };
  const rand = (a, b) => a + Math.random() * (b - a), sign = n => n < 0 ? -1 : 1, clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function route(a, b){ const dx = b.x - a.x, dy = b.y - a.y, adx = Math.abs(dx), ady = Math.abs(dy); const c = adx > ady ? { x: a.x + sign(dx) * (adx - ady), y: a.y } : { x: a.x, y: a.y + sign(dy) * (ady - adx) }; const p = [a]; if (c.x !== a.x || c.y !== a.y) p.push(c); p.push(b); return p; }
  function segify(pts){ const segs = []; let total = 0; for (let i = 0; i < pts.length - 1; i++){ const A = pts[i], B = pts[i + 1], len = Math.hypot(B.x - A.x, B.y - A.y); segs.push({ a: A, b: B, len }); total += len; } return { segs, total }; }
  function makeTrace(feed, ring){ const pts = route(feed, { x: ring.x, y: ring.y }); const b = pts[pts.length - 1], a = pts[pts.length - 2]; const L = Math.hypot(b.x - a.x, b.y - a.y), k = L > ring.r ? (L - ring.r) / L : 0; pts[pts.length - 1] = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; const s = segify(pts); return { pts, segs: s.segs, total: s.total }; }
  function strokeFull(tr){ ctx.beginPath(); ctx.moveTo(tr.pts[0].x, tr.pts[0].y); for (let i = 1; i < tr.pts.length; i++) ctx.lineTo(tr.pts[i].x, tr.pts[i].y); ctx.stroke(); }
  function strokeUpTo(tr, d){ ctx.beginPath(); ctx.moveTo(tr.pts[0].x, tr.pts[0].y); let r = d; for (const s of tr.segs){ if (r >= s.len){ ctx.lineTo(s.b.x, s.b.y); r -= s.len; } else { const t = r / s.len; ctx.lineTo(s.a.x + (s.b.x - s.a.x) * t, s.a.y + (s.b.y - s.a.y) * t); break; } } ctx.stroke(); }
  function pointAt(tr, d){ for (const s of tr.segs){ if (d <= s.len){ const t = d / s.len; return { x: s.a.x + (s.b.x - s.a.x) * t, y: s.a.y + (s.b.y - s.a.y) * t }; } d -= s.len; } const l = tr.pts[tr.pts.length - 1]; return { x: l.x, y: l.y }; }
  function palette(){ return root.classList.contains('theme-light') ? { bg: 'rgba(0,0,0,0.18)', bold: 'rgba(0,0,0,0.84)', ring: '#0c0c0d', pulse: '#0c0c0d', innerbg: '#f1f1ee' } : { bg: 'rgba(255,255,255,0.14)', bold: 'rgba(255,255,255,0.82)', ring: '#f4f4f5', pulse: '#ffffff', innerbg: '#0a0a0b' }; }

  let unit = 10;
  function compose(){
    rings = []; traces = []; primary = []; pulses = []; portRing = null; phA = 0;
    unit = Math.min(W, H) / 100; const u = unit;
    const hub = mobile
      ? { x: W * 0.50, y: H * 0.72, r: u * 3.0, r0: u * 3.0, r1: clamp(u * 40, 160, 240), primary: true, porthole: true, glow: 0, red: false, delay: 0.3 }   // на мобильном — по центру, НИЖЕ заголовка и заметно крупнее
      : { x: W * 0.70, y: H * 0.45, r: u * 3.0, r0: u * 3.0, r1: clamp(u * 28, 220, 440), primary: true, porthole: true, glow: 0, red: false, delay: 0.3 };   // иллюминатор-хаб крупнее (было u*21/170..320)
    rings.push(hub); primary.push(hub); portRing = hub; ripples = [];
    const RE = hub.x + hub.r0, R0 = hub.r0, PAD = u * 1.1;
    const joint = (jx, jy, dim) => { rings.push({ x: jx, y: jy, r: 2.2, joint: true, dim: !!dim, glow: 0, red: false, delay: rand(0.2, 0.5), primary: false }); };
    const pushPath = (pts, bold, red) => { const s = segify(pts); traces.push({ pts, segs: s.segs, total: s.total, ring: hub, bold, delay: rand(0.05, 0.5), red: !!red }); };

    function growR(path, cx, cy, y0, y1, depth, bold){
      if (depth <= 0 || (y1 - y0) < u * 3 || cx > W - u * 6 || Math.random() < 0.05){ pushPath([...path, { x: W + 30, y: cy }], bold, bold && Math.random() < 0.05); return; }
      const sx = cx + u * rand(3, 9), mdx = (W - u * 6) - sx;
      if (mdx < u * 2){ pushPath([...path, { x: W + 30, y: cy }], bold, false); return; }
      const trunk = [...path, { x: sx, y: cy }]; joint(sx, cy, !bold);
      const cyU = rand(Math.max(y0 + PAD, cy - mdx), cy - PAD);
      const cyD = rand(cy + PAD, Math.min(y1 - PAD, cy + mdx));
      growR([...trunk, { x: sx + (cy - cyU), y: cyU }], sx + (cy - cyU), cyU, y0, cy, depth - 1, bold);
      growR([...trunk, { x: sx + (cyD - cy), y: cyD }], sx + (cyD - cy), cyD, cy, y1, depth - 1, bold);
    }
    function growB(path, cx, cy, x0, x1, depth, bold){
      if (depth <= 0 || (x1 - x0) < u * 3 || cy > H - u * 6 || Math.random() < 0.05){ pushPath([...path, { x: cx, y: H + 30 }], bold, false); return; }
      const sy = cy + u * rand(3, 8), mdy = (H - u * 6) - sy;
      if (mdy < u * 2){ pushPath([...path, { x: cx, y: H + 30 }], bold, false); return; }
      const trunk = [...path, { x: cx, y: sy }]; joint(cx, sy, !bold);
      const cxL = rand(Math.max(x0 + PAD, cx - mdy), cx - PAD);
      const cxR = rand(cx + PAD, Math.min(x1 - PAD, cx + mdy));
      growB([...trunk, { x: cxL, y: sy + (cx - cxL) }], cxL, sy + (cx - cxL), x0, cx, depth - 1, bold);
      growB([...trunk, { x: cxR, y: sy + (cxR - cx) }], cxR, sy + (cxR - cx), cx, x1, depth - 1, bold);
    }
    const gapY = R0 * 0.7;
    const rootR = (y0, y1, depth, bold) => {
      const top = y1 <= hub.y, ey = top ? hub.y - gapY : hub.y + gapY, dy = ey - hub.y;
      const ex = hub.x + Math.sqrt(Math.max(0, R0 * R0 - dy * dy));
      const tgt = rand(y0 + PAD, y1 - PAD), gap = u * rand(3, 8), dd = Math.abs(tgt - ey);
      growR([{ x: ex, y: ey }, { x: ex + gap, y: ey }, { x: ex + gap + dd, y: tgt }], ex + gap + dd, tgt, y0, y1, depth, bold);
    };
    const rootB = (x0, x1, depth, bold) => {
      const ex = clamp((x0 + x1) / 2, hub.x - R0 * 0.7, hub.x - 1), dx = ex - hub.x;
      const ey = hub.y + Math.sqrt(Math.max(0, R0 * R0 - dx * dx));
      const tgt = rand(x0 + PAD, x1 - PAD), gap = u * rand(3, 8), dd = Math.abs(tgt - ex);
      growB([{ x: ex, y: ey }, { x: ex, y: ey + gap }, { x: tgt, y: ey + gap + dd }], tgt, ey + gap + dd, x0, x1, depth, bold);
    };

    const safeTop = H * 0.17, grayTop = H * 0.09, botR = H * 0.86;
    rootR(grayTop, hub.y - gapY, 5, false);
    rootR(hub.y + gapY, botR, 5, false);
    rootB(hub.x - u * 17, hub.x - u * 3, 3, false);
    for (let i = 0, n = 2 + (Math.random() < 0.5 ? 1 : 0); i < n; i++){ const yy = hub.y + rand(-1.4, 1.4) * u, ee = hub.x + Math.sqrt(Math.max(0, R0 * R0 - (yy - hub.y) ** 2)); pushPath([{ x: W + 30, y: yy }, { x: ee, y: yy }], true, false); }
    rootR(safeTop, hub.y - gapY, 7, true);
    rootR(hub.y + gapY, botR, 7, true);
    rootB(hub.x - u * 18, hub.x - u * 1, 4, true);

    const dimPin = (xs, yy, ln) => { const ex2 = xs - ln, s = segify([{ x: xs, y: yy }, { x: ex2, y: yy }]); traces.push({ pts: [{ x: xs, y: yy }, { x: ex2, y: yy }], segs: s.segs, total: s.total, ring: { x: ex2, y: yy }, bold: false, delay: rand(0.2, 0.65), red: false }); rings.push({ x: ex2, y: yy, r: rand(3.5, 5.5), dim: true, glow: 0, red: false, delay: rand(0.25, 0.65), primary: false }); };
    for (let i = 0, n = 6 + (Math.random() * 5 | 0); i < n; i++) dimPin(W * rand(0.42, 0.97), H * rand(0.03, 0.13), u * rand(2, 7));
    for (let i = 0, n = 5 + (Math.random() * 4 | 0); i < n; i++){ const bl = Math.random() < 0.6, yy = bl ? H * rand(0.60, 0.94) : H * rand(0.14, 0.42); const xs = W * rand(0.04, 0.27), ex2 = xs + u * rand(2, 6), s = segify([{ x: xs, y: yy }, { x: ex2, y: yy }]); traces.push({ pts: [{ x: xs, y: yy }, { x: ex2, y: yy }], segs: s.segs, total: s.total, ring: { x: ex2, y: yy }, bold: false, delay: rand(0.3, 0.7), red: Math.random() < 0.12 }); rings.push({ x: ex2, y: yy, r: rand(3.5, 5.5), dim: true, glow: 0, red: false, delay: rand(0.35, 0.7), primary: false }); }
    for (let i = 0; i < 22; i++) spawnPulse();
  }

  function spawnPulse(tr){ const bolds = traces.filter(t => t.bold); tr = tr || (Math.random() < 0.55 ? bolds[(Math.random() * bolds.length) | 0] : traces[(Math.random() * traces.length) | 0]); if (tr) pulses.push({ tr, d: 0, sp: rand(2.2, 4.2), red: Math.random() < 0.4 }); }
  function nearestPrimary(x, y){ let b = null, bd = 1e9; for (const n of primary){ const d = (n.x - x) ** 2 + (n.y - y) ** 2; if (d < bd){ bd = d; b = n; } } return { n: b, d: Math.sqrt(bd) }; }

  function frame(now){
    if (!introStart) introStart = now;
    const t = Math.min(1, (now - introStart) / INTRO), C = palette();
    // прогресс отрисовки трасс/колец: при регенерации идёт по своему таймеру (из центра), хаб остаётся на t
    let prog = t;
    if (regenning){ if (!regenT0) regenT0 = now; prog = Math.min(1, (now - regenT0) / REGEN); if (prog >= 1){ regenning = false; regenT0 = 0; } }
    ctx.clearRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = 1;
    for (const tr of traces){ const f = clamp((prog - tr.delay) / 0.2, 0, 1); if (f <= 0) continue; ctx.strokeStyle = tr.red ? ACC : (tr.bold ? C.bold : C.bg); ctx.lineWidth = tr.red ? 2.4 : (tr.bold ? 2.7 : 1.5); if (f < 1){ if (tr.bold){ ctx.shadowColor = C.bold; ctx.shadowBlur = 8; } strokeUpTo(tr, tr.total * f); ctx.shadowBlur = 0; } else strokeFull(tr); }
    if (portRing){ const over = mobile || (mouse.on && (mouse.x - portRing.x) ** 2 + (mouse.y - portRing.y) ** 2 < (portRing.r + 16) ** 2); phA += ((over ? 1 : 0) - phA) * 0.07; portRing.r = portRing.r0 + (portRing.r1 - portRing.r0) * easeOut(phA); }   // на мобильном хаб раскрыт всегда (нет hover)
    for (const n of rings){
      if (n.porthole) continue;
      if (n.joint){ const apj = clamp((prog - n.delay - 0.05) / 0.2, 0, 1); n.glow *= 0.92; const aj = Math.max(apj, n.glow); if (aj <= 0.02) continue; ctx.globalAlpha = n.dim ? aj * 0.4 : aj; ctx.beginPath(); ctx.arc(n.x, n.y, (n.dim ? 1.8 : 2.4) + n.glow * 2, 0, 6.2832); ctx.fillStyle = n.dim ? C.ring : C.bold; ctx.fill(); if (n.glow > 0.05){ ctx.beginPath(); ctx.arc(n.x, n.y, 4 + n.glow * 7, 0, 6.2832); ctx.strokeStyle = ACC; ctx.lineWidth = 1.4; ctx.globalAlpha = n.glow; ctx.stroke(); } ctx.globalAlpha = 1; continue; }
      const ap = clamp((prog - n.delay - 0.05) / 0.2, 0, 1); n.glow *= 0.92; const a = Math.max(ap, n.glow); if (a <= 0.02) continue;
      const lw = n.primary ? 2.6 : (n.dim ? 1.3 : 1.6);
      ctx.globalAlpha = a * (n.dim ? 0.4 : 1);
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.glow * 4, 0, 6.2832); ctx.lineWidth = lw; ctx.strokeStyle = n.red ? ACC : C.ring; ctx.stroke();
      ctx.fillStyle = C.innerbg; ctx.beginPath(); ctx.arc(n.x, n.y, Math.max(0, n.r - lw), 0, 6.2832); ctx.fill();
      if (n.red){ ctx.beginPath(); ctx.arc(n.x, n.y, n.primary ? 2.6 : 1.7, 0, 6.2832); ctx.fillStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0; }
      ctx.globalAlpha = 1;
      if (n.glow > 0.05){ ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4 + n.glow * 9, 0, 6.2832); ctx.strokeStyle = ACC; ctx.lineWidth = 1.5; ctx.globalAlpha = n.glow; ctx.stroke(); ctx.globalAlpha = 1; }
    }
    drawHub(now, t, C);
    if (t >= 1){
      if (Math.random() < 0.2) spawnPulse();
      for (let i = pulses.length - 1; i >= 0; i--){
        const p = pulses[i]; p.d += p.sp; const pt = pointAt(p.tr, p.d), col = p.red ? ACC : C.pulse, back = pointAt(p.tr, Math.max(0, p.d - 24));
        const g = ctx.createLinearGradient(back.x, back.y, pt.x, pt.y); g.addColorStop(0, 'rgba(128,128,128,0)'); g.addColorStop(1, col);
        ctx.strokeStyle = g; ctx.lineWidth = p.tr.bold ? 2.6 : 1.8; ctx.beginPath(); ctx.moveTo(back.x, back.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
        ctx.beginPath(); ctx.arc(pt.x, pt.y, p.tr.bold ? 2.8 : 2, 0, 6.2832); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
        if (p.d >= p.tr.total){ if (p.tr.ring.porthole){ if (phA > 0.4){ const ep = p.tr.pts[p.tr.pts.length - 1]; spawnOrbiter(Math.atan2(ep.y - p.tr.ring.y, ep.x - p.tr.ring.x)); } else ripples.push({ r: p.tr.ring.r, a: 0.45 }); } else p.tr.ring.glow = 1; pulses.splice(i, 1); }
      }
      if (mouse.on){
        const { n, d } = nearestPrimary(mouse.x, mouse.y); let tgt = null;
        if (n && d < 460 && !(n.porthole && d < n.r + 12)) tgt = { x: n.x, y: n.y, r: n.r, node: n, dist: d };
        if (heroContent.classList.contains('show')){ const rc = title.getBoundingClientRect(); const hx = clamp(mouse.x, rc.left, rc.right), hy = clamp(mouse.y, rc.top, rc.bottom); const inside = mouse.x > rc.left && mouse.x < rc.right && mouse.y > rc.top && mouse.y < rc.bottom; const hd = inside ? 1e9 : Math.hypot(mouse.x - hx, mouse.y - hy); if (hd < 460 && (!tgt || hd < tgt.dist)) tgt = { x: hx, y: hy, r: 7, h1: true, dist: hd }; }
        for (const el of magnetEls){ if (!el) continue; const rc = el.getBoundingClientRect(); if (!rc.width) continue; const ux = clamp(mouse.x, rc.left, rc.right), uy = clamp(mouse.y, rc.top, rc.bottom); const ins = mouse.x > rc.left && mouse.x < rc.right && mouse.y > rc.top && mouse.y < rc.bottom; const ud = ins ? -60 : Math.hypot(mouse.x - ux, mouse.y - uy); if (ud < 130 && (!tgt || ud < tgt.dist)) tgt = { x: ux, y: uy, r: 6, ui: true, el, dist: ud }; }
        const mEl = tgt && tgt.ui ? tgt.el : null; if (mEl !== curMagnet){ if (curMagnet) curMagnet.classList.remove('magnet'); curMagnet = mEl; if (curMagnet) curMagnet.classList.add('magnet'); }
        if (tgt){ if (tgt.node) tgt.node.glow = Math.max(tgt.node.glow, 0.7); const lt = makeTrace({ x: mouse.x, y: mouse.y }, tgt); ctx.strokeStyle = ACC; ctx.lineWidth = 2; ctx.shadowColor = ACC; ctx.shadowBlur = 10; strokeFull(lt); ctx.shadowBlur = 0; if (tgt.h1 || tgt.ui){ ctx.beginPath(); ctx.arc(tgt.x, tgt.y, 7, 0, 6.2832); ctx.fillStyle = C.innerbg; ctx.fill(); ctx.strokeStyle = ACC; ctx.lineWidth = 2.4; ctx.stroke(); } ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 5, 0, 6.2832); ctx.strokeStyle = ACC; ctx.lineWidth = 2; ctx.stroke(); }
      } else if (curMagnet){ curMagnet.classList.remove('magnet'); curMagnet = null; }
    }
    requestAnimationFrame(frame);
  }

  function drawHub(now, t, C){
    const n = portRing; if (!n) return;
    const aIn = clamp((t - n.delay - 0.05) / 0.25, 0, 1); if (aIn <= 0.01) return;
    const e = easeOut(phA), R = n.r, time = now / 1000, puls = 0.5 + 0.5 * Math.sin(time * 2.4);
    for (let i = ripples.length - 1; i >= 0; i--){ const rp = ripples[i]; rp.r += unit * 0.16; rp.a *= 0.955; if (rp.a < 0.02){ ripples.splice(i, 1); continue; } ctx.beginPath(); ctx.arc(n.x, n.y, rp.r, 0, 6.2832); ctx.strokeStyle = ACC; ctx.lineWidth = 1.6; ctx.globalAlpha = rp.a * aIn; ctx.stroke(); }
    ctx.globalAlpha = aIn;
    ctx.fillStyle = C.innerbg; ctx.beginPath(); ctx.arc(n.x, n.y, R, 0, 6.2832); ctx.fill();
    if (e > 0.03 && photo.complete && photo.naturalWidth){
      const pr = R * 0.95; ctx.save(); ctx.beginPath(); ctx.arc(n.x, n.y, pr, 0, 6.2832); ctx.clip();
      ctx.globalAlpha = aIn * Math.min(1, e * 1.4); ctx.filter = 'grayscale(1)';
      const d2 = pr * 2, sc = Math.max(d2 / photo.naturalWidth, d2 / photo.naturalHeight) * (1.12 - 0.12 * e);
      const pw = photo.naturalWidth * sc, ph = photo.naturalHeight * sc, dx0 = n.x - pw / 2, dy0 = n.y - ph / 2;
      ctx.drawImage(photo, dx0, dy0, pw, ph);
      ctx.filter = 'none';
      // фирменный красно-голубой глитч на фото иллюминатора (заменил бегавшие частицы): смещённые полосы фото + красный/голубой канал
      if (!REDUCED){ const gp = (now % 2600) / 2600; if (gp < 0.12){ const inten = 1 - gp / 0.12, bands = 2 + (Math.random() * 3 | 0); for (let i = 0; i < bands; i++){ const by = n.y - pr + Math.random() * pr * 2, bh = 3 + Math.random() * pr * 0.2, sh = (Math.random() * 2 - 1) * pr * 0.14 * inten, col = Math.random() < 0.62 ? ACC : '#4a7d63'; ctx.save(); ctx.beginPath(); ctx.rect(n.x - pr, by, pr * 2, bh); ctx.clip(); ctx.globalAlpha = aIn; ctx.filter = 'grayscale(1)'; ctx.drawImage(photo, dx0 + sh, dy0, pw, ph); ctx.filter = 'none'; ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = aIn * 0.5 * inten; ctx.fillStyle = col; ctx.fillRect(n.x - pr, by, pr * 2, bh); ctx.restore(); } } }
      const sw = time * 0.6; ctx.globalAlpha = aIn * e * 0.15; ctx.strokeStyle = ACC; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n.x + Math.cos(sw) * pr, n.y + Math.sin(sw) * pr); ctx.stroke();
      ctx.globalAlpha = aIn * e * 0.6; ctx.beginPath(); ctx.arc(n.x + Math.cos(sw) * pr * 0.94, n.y + Math.sin(sw) * pr * 0.94, 2, 0, 6.2832); ctx.fillStyle = ACC; ctx.fill();
      ctx.restore(); ctx.globalAlpha = aIn;
      ctx.beginPath(); ctx.arc(n.x, n.y, pr, 0, 6.2832); ctx.strokeStyle = C.ring; ctx.lineWidth = 1.2; ctx.globalAlpha = aIn * 0.5 * e; ctx.stroke(); ctx.globalAlpha = aIn;
    }
    ctx.beginPath(); ctx.arc(n.x, n.y, R, 0, 6.2832); ctx.strokeStyle = C.ring; ctx.lineWidth = 2.6 + 1.4 * e; ctx.stroke();
    if (e < 0.97){ ctx.globalAlpha = aIn * (1 - e); ctx.beginPath(); ctx.arc(n.x, n.y, n.r0 * 0.45 * (1 + 0.22 * puls), 0, 6.2832); ctx.fillStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 8 + 8 * puls; ctx.fill(); ctx.shadowBlur = 0; ctx.beginPath(); ctx.arc(n.x, n.y, R + 3 + 3.5 * puls, 0, 6.2832); ctx.strokeStyle = ACC; ctx.lineWidth = 1.4; ctx.globalAlpha = aIn * (1 - e) * (0.14 + 0.16 * puls); ctx.stroke(); ctx.globalAlpha = aIn; }
    if (e > 0.02){
      const gA = aIn * e, rot = time * 0.18; ctx.lineWidth = 1.4;
      for (let i = 0; i < 64; i++){ const a2 = rot + i / 64 * 6.2832, long = i % 8 === 0; const r1 = R * 1.03, r2 = R * (long ? 1.13 : 1.08); ctx.beginPath(); ctx.moveTo(n.x + Math.cos(a2) * r1, n.y + Math.sin(a2) * r1); ctx.lineTo(n.x + Math.cos(a2) * r2, n.y + Math.sin(a2) * r2); ctx.strokeStyle = long ? ACC : C.ring; ctx.globalAlpha = gA * (long ? 0.9 : 0.45); ctx.stroke(); }
      const segR = R * 1.18, segRot = -time * 0.42; ctx.lineWidth = 2.6; ctx.strokeStyle = ACC; ctx.globalAlpha = gA * 0.85;
      for (let i = 0; i < 3; i++){ const a0 = segRot + i * 2.0944; ctx.beginPath(); ctx.arc(n.x, n.y, segR, a0, a0 + 1.1); ctx.stroke(); }
      ctx.setLineDash([3, 9]); ctx.lineDashOffset = -now * 0.02; ctx.beginPath(); ctx.arc(n.x, n.y, R * 1.26, 0, 6.2832); ctx.strokeStyle = C.ring; ctx.lineWidth = 1.3; ctx.globalAlpha = gA * 0.5; ctx.stroke(); ctx.setLineDash([]);
      const sigR = R * 1.26;
      for (let i = 0; i < 3; i++){ const head = time * (0.9 + i * 0.14) + i * 2.0944, col = i === 1 ? '#ffffff' : ACC; for (let k = 10; k >= 1; k--){ ctx.beginPath(); ctx.arc(n.x, n.y, sigR, head - k * 0.055, head - (k - 1) * 0.055); ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.globalAlpha = gA * (1 - k / 11) * 0.9; ctx.stroke(); } ctx.beginPath(); ctx.arc(n.x + Math.cos(head) * sigR, n.y + Math.sin(head) * sigR, 3, 0, 6.2832); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.globalAlpha = gA; ctx.fill(); ctx.shadowBlur = 0; }
      if (phA > 0.4 && orbiters.length < 16 && Math.random() < 0.1) spawnOrbiter(Math.random() * 6.2832);
      for (let i = orbiters.length - 1; i >= 0; i--){ const o = orbiters[i]; o.ang += o.sp * 0.016; if (phA < 0.4) o.life *= 0.88; if (o.life < 0.03){ orbiters.splice(i, 1); continue; } const orr = R * o.kr, hx2 = n.x + Math.cos(o.ang) * orr, hy2 = n.y + Math.sin(o.ang) * orr; const tail = 0.06 + o.size * 0.03, dir = o.sp > 0 ? -1 : 1; ctx.beginPath(); ctx.arc(n.x, n.y, orr, o.ang + dir * tail, o.ang, o.sp < 0); ctx.strokeStyle = o.col; ctx.lineWidth = o.size * 0.8; ctx.globalAlpha = gA * o.life * 0.5; ctx.stroke(); ctx.beginPath(); ctx.arc(hx2, hy2, o.size, 0, 6.2832); ctx.fillStyle = o.col; ctx.shadowColor = o.col; ctx.shadowBlur = 10; ctx.globalAlpha = gA * o.life; ctx.fill(); ctx.shadowBlur = 0; }
      const dq = R * 1.38 * 0.7071, L = Math.max(10, R * 0.09);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]){ const cxx = n.x + sx * dq, cyy = n.y + sy * dq; ctx.beginPath(); ctx.moveTo(cxx - sx * L, cyy); ctx.lineTo(cxx, cyy); ctx.lineTo(cxx, cyy - sy * L); ctx.strokeStyle = C.ring; ctx.lineWidth = 1.6; ctx.globalAlpha = gA * 0.8; ctx.stroke(); }
      ctx.font = '500 11px Consolas, "SF Mono", monospace'; const blink = Math.sin(time * 3.4) > 0; const tx = n.x - R * 1.05, ty = n.y - R * 1.32;
      ctx.fillStyle = C.ring; ctx.globalAlpha = gA * 0.85; ctx.fillText('DV·SCOPE // STUDIO CAM', tx, ty);
      const scanDeg = Math.round(((time * 0.6) % 6.2832) * 57.2958); ctx.fillText('SCAN ' + String(scanDeg).padStart(3, '0') + '°', tx, ty + 15);
      if (blink){ ctx.fillStyle = ACC; ctx.globalAlpha = gA; ctx.beginPath(); ctx.arc(n.x + R * 0.82, ty - 4, 3.5, 0, 6.2832); ctx.fill(); ctx.fillText('REC', n.x + R * 0.89, ty); }
      const by = n.y + R * 1.40; ctx.fillStyle = C.ring; ctx.globalAlpha = gA * 0.85; ctx.fillText('INPUT 01 · 48kHz / 24bit', tx, by);
      ctx.fillStyle = ACC; ctx.globalAlpha = gA; ctx.fillText('GAIN +' + (3.2 + Math.sin(time * 1.7) * 1.4).toFixed(1) + ' dB', tx, by + 15);
    }
    ctx.globalAlpha = 1;
  }

  function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
  function type(el, text, speed, cb){ let i = 0; (function step(){ el.textContent = text.slice(0, i); if (i++ <= text.length) timers.push(setTimeout(step, speed)); else cb && cb(); })(); }
  const LINES = [['DIGIVISION SOUND SYSTEM // v2.6', ''], ['> initializing signal path ........ ', 'ok'], ['> routing traces [############] ', '100%'], ['> POWER: ', 'ON']];
  function scramble(el){ const target = el.dataset.text, chars = 'АБВГДЕЖЗИКЛМНОПРСТУФХ░▒▓█/\\#*01'; const start = performance.now(), dur = 650 + target.length * 22; (function tick(now){ const pr = Math.min(1, (now - start) / dur), rev = Math.floor(pr * target.length); let s = ''; for (let i = 0; i < target.length; i++){ const ch = target[i]; s += (ch === ' ' || i < rev) ? ch : chars[(Math.random() * chars.length) | 0]; } el.textContent = s; if (pr < 1) requestAnimationFrame(tick); else el.textContent = target; })(performance.now()); }
  function runBoot(){
    clearTimers(); term.innerHTML = ''; term.classList.remove('hide'); heroContent.classList.remove('show'); title.classList.remove('glitch');
    introStart = 0; compose(); let delay = 0;
    LINES.forEach(pair => { const row = document.createElement('div'); term.appendChild(row); timers.push(setTimeout(() => { type(row, pair[0], 16, () => { if (pair[1]){ const ok = document.createElement('span'); ok.className = 'ok'; row.appendChild(ok); type(ok, pair[1], 28); } }); }, delay)); delay += 380; });
    // H1 появляется РАНО (сразу после прелоадера) — терминал НЕ прячем вместе с ним, пусть HUD-надписи добегают снизу
    timers.push(setTimeout(() => { heroContent.classList.add('show'); document.querySelectorAll('.hero .ln[data-text]').forEach(scramble); timers.push(setTimeout(() => title.classList.add('glitch'), 700)); timers.push(setTimeout(() => title.classList.remove('glitch'), 1100)); }, H1_AT));
    timers.push(setTimeout(() => term.classList.add('hide'), BOOT + 120));   // терминал добегает свои строки и прячется позже
  }
  function resize(){ DPR = Math.min(devicePixelRatio || 1, 2); W = heroSec.clientWidth; H = heroSec.clientHeight; mobile = W <= 860; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); compose(); }
  setInterval(() => { if (heroContent.classList.contains('show') && Math.random() < 0.5){ title.classList.add('glitch'); setTimeout(() => title.classList.remove('glitch'), 240); } }, 3400);
  addEventListener('resize', resize);
  heroSec.addEventListener('mousemove', e => { const r = heroSec.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; });
  heroSec.addEventListener('mouseleave', () => mouse.on = false);
  heroSec.addEventListener('click', e => {
    const r = heroSec.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    // клик по хабу (фото) → перегенерация всей схемы трасс, каждый раз по-новому (как при загрузке)
    if (portRing && Math.hypot(x - portRing.x, y - portRing.y) < portRing.r + 26){
      const ph = phA; compose(); phA = ph; regenning = true; regenT0 = 0; return;   // линии заново из центра, хаб/фото на месте
    }
    const { n, d } = nearestPrimary(x, y); if (n && d < 480){ n.glow = 1; traces.filter(t => t.ring === n).forEach(t => spawnPulse(t)); }
  });
  document.getElementById('themeBtn').addEventListener('click', () => { const d = root.classList.toggle('theme-dark'); root.classList.toggle('theme-light', !d); document.getElementById('themeBtn').textContent = d ? 'Свет' : 'Тьма'; });
  resize(); requestAnimationFrame(frame); runBoot();
})();

/* ═════════ header scrolled + reveal + бургер-меню ═════════ */
(() => {
  const hd = document.getElementById('hd');
  addEventListener('scroll', () => hd.classList.toggle('scrolled', scrollY > 40), { passive: true });
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.16 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // мобильное меню: бургер ↔ крест на том же месте
  const burger = document.getElementById('burger'), mm = document.getElementById('mobileMenu');
  if (burger && mm){
    const setMenu = open => {
      burger.classList.toggle('open', open); mm.classList.toggle('open', open);
      document.body.classList.toggle('menu-on', open);
      burger.setAttribute('aria-expanded', open); mm.setAttribute('aria-hidden', !open);
    };
    burger.addEventListener('click', () => setMenu(!burger.classList.contains('open')));
    mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); });
  }
})();

/* ═════════ AUDIO PLAYER ═════════ */
(() => {
  const TRACKS = [
    { t: 'You and me',       g: 'Invariant',   cov: 'img/Invariant.webp',   src: 'mp3/Invariant - You and me.mp3' },
    { t: 'Already',          g: 'LadyCryface', cov: 'img/ladycryface.webp', src: 'mp3/LadyCryface - Already.mp3' },
    { t: 'Vamp',             g: 'Bondet',      cov: 'img/Bondet.webp',      src: 'mp3/Bondet - Vamp.mp3' },
    { t: 'Море',             g: 'KNYT',        cov: 'img/KNYT.webp',        src: 'mp3/KNYT - Море.mp3' },
    { t: '102',              g: 'Black Jude',  cov: 'img/blackjude.webp',   src: 'mp3/Black Jude - 102.mp3' },
    { t: 'I will charm you', g: 'Vandom',      cov: 'img/vandom.webp',      src: 'mp3/Vandom - I will charm you.mp3' }
  ];
  const grid = document.getElementById('trackGrid');
  const audio = new Audio(); audio.preload = 'none';
  const $ = id => document.getElementById(id);
  let cur = -1, playing = false, sim = false, simT = 0, simDur = 192, last = 0;
  const fmt = s => { s = Math.max(0, s | 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  const PAUSE = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';

  TRACKS.forEach((tk, i) => {
    const c = document.createElement('div'); c.className = 'track'; c.dataset.i = i;
    c.innerHTML = `<div class="cov" style="background-image:url('${tk.cov}')"><div class="play">${PLAY}</div></div>
      <div class="meta"><div class="ti">${tk.t}</div><div class="ge">${tk.g}</div></div>`;
    c.addEventListener('click', () => { if (cur === i) togglePlay(); else load(i, true); });
    grid.appendChild(c);
  });
  const cards = [...grid.children];

  function showPlayer(){ document.body.classList.add('player-on'); }
  function load(i, autoplay){
    cur = i; const tk = TRACKS[i];
    $('pCov').style.backgroundImage = `url('${tk.cov}')`; $('pTitle').textContent = tk.t; $('pGenre').textContent = tk.g;
    sim = !tk.src; simT = 0;
    if (!sim){ audio.src = tk.src; } else { audio.removeAttribute('src'); }
    cards.forEach((c, k) => c.classList.toggle('active', k === i));
    showPlayer(); updateBar(0, simDur);
    if (autoplay){ playing = false; togglePlay(); }
  }
  function togglePlay(){
    if (cur < 0){ load(0, true); return; }
    playing = !playing;
    $('play').innerHTML = playing ? PAUSE : PLAY;
    cards.forEach((c, k) => c.querySelector('.play').innerHTML = (k === cur && playing) ? PAUSE : PLAY);
    if (playing){ if (!sim){ audio.play().catch(() => { sim = true; }); } last = performance.now(); requestAnimationFrame(tick); }
    else if (!sim){ audio.pause(); }
  }
  function tick(now){
    if (!playing) return;
    if (sim){ simT += (now - last) / 1000; last = now; if (simT >= simDur){ next(); return; } updateBar(simT, simDur); }
    else { updateBar(audio.currentTime, audio.duration || simDur); }
    requestAnimationFrame(tick);
  }
  function updateBar(c, d){ d = d || simDur; $('fill').style.width = Math.min(100, c / d * 100) + '%'; $('tCur').textContent = fmt(c); $('tDur').textContent = fmt(d); }
  function next(){ load((cur + 1) % TRACKS.length, true); }
  function prev(){ load((cur - 1 + TRACKS.length) % TRACKS.length, true); }

  $('play').addEventListener('click', togglePlay);
  $('next').addEventListener('click', next);
  $('prev').addEventListener('click', prev);
  audio.addEventListener('timeupdate', () => { if (!sim && playing) updateBar(audio.currentTime, audio.duration || simDur); });
  audio.addEventListener('ended', next);
  $('bar').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(), p = clamp01((e.clientX - r.left) / r.width); if (sim){ simT = p * simDur; updateBar(simT, simDur); } else if (audio.duration){ audio.currentTime = p * audio.duration; } });
  $('vol').addEventListener('input', e => audio.volume = +e.target.value);
  audio.volume = 0.8;
  function clamp01(v){ return Math.max(0, Math.min(1, v)); }
})();

/* ═════════ МЕТОД: живая схема-плата (SVG-трасса + бегущий сигнал) ═════════ */
(() => {
  const method = document.querySelector('.method'); if (!method) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'method-trace'); svg.setAttribute('preserveAspectRatio', 'none');
  const base = document.createElementNS(NS, 'path'); base.setAttribute('class', 'base');
  const lit = document.createElementNS(NS, 'path'); lit.setAttribute('class', 'lit');
  const pulse = document.createElementNS(NS, 'circle'); pulse.setAttribute('class', 'pulse'); pulse.setAttribute('r', '3.4');
  svg.append(base, lit, pulse); method.prepend(svg);
  const pins = [...method.querySelectorAll('.node .pin')];
  const pinX = [];
  let L = 0, started = 0, playing = false; const DUR = 2800;

  function build(){
    if (getComputedStyle(svg).display === 'none') { L = 0; return; }
    const cr = method.getBoundingClientRect(); if (cr.width < 2) return;
    pinX.length = 0;
    const cs = pins.map(p => { const r = p.getBoundingClientRect(); pinX.push(r.left - cr.left + r.width / 2); return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2 }; });
    const y = cs.length ? cs[0].y : 14, j = 9;
    const pts = [];                                  // старт от первого кольца, без левого края
    cs.forEach((c, i) => { pts.push([c.x, y]); if (i < cs.length - 1){ const mid = (c.x + cs[i + 1].x) / 2, dir = i % 2 ? 1 : -1; pts.push([mid - j, y], [mid, y + dir * j], [mid + j, y]); } });
    // линия кончается на последнем кольце («Релиз»), без продления до края — дальше подхватывает сквозная линия
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    base.setAttribute('d', d); lit.setAttribute('d', d);
    svg.setAttribute('height', y + 16);
    L = lit.getTotalLength(); lit.style.strokeDasharray = L; lit.style.strokeDashoffset = L;
  }
  function draw(){ lit.style.transition = 'stroke-dashoffset 1.2s ease'; requestAnimationFrame(() => lit.style.strokeDashoffset = 0); }
  function loop(now){
    if (!playing || L < 1) return;
    if (!started) started = now;
    const p = ((now - started) % DUR) / DUR, pt = lit.getPointAtLength(p * L);
    pulse.setAttribute('cx', pt.x); pulse.setAttribute('cy', pt.y);
    for (let i = 0; i < pins.length; i++) pins[i].classList.toggle('lit', Math.abs(pt.x - pinX[i]) < 16);
    requestAnimationFrame(loop);
  }

  build();
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    build(); draw();
    if (L > 1 && !playing){ playing = true; started = 0; requestAnimationFrame(loop); }
    io.unobserve(e.target);
  }), { threshold: 0.2 });
  io.observe(method);

  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (L > 1){ lit.style.transition = 'none'; lit.style.strokeDashoffset = 0; } }, 150); });
})();

/* ═════════ ПРЕЛОАДЕР: логотип-глитч → вспышка → Hero ═════════ */
(() => {
  const pl = document.getElementById('preloader'); if (!pl) return;
  const core = document.getElementById('plCore'), src = document.querySelector('header .dv-logo');
  // клонируем логотип из шапки (без копии SVG-пути в разметке); cls-1/cls-2 и заливки наследуются
  if (src && core){ const c = src.cloneNode(true); c.setAttribute('class', 'pl-logo'); c.removeAttribute('aria-label'); core.insertBefore(c, core.firstChild); }
  // сразу в дело, без спокойного старта: логотип → burst → вспышка → уход; дальше сцена+boot доигрывают, заголовок проявляется позже
  setTimeout(() => pl.classList.add('pl-burst'), 260);
  setTimeout(() => pl.classList.add('pl-flash-on'), 520);
  setTimeout(() => pl.classList.add('pl-gone'), 700);
  setTimeout(() => pl.remove(), 1200);
})();

/* ═════════ СКВОЗНАЯ ЛИНИЯ: сигнальный «хребет» через все секции (заряжается скроллом) ═════════ */
(() => {
  const startSec = document.getElementById('method');
  const endSec = document.getElementById('community') || document.querySelector('footer.ft');
  if (!startSec || !endSec) return;
  const NS = 'http://www.w3.org/2000/svg';
  const wrap = document.createElement('div'); wrap.id = 'spine';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('preserveAspectRatio', 'none');
  const base = document.createElementNS(NS, 'path'); base.setAttribute('class', 'sp-base');
  const lit = document.createElementNS(NS, 'path'); lit.setAttribute('class', 'sp-lit');
  const pulse = document.createElementNS(NS, 'circle'); pulse.setAttribute('class', 'sp-pulse'); pulse.setAttribute('r', '4');
  svg.append(base, lit, pulse); wrap.appendChild(svg); document.body.appendChild(wrap);

  let L = 0, H = 0, topY = 0, pins = [], branches = [], ticking = false;
  const rand = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function mkPin(x, y, cls){ const c = document.createElementNS(NS, 'circle'); c.setAttribute('class', cls || 'sp-pin'); c.setAttribute('r', '4'); c.setAttribute('cx', x); c.setAttribute('cy', y); svg.appendChild(c); return c; }

  function build(){
    const W = innerWidth, contentW = Math.min(1280, W * 0.86), edge = W / 2 + contentW / 2, gutter = W - edge;
    if (W <= 1200 || gutter < 130){ wrap.style.display = 'none'; return; }   // нет места в поле — прячем
    wrap.style.display = '';
    const methodEl = startSec.querySelector('.method');
    topY = startSec.offsetTop + (methodEl ? methodEl.offsetTop : 70) + 14;     // от трассы «Метода»
    H = Math.max(200, endSec.offsetTop - topY);                                 // до красной секции «Сообщество»
    wrap.style.top = topY + 'px'; wrap.style.height = H + 'px';
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const gx = edge + Math.min(gutter * 0.55, 96), corner = gx - edge;

    pins.forEach(p => p.el.remove()); pins = [];
    branches.forEach(b => { b.path.remove(); if (b.ring) b.ring.remove(); }); branches = [];

    // СТВОЛ: ПРАВЫЙ КРАЙ кольца «Релиз» → горизонталь к краю контента → 45° → прямой вертикальный ствол вниз
    const pinsM = startSec.querySelectorAll('.node .pin');
    let relX = edge, relR = 14;
    if (pinsM.length){ const rr = pinsM[pinsM.length - 1].getBoundingClientRect(); relX = rr.left + rr.width / 2; relR = rr.width / 2; }
    const startX = relX + relR + 2;                                              // линия выходит ПОСЛЕ кольца (от его правого края), а не сквозь него
    const hasLead = startX < edge - 2;
    const mainPts = hasLead ? [[startX, 0], [edge, 0], [gx, corner]] : [[edge, 0], [gx, corner]];
    mainPts.push([gx, H]);                                                       // вертикальный ствол до терминала
    const dd = 'M' + mainPts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    base.setAttribute('d', dd); lit.setAttribute('d', dd);
    L = lit.getTotalLength(); lit.style.strokeDasharray = L;
    pins.push({ el: mkPin(gx, H), frac: 1 });                                    // кольцо-терминал у красной секции

    // длина вдоль ствола — чтобы ветвь зажигалась строго ПОСЛЕ прохода линии (а не по координате Y)
    const lenToCorner = (hasLead ? edge - startX : 0) + corner * Math.SQRT2;     // путь до точки (gx, corner)
    const total = (lenToCorner + (H - corner)) || L;
    const fracAt = vy => Math.min(1, (lenToCorner + (vy - corner)) / total + 0.012);

    // ВЕТВИ — ДЕТЕРМИНИРОВАННЫЙ алгоритм (без рандома): строго 45° и вертикали, длина гарантированно влезает в поле ⇒ угол всегда ровно 45°, без пересечений
    const roomL = corner - 6, roomR = gutter - corner - 6;                       // место слева/справа от ствола в правом поле
    const D = clamp(Math.min(roomL, roomR), 30, 56);                            // длина диагонали — влезает в обе стороны
    const STEP = Math.max(150, D * 2 + 56);                                     // шаг развилок > вертикального размаха ветви ⇒ соседние не накладываются
    const path = (a, pts) => { const el = document.createElementNS(NS, 'path'); el.setAttribute('class', 'sp-branch'); el.setAttribute('d', 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' L' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L')); svg.appendChild(el); return el; };
    // ветвь РИСУЕТСЯ штрихом сверху вниз (как главная линия), а не проявляется прозрачностью; кольцо появляется ПОСЛЕ прохода линии
    const addBranch = (el, frac, ring, delay = 0) => {
      const len = el.getTotalLength();
      el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
      el.style.transition = 'stroke-dashoffset .55s ease' + (delay ? ' ' + delay + 's' : '');
      let r = null;
      if (ring){ r = mkPin(ring[0], ring[1]); r.style.transition = 'opacity .3s ' + (delay + 0.5).toFixed(2) + 's, fill .25s'; }
      branches.push({ path: el, len, ring: r, frac });
    };

    const TAIL = Math.round(D * 0.5);                                            // обязательный вертикальный загиб вниз перед кольцом
    const endY = H - (D * 2.5 + 70);                                             // ниже развилки не ставим — ветвь должна целиком влезть до терминала
    let by = corner + 90, k = 0;
    while (by < endY){
      const dir = (k % 2 === 0) ? -1 : 1;                                        // строгое чередование сторон (и влево, и вправо)
      const room = dir > 0 ? roomR : roomL, F = fracAt(by);
      const f0 = [gx, by], p1 = [gx + dir * D, by + D];                          // отход от ствола — ровно 45°
      const shape = k % 4;
      // ПРАВИЛО: после 45° ветвь обязана загнуться ВНИЗ (вертикаль), и только потом ставится кольцо
      if (shape === 0){                                                          // 45° → короткая вертикаль → кольцо
        const p2 = [p1[0], p1[1] + TAIL];
        addBranch(path(f0, [p1, p2]), F, p2);
      } else if (shape === 1){                                                   // 45° → длинная вертикаль → кольцо
        const p2 = [p1[0], p1[1] + Math.round(D * 0.95)];
        addBranch(path(f0, [p1, p2]), F, p2);
      } else if (shape === 2 && room >= 2 * D){                                  // 45° → ещё 45° → вертикаль → кольцо (если хватает поля)
        const p2 = [p1[0] + dir * D, p1[1] + D], p3 = [p2[0], p2[1] + TAIL];
        addBranch(path(f0, [p1, p2, p3]), F, p3);
      } else {                                                                   // РАЗДВОЕНИЕ (Y): общий 45°, затем две ветки — каждая с вертикальным загибом перед кольцом
        const V = Math.round(D * 0.7), Ein = Math.round(D * 0.55);
        addBranch(path(f0, [p1]), F, null);                                      // общий стебель (45°, без кольца)
        const a2 = [p1[0], p1[1] + V];
        addBranch(path(p1, [a2]), F, a2, 0.5);                                   // ветка A: вертикаль → кольцо (отрисуется после стебля)
        const b1 = [p1[0] - dir * Ein, p1[1] + Ein], b2 = [b1[0], b1[1] + TAIL];
        addBranch(path(p1, [b1, b2]), F, b2, 0.5);                               // ветка B: 45° внутрь → вертикаль → кольцо
      }
      by += STEP; k++;
    }
    update();
  }
  function update(){
    if (innerWidth <= 1200 || L < 1) return;
    const prog = clamp((scrollY + innerHeight * 0.55 - topY) / H, 0, 1);
    lit.style.strokeDashoffset = L * (1 - prog);
    const pt = lit.getPointAtLength(prog * L); pulse.setAttribute('cx', pt.x); pulse.setAttribute('cy', pt.y);
    pulse.style.opacity = prog > 0.001 && prog < 0.999 ? 1 : 0;
    for (const p of pins) p.el.classList.toggle('on', p.frac <= prog);
    for (const b of branches){ const on = b.frac <= prog; b.path.style.strokeDashoffset = on ? 0 : b.len; if (b.ring) b.ring.classList.toggle('on', on); }
  }
  addEventListener('scroll', () => { if (!ticking){ ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } }, { passive: true });
  let rt2; addEventListener('resize', () => { clearTimeout(rt2); rt2 = setTimeout(build, 160); });
  addEventListener('load', build);
  build();
})();

