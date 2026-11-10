/* Basit, dokunmatik dostu kod kutusu. Tab ve ":" sonrası Enter 4 boşluk girer. */
import { el } from "./ui.js";

export function editor(baslangic, { satir = 6 } = {}) {
  const t = el("textarea", "editor");
  t.value = baslangic;
  t.rows = satir;
  t.spellcheck = false;
  t.setAttribute("autocapitalize", "off");
  t.setAttribute("autocomplete", "off");
  t.setAttribute("autocorrect", "off");
  t.setAttribute("aria-label", "Kod yazma alanı");
  const ekle = (s) => {
    const a = t.selectionStart, b = t.selectionEnd;
    t.setRangeText(s, a, b, "end");
    t.dispatchEvent(new Event("input"));
  };
  t.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); ekle("    "); }
    else if (e.key === "Enter") {
      const once = t.value.slice(0, t.selectionStart), sat = once.slice(once.lastIndexOf("\n") + 1);
      const girinti = sat.match(/^ */)[0] + (/:\s*$/.test(sat) ? "    " : "");
      if (girinti) { e.preventDefault(); ekle("\n" + girinti); }
    }
  });
  return t;
}
