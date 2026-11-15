/* elements2d core - flat TV-cartoon drawing kit (SVG strings).
   Rules: one connected outline per mass (stroke-under-fill union), one shadow tone (multiply, offset crescent
   + explicit cast shapes), tapered ink lines for interior detail, heavy-lid eyes with big pupils, talking mouths. */
(function (G) {
  'use strict';
  const K = {}; G.K = K;
  K.OL = '#261c19'; K.W = 4.2;
  let UID = 0; const uid = p => p + (++UID); K.uid = uid;
  const r = v => Math.round(v * 10) / 10; K.r = r;
  const lerp = (a, b, t) => a + (b - a) * t; K.lerp = lerp;

  // part: {d, fill, t(transform), noShade}
  K.P = (d, fill, t) => ({ d, fill, t: t || '' });
  const pathOf = (p, extra) => `<path d="${p.d}"${p.t ? ` transform="${p.t}"` : ''}${extra || ''}/>`;

  /* mass: parts drawn as one outlined silhouette.
     opt.light [dx,dy]: shift of the lit copy -> shadow crescent on the opposite side
     opt.tint: multiply colour of the shadow tone; opt.shade: extra shadow path strings (svg) inside silhouette
     opt.inner: svg drawn over fills before shading (colour regions without outline)
     opt.lines: svg drawn after shading (ink details) */
  K.mass = function (parts, opt) {
    opt = opt || {};
    const cid = uid('c'), mid = uid('m');
    const L = opt.light || [10, -8], tint = opt.tint || '#c4b2d2', w = opt.w || K.W;
    const all = parts.map(p => pathOf(p)).join('');
    let s = `<defs><clipPath id="${cid}">${all}</clipPath>` +
      `<mask id="${mid}" maskUnits="userSpaceOnUse" x="-400" y="-400" width="1200" height="1200"><rect x="-400" y="-400" width="1200" height="1200" fill="#fff"/>` +
      `<g transform="translate(${L[0]},${L[1]})" fill="#000">${all}</g></mask></defs>`;
    s += `<g fill="none" stroke="${opt.ol || K.OL}" stroke-width="${2 * w}" stroke-linejoin="round" stroke-linecap="round">${all}</g>`;
    s += parts.map(p => pathOf(p, ` fill="${p.fill}"`)).join('');
    if (opt.inner) s += `<g clip-path="url(#${cid})">${opt.inner}</g>`;
    if (opt.noShade !== true) {
      s += `<g clip-path="url(#${cid})" style="mix-blend-mode:multiply" fill="${tint}">` +
        `<rect x="-400" y="-400" width="1200" height="1200" mask="url(#${mid})"/>${opt.shade || ''}</g>`;
    }
    if (opt.lines) s += `<g clip-path="url(#${cid})">${opt.lines}</g>`;
    if (opt.over) s += opt.over;
    return s;
  };

  // tapered ink stroke along quadratic bezier (or cubic if c2 given). widths: start, middle, end
  K.taper = function (p0, c, p1, w0, wm, w1, fill, c2) {
    const N = 18, L = [], R = [];
    const B = t => {
      if (c2) { const u = 1 - t; return [u*u*u*p0[0] + 3*u*u*t*c[0] + 3*u*t*t*c2[0] + t*t*t*p1[0], u*u*u*p0[1] + 3*u*u*t*c[1] + 3*u*t*t*c2[1] + t*t*t*p1[1]]; }
      const u = 1 - t; return [u*u*p0[0] + 2*u*t*c[0] + t*t*p1[0], u*u*p0[1] + 2*u*t*c[1] + t*t*p1[1]];
    };
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = B(Math.max(0, t - 0.01)), b = B(Math.min(1, t + 0.01));
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const e = t < 0.5 ? t * 2 : (1 - t) * 2, sm = e * e * (3 - 2 * e);
      const w = (t < 0.5 ? lerp(w0, wm, sm) : lerp(w1, wm, sm)) / 2;
      const p = B(t); L.push([p[0] - dy * w, p[1] + dx * w]); R.push([p[0] + dy * w, p[1] - dx * w]);
    }
    const pts = L.concat(R.reverse());
    return `<path d="M${pts.map(p => r(p[0]) + ' ' + r(p[1])).join('L')}Z" fill="${fill || K.OL}"/>`;
  };
  K.line = (d, w, col) => `<path d="${d}" fill="none" stroke="${col || K.OL}" stroke-width="${w || 3}" stroke-linecap="round" stroke-linejoin="round"/>`;

  /* eye: {x,y,rx,ry,rot, look:[lx,ly], pr, top, tilt, bot, lid, blink, side, happyClose}
     top: upper-lid coverage 0..1, tilt: lid edge slope (+ = outer corner lower), bot: lower lid coverage */
  K.eye = function (e) {
    const id = uid('e'), x = e.x, y = e.y, rx = e.rx, ry = e.ry, sd = e.side || 1, lw = e.lw || 3.6;
    const rot = e.rot ? ` transform="rotate(${e.rot} ${x} ${y})"` : '';
    let s = `<defs><clipPath id="${id}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot}/></clipPath><clipPath id="${id}x"><ellipse cx="${x}" cy="${y}" rx="${rx + 2.2}" ry="${ry + 2.2}"${rot}/></clipPath></defs>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot} fill="#fbf8f2"/>`;
    s += `<g clip-path="url(#${id})">`;
    if (!e.blink) {
      const lk = e.look || [0, 0], pr = (e.pr || 0.5);
      const px = x + lk[0] * rx * 0.42, py = y + lk[1] * ry * 0.34 + (e.top || 0) * ry * 0.18;
      if (e.iris) s += `<ellipse cx="${r(px)}" cy="${r(py)}" rx="${r(rx * pr * 1.25)}" ry="${r(rx * pr * 1.35)}" fill="${e.iris}"/>`;
      if (e.bar) s += `<rect x="${r(px - rx * pr * 0.95)}" y="${r(py - rx * pr * 0.32)}" width="${r(rx * pr * 1.9)}" height="${r(rx * pr * 0.64)}" rx="${r(rx * pr * 0.3)}" fill="#1d1613"/>`;
      else s += `<ellipse cx="${r(px)}" cy="${r(py)}" rx="${r(rx * pr * (e.iris ? 0.62 : 1))}" ry="${r(rx * pr * (e.iris ? 0.7 : 1.12))}" fill="#1d1613"/>`;
      s += `<circle cx="${r(px + rx * pr * 0.35)}" cy="${r(py - rx * pr * 0.42)}" r="${r(rx * pr * 0.3)}" fill="#fff"/>`;
      s += `<circle cx="${r(px - rx * pr * 0.35)}" cy="${r(py + rx * pr * 0.4)}" r="${r(rx * pr * 0.13)}" fill="#fff" opacity=".8"/>`;
      // upper lid
      const top = e.top || 0, tl = (e.tilt || 0) * sd;
      if (top > 0.01) {
        const yl = y - ry + top * 2 * ry;
        const a = [x - rx * 1.3, yl - tl * ry * 0.5], b = [x + rx * 1.3, yl + tl * ry * 0.5], c = [x, yl + ry * 0.22];
        s += `<path d="M${a[0]} ${y - ry * 2}L${b[0]} ${y - ry * 2}L${r(b[0])} ${r(b[1])}Q${r(c[0])} ${r(c[1])} ${r(a[0])} ${r(a[1])}Z" fill="${e.lid}"/>`;
        s += K.line(`M${r(a[0])} ${r(a[1])}Q${r(c[0])} ${r(c[1])} ${r(b[0])} ${r(b[1])}`, lw * 1.25);
      }
      const bot = e.bot || 0;
      if (bot > 0.01) {
        const yb = y + ry - bot * 2 * ry;
        const a = [x - rx * 1.3, yb + ry * 0.1], b = [x + rx * 1.3, yb + ry * 0.1], c = [x, yb - ry * 0.32];
        s += `</g><g clip-path="url(#${id}x)"><path d="M${a[0]} ${y + ry * 2}L${b[0]} ${y + ry * 2}L${r(b[0])} ${r(b[1])}Q${r(c[0])} ${r(c[1])} ${r(a[0])} ${r(a[1])}Z" fill="${e.lid}"/>`;
        s += K.taper([x - rx * 0.9, yb - ry * 0.02], [x, yb - ry * 0.4], [x + rx * 0.9, yb - ry * 0.02], 0.6, lw * 0.85, 0.6);
      }
    } else {
      s += `<rect x="${x - rx * 2}" y="${y - ry * 2}" width="${rx * 4}" height="${ry * 4}" fill="${e.lid}"/>`;
      const yy = y + ry * (e.happyClose ? 0.05 : 0.25);
      const bend = e.happyClose ? -ry * 0.55 : ry * 0.35;
      s += K.line(`M${r(x - rx * 0.95)} ${r(yy - (e.happyClose ? -ry * 0.1 : 0))}Q${x} ${r(yy + bend)} ${r(x + rx * 0.95)} ${r(yy)}`, lw * 1.3);
    }
    s += '</g>';
    const bot = e.blink ? 0 : (e.bot || 0);
    if (bot > 0.01) { // cheek pushes up: hide the eye rim below the lower-lid curve
      const yb = y + ry - bot * 2 * ry, cid = uid('eb');
      s += `<defs><clipPath id="${cid}"><path d="M${x - rx * 2} ${y - ry * 2}L${x + rx * 2} ${y - ry * 2}L${x + rx * 2} ${r(yb)}L${r(x + rx * 0.9)} ${r(yb - ry * 0.02)}Q${x} ${r(yb - ry * 0.4)} ${r(x - rx * 0.9)} ${r(yb - ry * 0.02)}L${x - rx * 2} ${r(yb)}Z"/></clipPath></defs>`;
      s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot} fill="none" stroke="${K.OL}" stroke-width="${lw}" clip-path="url(#${cid})"/>`;
    } else s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot} fill="none" stroke="${K.OL}" stroke-width="${lw}"/>`;
    return s;
  };

  /* brow over an eye: e = eye spec; b = {raise, inRaise, arch, w, len, gap, angle}; side +1: outer to the right */
  K.brow = function (e, b, col) {
    const sd = e.side || 1, g = b.gap == null ? 6 : b.gap, len = b.len || 1;
    const inner = [e.x - sd * e.rx * 0.85 * len, e.y - e.ry - g - (b.inRaise || 0)];
    const outer = [e.x + sd * e.rx * 1.0 * len, e.y - e.ry - g - (b.raise || 0)];
    const c = [(inner[0] + outer[0]) / 2 + sd * 2, Math.min(inner[1], outer[1]) - (b.arch || 6)];
    const w = b.w || 7;
    return K.taper(inner, c, outer, w * 0.75, w, w * 0.3, col || K.OL);
  };

  /* mouth: {x,y,w, open 0..1, smile -1..1, round 0..1, teeth, tongue, rot, lw, inside}
     returns svg; closed mouth = tapered line with corner ticks */
  K.mouth = function (m) {
    const x = m.x, y = m.y, w = m.w, o = m.open || 0, sm = m.smile || 0, rd = m.round || 0, lw = m.lw || 3.6;
    const tr = m.rot ? ` transform="rotate(${m.rot} ${x} ${y})"` : '';
    const ww = w * (1 - rd * 0.45);
    const cy = y - sm * w * 0.22;
    const L = [x - ww / 2, cy], R = [x + ww / 2, cy + (m.skew || 0)];
    if (o < 0.06) {
      const mid = [x, y + sm * w * 0.12 + (m.skewMid || 0)];
      let s = K.taper(L, [mid[0], mid[1] + sm * w * 0.12], R, 2, lw * 1.2, 2.4);
      if (sm > 0.15) {
        s += K.taper([L[0] - 3, L[1] - 4], [L[0] - 1, L[1]], [L[0] + 3, L[1] + 3], 1.5, 3, 1.2);
        s += K.taper([R[0] + 3, R[1] - 4], [R[0] + 1, R[1]], [R[0] - 3, R[1] + 3], 1.5, 3, 1.2);
      }
      return `<g${tr}>${s}</g>`;
    }
    const id = uid('mo');
    const topY = cy + (sm > 0 ? sm * w * 0.1 : 0) - rd * o * w * 0.5;   // top lip control
    const botY = cy + o * w * 0.95 + Math.max(0, sm) * w * 0.25;
    const d = rd > 0.5
      ? `M${r(x - ww / 2)} ${r(y + o * w * 0.2)}C${r(x - ww / 2)} ${r(y - o * w * 0.45)} ${r(x + ww / 2)} ${r(y - o * w * 0.45)} ${r(x + ww / 2)} ${r(y + o * w * 0.2)}C${r(x + ww / 2)} ${r(y + o * w * 0.95)} ${r(x - ww / 2)} ${r(y + o * w * 0.95)} ${r(x - ww / 2)} ${r(y + o * w * 0.2)}Z`
      : `M${r(L[0])} ${r(L[1])}Q${r(x)} ${r(2 * topY - cy)} ${r(R[0])} ${r(R[1])}C${r(R[0] - ww * 0.05)} ${r(botY)} ${r(L[0] + ww * 0.05)} ${r(botY)} ${r(L[0])} ${r(L[1])}Z`;
    let s = `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${m.inside || '#5a1618'}"/>`;
    s += `<g clip-path="url(#${id})">`;
    s += `<ellipse cx="${r(x + ww * 0.08)}" cy="${r(botY + w * 0.1)}" rx="${r(ww * 0.36)}" ry="${r(w * 0.3)}" fill="${m.tongue || '#e0707a'}"/>`;
    if (m.teeth) s += `<path d="M${x - w} ${r(cy - w)}L${x + w} ${r(cy - w)}L${x + w} ${r(topY + m.teeth)}L${x - w} ${r(topY + m.teeth)}Z" fill="#fbf7ee"/>` +
      K.line(`M${x - w} ${r(topY + m.teeth)}L${x + w} ${r(topY + m.teeth)}`, 2.2);
    if (m.botTeeth) s += `<rect x="${x - w}" y="${r(botY - m.botTeeth)}" width="${2 * w}" height="${w}" fill="#fbf7ee"/>`;
    s += `</g><path d="${d}" fill="none" stroke="${K.OL}" stroke-width="${lw}" stroke-linejoin="round"/>`;
    return `<g${tr}>${s}</g>`;
  };

  /* tufts: pointed hair clumps along a spine (list of points). Spikes go to the left of travel direction
     when dir=1 (use -1 to flip). lens: number or array; lean: shifts tips along travel (+ = forward). Returns closed path d
     (closes back along a slightly inset spine so it can sit inside a silhouette union). */
  K.tufts = function (sp, lens, dir, lean, back) {
    dir = dir || 1; lean = lean || 0.3;
    let d = `M${r(sp[0][0])} ${r(sp[0][1])}`;
    for (let i = 0; i < sp.length - 1; i++) {
      const a = sp[i], b = sp[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const nx = dy / l * dir, ny = -dx / l * dir, len = Array.isArray(lens) ? lens[i % lens.length] : lens;
      const tip = [a[0] + dx * (0.5 + lean) + nx * len, a[1] + dy * (0.5 + lean) + ny * len];
      const c1 = [a[0] + nx * len * 0.55 + dx * 0.15, a[1] + ny * len * 0.55 + dy * 0.15];
      const c2 = [a[0] + dx * 0.75 + nx * len * 0.25, a[1] + dy * 0.75 + ny * len * 0.25];
      d += `Q${r(c1[0])} ${r(c1[1])} ${r(tip[0])} ${r(tip[1])}Q${r(c2[0])} ${r(c2[1])} ${r(b[0])} ${r(b[1])}`;
    }
    if (back) d += back; d += 'Z';
    return d;
  };

  // scallop: closed polygon pts -> arcs bulging outward (clockwise pts bulge out with b>0). b may be array.
  K.scallop = function (pts, b) {
    let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], c = pts[(i + 1) % pts.length], dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const k = Array.isArray(b) ? b[i % b.length] : b;
      const m = [(a[0] + c[0]) / 2 + dy / l * k * l * 0.5, (a[1] + c[1]) / 2 - dx / l * k * l * 0.5];
      d += `Q${r(m[0])} ${r(m[1])} ${r(c[0])} ${r(c[1])}`;
    }
    return d + 'Z';
  };
  K.circlePts = (cx, cy, rx, ry, n, a0, jit) => Array.from({ length: n }, (_, i) => {
    const a = (a0 || 0) + i / n * Math.PI * 2, j = jit ? 1 + jit[i % jit.length] : 1;
    return [cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j];
  });

  // talk shapes + expression helpers
  K.TALK = ['X', 'A', 'E', 'O'];
  K.talkMouth = function (shape, base) { // base: {smile}
    const sm = (base && base.smile) || 0;
    switch (shape) {
      case 'X': return { open: 0.12, smile: sm * 0.6, round: 0 };
      case 'A': return { open: 0.5, smile: sm * 0.5, round: 0 };
      case 'E': return { open: 0.3, smile: Math.max(0.25, sm), round: 0, wide: 1.12 };
      case 'O': return { open: 0.5, smile: 0, round: 1, wide: 0.75 };
    }
    return null;
  };

  // element registry
  K.list = [];
  K.def = function (group, name, exprs, draw) { K.list.push({ group, name, exprs, draw }); };
  K.svg = function (el, st, size) {
    UID = UID % 1e6;
    return `<svg viewBox="0 0 300 300" width="${size || 220}" height="${size || 220}" xmlns="http://www.w3.org/2000/svg">${el.draw(st)}</svg>`;
  };
})(window);
