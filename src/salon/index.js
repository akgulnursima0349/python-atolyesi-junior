/* Oyun Salonu: her oyun ait olduğu dünya bitince açılır. Tur başına 3–5 kısa soru; ilk denemede doğruya 1 yıldız. */
import { yapboz } from "./yapboz.js";
import { tahminOyunu } from "./tahmin.js";
import { hataOyunu } from "./hata.js";
import { piksel } from "./piksel.js";
import { ajan } from "./ajan.js";
import { bot } from "./bot.js";
import { modelOyunu } from "./model.js";
import { store } from "../core/store.js";
import { WORLDS } from "../worlds/index.js";

export const OYUNLAR = [yapboz, tahminOyunu, hataOyunu, piksel, ajan, bot, modelOyunu];
export const oyunBul = (id) => OYUNLAR.find((o) => o.id === id);
export const oyunDunyasi = (o) => WORLDS.find((w) => w.id === o.dunya);
export const oyunAcik = (o) => store.teacher() || store.worldDone(o.dunya);
export const salonAcik = () => OYUNLAR.some(oyunAcik);
export const dunyaOyunu = (worldId) => OYUNLAR.find((o) => o.dunya === worldId);
