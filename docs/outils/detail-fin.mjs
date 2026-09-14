#!/usr/bin/env node
// Détail fin d'images de la MÊME section, comparées entre elles.
//
//   node docs/outils/detail-fin.mjs public/images/refuges/brume.avif public/images/refuges/aubepine.avif …
//
// Chaque image est ramenée à 2400 px sur son grand côté, découpée en tuiles 6×4
// (ou 4×6 en portrait), et chaque tuile reçoit le résidu d'un aller-retour
// bicubique à 75 % — ce qu'une réduction de 25 % effacerait, donc le détail fin.
//
// Le chiffre qui compte est le 90e PERCENTILE des tuiles : la zone la plus nette
// de l'image, en ignorant ciel, brume et aplats. Un brouillard voulu fait baisser
// la médiane, pas le 90e percentile — c'est tout l'intérêt. Chaque image est
// rapportée à la médiane des AUTRES : sous 60 %, alerte à regarder, pas un
// upscale automatique. Méthode et barème : docs/assets-a-generer.md.
//
// Prérequis : ffmpeg et ffprobe dans le PATH.

import { execFileSync } from "node:child_process";

const LONG = 2400;
const SEUIL = 0.6;

function mesurer(fichier) {
  const [w, h] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", fichier])
    .toString().trim().split(",").map(Number);
  const portrait = h > w;
  const [nx, ny] = portrait ? [4, 6] : [6, 4];
  const W0 = portrait ? Math.round((w * LONG) / h) : LONG;
  const H0 = portrait ? LONG : Math.round((h * LONG) / w);
  const W = Math.floor(W0 / nx) * nx;
  const H = Math.floor(H0 / ny) * ny;
  const gris = (filtre) =>
    execFileSync("ffmpeg", ["-v", "error", "-i", fichier, "-vf", filtre, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 64 * 1024 * 1024 });
  const base = `scale=${W0}:${H0}:flags=lanczos,crop=${W}:${H}`;
  const a = gris(base);
  const rw = Math.round((W * 0.75) / 2) * 2;
  const rh = Math.round((H * 0.75) / 2) * 2;
  const b = gris(`${base},scale=${rw}:${rh}:flags=bicubic,scale=${W}:${H}:flags=bicubic`);
  const cw = W / nx;
  const ch = H / ny;
  const tuiles = [];
  for (let ty = 0; ty < ny; ty++) {
    for (let tx = 0; tx < nx; tx++) {
      let s = 0;
      for (let y = ty * ch; y < (ty + 1) * ch; y++) for (let x = tx * cw; x < (tx + 1) * cw; x++) s += Math.abs(a[y * W + x] - b[y * W + x]);
      tuiles.push(s / (cw * ch));
    }
  }
  const tri = [...tuiles].sort((p, q) => p - q);
  const q = (p) => tri[Math.floor(p * (tri.length - 1))];
  return { fichier, taille: `${w}×${h}`, mediane: q(0.5), p90: q(0.9) };
}

const fichiers = process.argv.slice(2);
if (fichiers.length < 2) {
  console.error("Donner au moins deux images d'une même section.");
  process.exit(1);
}
const res = fichiers.map(mesurer);
let alerte = false;
console.log("image".padEnd(48), "taille".padEnd(11), "médiane", "  90e pct", "  vs autres");
for (const r of res) {
  const autres = res.filter((o) => o !== r).map((o) => o.p90).sort((p, q) => p - q);
  const ref = autres[Math.floor((autres.length - 1) / 2)];
  const ratio = r.p90 / ref;
  const flag = ratio < SEUIL ? "  ⚠️ sous 60 %" : "";
  if (flag) alerte = true;
  console.log(r.fichier.padEnd(48), r.taille.padEnd(11), r.mediane.toFixed(2).padStart(7), r.p90.toFixed(2).padStart(9), `${(ratio * 100).toFixed(0).padStart(8)} %${flag}`);
}
process.exit(alerte ? 2 : 0);
