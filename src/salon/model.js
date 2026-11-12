/* Model Atölyesi (Dünya 7'den sonra): yeni meyveyi tahmin et, sonra modelin k komşusu oy versin. */
import { wait } from "../core/ui.js";
import { sfx } from "../core/sound.js";
import { tahminEkrani } from "../core/kaliplar.js";
import { grafik } from "../ml/grafik.js";
import { MEYVE, knn, meyveVeri, meyveX } from "../ml/modeller.js";
import { rastgele, sayac } from "./ortak.js";

const EMO = { elma: "🍎", portakal: "🍊" };

/* k tek sayı ve iki tür var: oylar hiç berabere kalmaz */
function nokta(k) {
  const a = rastgele(125, 200), p = rastgele(1, 10);
  return { a, p, r: knn(meyveVeri(), meyveX(a, p), k) };
}

function ekran(k) {
  return (ctx) => {
    const say = sayac();
    const { a, p, r } = nokta(k);
    let g;
    tahminEkrani(ctx, {
      soru: `Model en yakın <b>${k}</b> komşuya bakıyor. Ne der?`,
      kod: [`model = KNeighborsClassifier(n_neighbors=${k})`, "model.fit(X, y)", `print(model.predict([[${a}, ${p}]]))`],
      sahne: (st) => {
        g = grafik({ xmin: 115, xmax: 210, ymin: 0, ymax: 11, xetiket: "ağırlık (gram)", yetiket: "kabuk pürüzü" });
        st.append(g.svg);
        MEYVE.forEach(([x, y, t]) => g.nokta(x, y, { cls: t }));
        g.nokta(a, p, { r: 9, cls: "yeni" });
      },
      secenekler: ["elma", "portakal"].map((t) => ({
        t: `${EMO[t]} ${t}`, dogru: t === r.tahmin,
        ipucu: k === 1 ? "<b>En yakın</b> tek noktaya bak!" : `En yakın <b>${k}</b> noktayı say, çoğunluk kazanır!`
      })),
      oynat: async (cp) => {
        cp.line(2);
        for (const n of r.komsular) { const [x, y] = MEYVE[n.i]; g.cizgi(a, p, x, y, "near " + n.y); sfx.tik(2); await wait(280); }
        cp.line(-1); cp.print(`['${r.tahmin}']`);
      },
      yanlis: say.hata,
      basari: `Komşular oy verdi: <b>${Object.entries(r.oylar).map(([t, v]) => `${v} ${t}`).join(", ")}</b>.`,
      rozet: "model gibi düşündün", yildiz: say.yildiz
    });
  };
}

export const modelOyunu = { id: "model", ad: "Model Atölyesi", ikon: "deney", renk: "#b39dff", dunya: "yz", tur: () => [1, 3, 3, 5].map(ekran) };
