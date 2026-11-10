/* Küçük SVG nokta grafiği (dağılım grafiği): eksenler, etiketler, noktalar, çizgiler. */
const NS = "http://www.w3.org/2000/svg";
export const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

export function grafik({ xmin, xmax, ymin, ymax, xetiket = "", yetiket = "", W = 360, H = 260, izgara = true, eksen = true }) {
  const P = eksen ? { l: 44, r: 12, t: 12, b: 38 } : { l: 8, r: 8, t: 8, b: 8 };
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "plot", role: "img" });
  const X = (v) => P.l + ((v - xmin) / (xmax - xmin)) * (W - P.l - P.r);
  const Y = (v) => H - P.b - ((v - ymin) / (ymax - ymin)) * (H - P.t - P.b);
  const tersX = (px) => xmin + ((px - P.l) / (W - P.l - P.r)) * (xmax - xmin);
  const tersY = (py) => ymin + ((H - P.b - py) / (H - P.t - P.b)) * (ymax - ymin);
  const zemin = svgEl("g"), cizgi = svgEl("g"), nokta = svgEl("g"), ust = svgEl("g");
  svg.append(zemin, cizgi, nokta, ust);
  if (eksen) {
    zemin.append(svgEl("rect", { x: P.l, y: P.t, width: W - P.l - P.r, height: H - P.t - P.b, class: "plot-bg" }));
    const adim = (a, b) => { const r = (b - a) / 4, p = 10 ** Math.floor(Math.log10(r)), n = [1, 2, 5, 10].find((m) => m * p >= r) * p; return n; };
    const dx = adim(xmin, xmax), dy = adim(ymin, ymax);
    for (let v = Math.ceil(xmin / dx) * dx; v <= xmax + 1e-9; v += dx) {
      if (izgara) zemin.append(svgEl("line", { x1: X(v), x2: X(v), y1: P.t, y2: H - P.b, class: "plot-grid" }));
      const t = svgEl("text", { x: X(v), y: H - P.b + 15, class: "plot-tick", "text-anchor": "middle" }); t.textContent = +v.toFixed(2); zemin.append(t);
    }
    for (let v = Math.ceil(ymin / dy) * dy; v <= ymax + 1e-9; v += dy) {
      if (izgara) zemin.append(svgEl("line", { x1: P.l, x2: W - P.r, y1: Y(v), y2: Y(v), class: "plot-grid" }));
      const t = svgEl("text", { x: P.l - 6, y: Y(v) + 4, class: "plot-tick", "text-anchor": "end" }); t.textContent = +v.toFixed(2); zemin.append(t);
    }
    const xl = svgEl("text", { x: (P.l + W - P.r) / 2, y: H - 4, class: "plot-label", "text-anchor": "middle" }); xl.textContent = xetiket;
    const yl = svgEl("text", { x: 12, y: (P.t + H - P.b) / 2, class: "plot-label", "text-anchor": "middle", transform: `rotate(-90 12 ${(P.t + H - P.b) / 2})` }); yl.textContent = yetiket;
    zemin.append(xl, yl);
  }
  return {
    svg, X, Y, tersX, tersY, katman: { zemin, cizgi, nokta, ust },
    nokta(x, y, { r = 6, cls = "", etiket } = {}) {
      const c = svgEl("circle", { cx: X(x), cy: Y(y), r, class: "pt " + cls });
      if (etiket) { const t = svgEl("title"); t.textContent = etiket; c.append(t); }
      nokta.append(c); return c;
    },
    cizgi(x1, y1, x2, y2, cls = "") { const l = svgEl("line", { x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), class: "ln-k " + cls }); cizgi.append(l); return l; },
    /* tıklanan/dokunulan noktayı veri koordinatına çevir */
    veriKoordinati(ev) {
      const r = svg.getBoundingClientRect(), px = ((ev.clientX - r.left) / r.width) * W, py = ((ev.clientY - r.top) / r.height) * H;
      return [Math.max(xmin, Math.min(xmax, tersX(px))), Math.max(ymin, Math.min(ymax, tersY(py)))];
    }
  };
}
