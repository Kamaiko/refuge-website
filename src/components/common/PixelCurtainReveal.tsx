"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, refreshWhenIdle } from "@/lib/gsap";
import { cn, readToken } from "@/lib/utils";

/**
 * Rideau de pixels scrubbé au scroll, dans l'ordre de lecture.
 *
 * ── Le modèle ──────────────────────────────────────────────────────────────
 *
 * Ce n'est pas un semis de pixels qui envahit la lettre : ce sont **deux
 * niveaux qui montent depuis la ligne de base**, colonne par colonne.
 *
 *     à lire      ← pas encore atteint
 *     ────────── niveau couleur (monte le premier)
 *     couleur     ← la bande
 *     ────────── niveau révélé (monte derrière, et chasse la couleur vers le haut)
 *     lu
 *
 * Trois propriétés, toutes relevées à la mesure sur l'animation de référence,
 * et chacune indispensable :
 *
 * 1. **Le remplissage est vertical, de bas en haut.** Vérifié en mesurant le
 *    profil des couleurs d'un même mot image par image : le barycentre de la
 *    couleur monte, celui du texte révélé le suit.
 * 2. **La trame précède la couleur.** Le bord de chaque niveau n'est pas une
 *    marche nette : c'est un tramage qui étale la transition. Des pixels
 *    isolés montent d'abord, se densifient, puis le niveau les rattrape.
 * 3. **La traîne est une affaire de DENSITÉ, pas de teinte.** L'histogramme
 *    de saturation de la référence garde le même mode devant et derrière le
 *    front ; seul le nombre de pixels colorés baisse. Une version antérieure
 *    lisait ça comme un dégradé et mélangeait la couleur vers le blanc : la
 *    traîne paraissait fade, et elle l'était.
 *
 * ⚠️ Le tramage n'est **ni** une grille **ni** du bruit. Les deux extrêmes ont
 * été essayés : la matrice de Bayer nue lit comme un quadrillage, le bruit
 * blanc comme du grain de photo. Il faut un bruit *isotrope et bien réparti* —
 * ici l'*interleaved gradient noise*, qui ne se répète pas et n'a pas d'axe
 * privilégié — plus une pincée de désordre (`grain`) par-dessus.
 *
 * ── Le rendu ───────────────────────────────────────────────────────────────
 *
 * Un seul calque de texte, peint en **blanc**, et un masque à la résolution de
 * la grille où chaque cellule porte **sa couleur**. Deux composites par frame :
 *
 *     ctx = masque agrandi au plus proche voisin   (la couleur, par cellule)
 *     ctx = ctx ∩ calque d'encre                   (la forme des lettres)
 *
 * L'agrandissement au plus proche voisin donne l'arête franche du pixel ;
 * l'intersection rend l'anticrénelage du glyphe. Une version antérieure
 * gardait trois calques colorés et un canvas de travail, et composait sept
 * fois par frame — pour un résultat équivalent, puisque les trois états sont
 * **exclusifs** cellule par cellule. Cinq canvas plein format sont ainsi
 * devenus deux (≈ 55 → 22 Mo à `dpr` 2 sur un bloc de 1300×500).
 *
 * Le canvas peint **tous les états**, jamais seulement la couleur : il n'y a
 * donc aucune frontière entre du texte peint par le DOM et du texte peint par
 * le canvas, donc aucune couture. Le `<p>` dessous garde le vrai texte — mise
 * en page, césure, sélection, lecteurs d'écran.
 *
 * ⚠️ **L'invisibilité du `<p>` est DÉRIVÉE, jamais posée d'avance.** Elle
 * n'est appliquée qu'après un `draw()` réussi, et retirée dès qu'un dessin
 * échoue ou que le contexte est perdu. Ce n'est pas de la prudence
 * décorative : `measure()` réassigne `canvas.width`, ce qui efface le canvas,
 * et les deux re-mesures (chargement de la fonte, redimensionnement) sont
 * asynchrones. Poser la transparence une fois et parier sur le dessin, c'est
 * accepter qu'une erreur avalée laisse un canvas vide **sur** un paragraphe
 * transparent — citation disparue, sans rien en console.
 *
 * ⚠️ Chaque cellule connaît **la ligne à laquelle elle appartient**, établie
 * en rasterisant les lignes une à une à la mesure. Ce n'est pas un luxe : dès
 * que l'interligne descend sous ~1,15, les boîtes de deux lignes voisines se
 * chevauchent, et un découpage par bandes horizontales attribuerait le jambage
 * d'un « g » à la ligne du dessous — qui n'est pas au même point du rideau.
 * Le jambage se peindrait alors dans la mauvaise couleur. Ces mêmes passes
 * servent à composer le calque d'encre, donc elles ne coûtent rien de plus.
 *
 * ⚠️ Le texte du canvas doit tomber au pixel près sur la mise en page du DOM,
 * puisqu'il la remplace. D'où la ligne de base déduite du ratio
 * ascendante/descendante de la fonte, et l'échelle horizontale calée mot par
 * mot sur la largeur mesurée. Vérifié sur ce projet : `font-feature-settings:
 * "ss01","ss02"` (posé sur `body`) ne change aucune métrique de Host Grotesk,
 * et `measureText` rend exactement la largeur du DOM.
 *
 * ── Frontière du composant ─────────────────────────────────────────────────
 *
 * **La typographie vient du DOM, l'accent vient d'une prop.** Corps, graisse,
 * interligne, tracking, largeur, alinéa et couleur du texte révélé sont lus
 * sur le wrapper via `getComputedStyle` — donc réglés par le `className` de
 * l'appelant, comme n'importe quel bloc de texte. Seules les deux couleurs que
 * le DOM ne peut pas porter (le texte pas encore lu, et la bande) sont des
 * props. Une version antérieure soudait ces deux-là en dur tout en exposant la
 * troisième : l'appelant ne pouvait pas changer la couleur du texte, même par
 * le canal prévu pour ça.
 */

/* ── Réglages ──────────────────────────────────────────────────────────── */
const T = {
  /** **TAILLE D'UN PIXEL**, en fraction du corps. 0,058 donne ~5 px sur un
   *  corps de 86 px. Descendre le rend plus fin et plus nombreux — mais pas
   *  moins quadrillé : pour ça, voir GRAIN. */
  pixelSize: 0.058,

  /** **LONGUEUR DE LA BANDE** de couleur, en cadratins (multiples du corps).
   *  C'est LE réglage qui décide si l'effet lit comme une vague ou comme un
   *  scanner : une bande courte traverse chaque mot en un éclair, une bande
   *  longue en tient plusieurs à la fois. Mesuré sur la référence : ~12. */
  bandLength: 14.5,

  /** **ÉPAISSEUR DE LA BANDE**, en fraction de la hauteur de lettre. 1 = la
   *  couleur remplit toute la lettre ; 0,38 = un ruban qui n'en occupe qu'un
   *  bon tiers.
   *
   *  ⚠️ L'ANGLE des bords se DÉDUIT de ces deux valeurs, il ne se règle pas
   *  directement : la montée vaut `bandLength / (1 + bandThickness)`, donc
   *  l'angle vaut `atan(hauteur de lettre / montée)`. Allonger la bande
   *  l'aplatit, la raccourcir la redresse. Sur la référence il tombe à ~5°.
   *  Une bande à 45° serait forcément courte — donc redonnerait l'effet
   *  scanner. Les deux demandes se contredisent, et c'est l'étalement qui
   *  l'emporte chez eux. */
  bandThickness: 0.38,

  /** **AVANCE** : sur quelle distance, DEVANT la bande, les premiers pixels
   *  apparaissent déjà (en cadratins). C'est ce qui fait que la trame précède
   *  la couleur au lieu d'arriver avec elle. */
  leadFade: 2.5,

  /** **TRAÎNE** : sur quelle distance, DERRIÈRE la bande, les derniers pixels
   *  s'éteignent un à un (en cadratins). Une longue traîne disperse les
   *  pixels au lieu de les concentrer, c'est le second remède à l'effet de
   *  balayage avec la longueur de bande. */
  trailFade: 6,

  /** **GRAIN** : désordre ajouté au tramage. 0 = tramage nu, 1 = franchement
   *  bruité. C'est le seul réglage qui répond à « ça fait encore une grille »
   *  (monter) ou « c'est devenu du grain de photo » (descendre).
   *
   *  ⚠️ Ne pas confondre avec `pixelSize` : une trame plus grosse rend la
   *  maille PLUS visible, pas moins. Si le quadrillage se voit, c'est ici
   *  qu'on corrige, pas là-bas. */
  grain: 0.4,

  /** Décalage horizontal du front, par colonne (× pixel). Minuscule : il
   *  empêche seulement les colonnes voisines de basculer à l'unisson. */
  jitterX: 0.35,
} as const;

/** *Interleaved gradient noise* — le seuil de tramage. Ne se répète pas, ne
 *  privilégie aucune direction, et reste bien réparti — contrairement au bruit
 *  blanc, qui fait des paquets et des trous, et à Bayer, dont la maille se
 *  répète tous les 8 pixels et saute aux yeux. */
function ign(x: number, y: number) {
  const v = 0.06711056 * x + 0.00583715 * y;
  const f = v - Math.floor(v);
  const w = 52.9829189 * f;
  return w - Math.floor(w);
}

/** Tuile de désordre, dans [-1, 1]. Côté **premier** pour ne se recaler ni sur
 *  la grille ni sur l'IGN. Constante de module : c'est ce qui garantit que le
 *  grain est identique d'une mesure à l'autre, mieux qu'un générateur
 *  re-semé à chaque fois. Sert deux fois — le grain du tramage, et le
 *  décalage horizontal des colonnes — avec des foulées différentes. */
const NOISE_N = 67;
const NOISE = (() => {
  const a = new Float32Array(NOISE_N * NOISE_N);
  let x = 0x2545f491;
  for (let i = 0; i < a.length; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    a[i] = ((x >>> 0) / 4294967296) * 2 - 1;
  }
  return a;
})();

const noiseAt = (a: number, b: number) =>
  NOISE[(a % NOISE_N) * NOISE_N + (b % NOISE_N)];

type Word = {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  line: number;
};

/** Options de rastérisation, constantes pour toute une mesure. */
type Raster = {
  font: string;
  letterSpacing: string | null;
  /** Part de la boîte inline qui est au-dessus de la ligne de base. */
  ascRatio: number;
  dpr: number;
  padDev: number;
  wDev: number;
  hDev: number;
};

type Scene = {
  cols: number;
  rows: number;
  /** Le texte en blanc, plein format. Seul calque de texte. */
  ink: HTMLCanvasElement;
  maskCv: HTMLCanvasElement;
  maskCx: CanvasRenderingContext2D;
  maskImg: ImageData;
  /** Vue 32 bits sur le masque : une écriture par cellule. */
  maskU32: Uint32Array;
  /** Les seules cellules qui contiennent de l'encre. Trois tableaux parallèles
   *  indexés par cellule vivante — tout ce dont `draw` a besoin, sans une
   *  seule lecture de propriété d'objet dans la boucle. */
  cellOff: Int32Array;
  cellAdv: Float32Array;
  /** Seuils précalculés : la cellule est « à lire » sous le premier, « lue »
   *  au-dessus du second, colorée entre les deux. */
  leadCut: Float32Array;
  trailCut: Float32Array;
  /** Couleurs préempaquetées en RGBA 32 bits. */
  cPending: number;
  cAccent: number;
  cRevealed: number;
  a0: number;
  span: number;
  /** Signature de la mise en page : si elle n'a pas bougé, re-mesurer ne
   *  produirait que la même scène au prix de huit rastérisations. */
  sig: string;
  /** Tout ce qu'il faut relâcher — les backing stores de canvas vivent hors
   *  du tas JS, le GC n'a presque aucune pression pour les récupérer. */
  owned: HTMLCanvasElement[];
};

/** Empaquette une couleur en RGBA 32 bits, dans l'ordre d'octets de la
 *  plateforme — d'où le détour par une vue, plutôt qu'un décalage en dur. */
function packRgba(r: number, g: number, b: number) {
  const u8 = new Uint8Array(4);
  new Uint32Array(u8.buffer)[0] = 0;
  u8[0] = r;
  u8[1] = g;
  u8[2] = b;
  u8[3] = 255;
  return new Uint32Array(u8.buffer)[0];
}

/** Normalise n'importe quelle écriture CSS d'une couleur en `[r, g, b]`, en
 *  laissant le navigateur faire l'analyse. Rend `null` si la valeur n'est pas
 *  une couleur — un jeton absent ne doit pas peindre une couleur approximative,
 *  il doit empêcher de peindre. */
function parseColor(cx: CanvasRenderingContext2D, css: string) {
  if (!css) return null;
  const read = (sentinel: string) => {
    cx.fillStyle = sentinel;
    cx.fillStyle = css;
    return cx.fillStyle;
  };
  const a = read("#000000");
  if (a !== read("#ffffff")) return null;
  const m = /^#([0-9a-f]{6})$/i.exec(String(a));
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

/** Peint des mots en blanc dans un contexte donné, aux positions choisies par
 *  le DOM. Un seul contrat, une seule sortie — la version précédente créait un
 *  canvas *ou* dessinait dans celui qu'on lui passait, et rendait alors `null`
 *  pour deux raisons sans rapport. */
function paintWords(
  cx: CanvasRenderingContext2D,
  words: Word[],
  o: Raster,
  scales: number[],
) {
  cx.font = o.font;
  if (o.letterSpacing !== null) {
    try {
      (
        cx as CanvasRenderingContext2D & { letterSpacing: string }
      ).letterSpacing = o.letterSpacing;
    } catch {
      /* moteur sans l'API — l'échelle par mot rattrape l'écart */
    }
  }
  cx.textBaseline = "alphabetic";
  cx.fillStyle = "#fff";
  for (let i = 0; i < words.length; i++) {
    const b = words[i];
    cx.save();
    cx.translate(b.x * o.dpr, (b.y + b.h * o.ascRatio) * o.dpr + o.padDev);
    cx.scale(scales[i], 1);
    cx.fillText(b.text, 0, 0);
    cx.restore();
  }
}

/** Réducteur réutilisable : ramène un canvas plein format à la grille par
 *  demi-pas successifs, et rend la couche alpha.
 *
 *  Les demi-pas ne sont pas une coquetterie — un `drawImage` qui divise par 20
 *  d'un coup crénelle, le filtre du navigateur n'échantillonnant pas toute la
 *  source, et une cellule sur deux perdrait son encre. La pyramide est
 *  allouée **une fois** et réutilisée pour toutes les lignes : la version
 *  précédente la reconstruisait par ligne, soit vingt canvas par mesure. */
function makeReducer(wDev: number, hDev: number, cols: number, rows: number) {
  const steps: { cv: HTMLCanvasElement; cx: CanvasRenderingContext2D }[] = [];
  let w = wDev;
  let h = hDev;
  while (w > cols * 2 || h > rows * 2) {
    w = w > cols * 2 ? Math.max(cols, Math.round(w / 2)) : w;
    h = h > rows * 2 ? Math.max(rows, Math.round(h / 2)) : h;
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const cx = cv.getContext("2d");
    if (!cx) return null;
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = "high";
    steps.push({ cv, cx });
  }
  const out = document.createElement("canvas");
  out.width = cols;
  out.height = rows;
  const ox = out.getContext("2d", { willReadFrequently: true });
  if (!ox) return null;
  ox.imageSmoothingEnabled = true;
  ox.imageSmoothingQuality = "high";

  return {
    reduce(src: HTMLCanvasElement) {
      let cur: HTMLCanvasElement = src;
      for (const s of steps) {
        s.cx.clearRect(0, 0, s.cv.width, s.cv.height);
        s.cx.drawImage(cur, 0, 0, cur.width, cur.height, 0, 0, s.cv.width, s.cv.height);
        cur = s.cv;
      }
      ox.clearRect(0, 0, cols, rows);
      ox.drawImage(cur, 0, 0, cur.width, cur.height, 0, 0, cols, rows);
      return ox.getImageData(0, 0, cols, rows).data;
    },
    canvases: [...steps.map((s) => s.cv), out],
  };
}

/** Libère les backing stores. Sans ça, un glissé de redimensionnement peut
 *  abandonner une scène par frame — et chaque scène pèse des dizaines de Mo
 *  hors du tas JS, que le GC n'est pas pressé de reprendre. */
function releaseScene(s: Scene | null) {
  if (!s) return;
  for (const cv of s.owned) {
    cv.width = 0;
    cv.height = 0;
  }
}

export default function PixelCurtainReveal({
  children,
  className,
  pendingToken,
  accentToken,
  start = "top 95%",
  end = "top 8%",
}: {
  children: string;
  className?: string;
  /** Jeton CSS de la couleur du texte **pas encore lu**. */
  pendingToken: string;
  /** Jeton CSS de la couleur de **la bande**.
   *
   *  ⚠️ Deux conditions, et il faut les DEUX : **presque la clarté du texte
   *  révélé** (sinon la couture entre pixels colorés et texte se voit) et un
   *  **chroma élevé** (sinon la couleur lit comme un blanc sale). Une teinte
   *  proche de celle du texte est acceptable — la référence n'est qu'à 33° de
   *  son blanc — mais un chroma faible ne l'est pas. Voir `--color-lime-eclat`
   *  dans `globals.css`, dont le commentaire porte les mesures. */
  accentToken: string;
  start?: string;
  end?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tokens = children.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const ctx = canvas.getContext("2d");
        const para = wrap.querySelector("p");
        if (!ctx || !para) return;
        ctx.imageSmoothingEnabled = false;

        let scene: Scene | null = null;
        const state = { p: 0 };

        /** Le texte redevient visible dès que le canvas ne peint plus. */
        const showDomText = () => {
          para.style.color = "";
          canvas.hidden = true;
        };
        const hideDomText = () => {
          para.style.color = "transparent";
          canvas.hidden = false;
        };

        const measure = (): Scene | null => {
          const wrapRect = wrap.getBoundingClientRect();
          const wCss = wrapRect.width;
          const hCss = wrapRect.height;
          if (wCss < 8 || hCss < 8) return null;

          const cs = getComputedStyle(wrap);
          const fsCss = parseFloat(cs.fontSize) || 16;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          const root = getComputedStyle(document.documentElement);
          const pendingCss = readToken(pendingToken, root);
          const accentCss = readToken(accentToken, root);
          const sig = [wCss, hCss, fsCss, dpr, cs.color, pendingCss, accentCss]
            .join("|");
          if (scene && scene.sig === sig) return scene;

          const probe = document.createElement("canvas").getContext("2d");
          if (!probe) return null;
          const rgbPending = parseColor(probe, pendingCss);
          const rgbAccent = parseColor(probe, accentCss);
          const rgbRevealed = parseColor(probe, cs.color);
          if (!rgbPending || !rgbAccent || !rgbRevealed) return null;

          const spans = Array.from(
            wrap.querySelectorAll<HTMLElement>("[data-pw]"),
          );
          if (!spans.length) return null;

          const words: Word[] = spans
            .map((el) => {
              const r = el.getBoundingClientRect();
              return {
                x: r.left - wrapRect.left,
                y: r.top - wrapRect.top,
                w: r.width,
                h: r.height,
                text: el.textContent ?? "",
                line: 0,
              };
            })
            .filter((b) => b.w > 0 && b.h > 0)
            .sort((a, b) => a.y - b.y || a.x - b.x);
          if (!words.length) return null;

          // Regroupement en lignes : deux mots partagent une ligne si leurs
          // sommets tiennent dans une demi-hauteur de glyphe.
          type Raw = { top: number; bot: number; left: number; right: number };
          const raws: Raw[] = [];
          let inkOver = 0;
          for (const b of words) {
            const last = raws[raws.length - 1];
            if (last && b.y < last.top + b.h * 0.5) {
              last.top = Math.min(last.top, b.y);
              last.bot = Math.max(last.bot, b.y + b.h);
              last.left = Math.min(last.left, b.x);
              last.right = Math.max(last.right, b.x + b.w);
            } else {
              raws.push({ top: b.y, bot: b.y + b.h, left: b.x, right: b.x + b.w });
            }
            b.line = raws.length - 1;
            // Débordement de l'encre hors du bloc : avec un interligne serré,
            // la boîte de la première ligne monte au-dessus et celle de la
            // dernière descend en dessous. On le mesure au lieu de le deviner.
            inkOver = Math.max(inkOver, -b.y, b.y + b.h - hCss);
          }

          const cell = Math.max(2, Math.round(fsCss * T.pixelSize * dpr));
          const padCss = Math.max((cell * 3) / dpr, inkOver + 6);
          const padDev = Math.ceil((padCss * dpr) / cell) * cell;
          const cols = Math.ceil((wCss * dpr) / cell);
          const rows = Math.ceil((hCss * dpr + 2 * padDev) / cell);
          const wDev = cols * cell;
          const hDev = rows * cell;

          const lsNum = parseFloat(cs.letterSpacing);
          const raster: Raster = {
            font: `${cs.fontStyle} ${cs.fontWeight} ${fsCss * dpr}px ${cs.fontFamily}`,
            letterSpacing: Number.isFinite(lsNum) ? `${lsNum * dpr}px` : null,
            ascRatio: 0,
            dpr,
            padDev,
            wDev,
            hDev,
          };
          probe.font = raster.font;
          const fm = probe.measureText("Hxpg");
          const asc = fm.fontBoundingBoxAscent || fsCss * dpr * 0.8;
          const desc = fm.fontBoundingBoxDescent || fsCss * dpr * 0.2;
          // Ratio, pas valeur absolue : la boîte inline d'un `<span>` vaut
          // ascendante + descendante de la fonte, quel que soit le nom que le
          // moteur leur donne. Le rapport est le même des deux côtés.
          raster.ascRatio = asc / (asc + desc);

          // Une seule mesure de largeur par mot — `measureText` déclenche le
          // shaping, ce n'est pas gratuit, et les échelles ne dépendent pas de
          // la ligne rendue.
          if (raster.letterSpacing !== null) {
            try {
              (
                probe as CanvasRenderingContext2D & { letterSpacing: string }
              ).letterSpacing = raster.letterSpacing;
            } catch {
              /* ignoré */
            }
          }
          const scales = words.map((b) => {
            const mw = probe.measureText(b.text).width;
            return mw > 0.5 ? (b.w * dpr) / mw : 1;
          });

          const ink = document.createElement("canvas");
          ink.width = wDev;
          ink.height = hDev;
          const inkCx = ink.getContext("2d");
          const solo = document.createElement("canvas");
          solo.width = wDev;
          solo.height = hDev;
          const soloCx = solo.getContext("2d");
          const reducer = makeReducer(wDev, hDev, cols, rows);
          if (!inkCx || !soloCx || !reducer) return null;

          /* Lignes, et à quelle ligne appartient chaque cellule.
             On rasterise les lignes une à une : c'est la seule façon d'être
             juste quand les boîtes se chevauchent. La même passe compose le
             calque d'encre, donc elle ne coûte rien de plus. */
          const owner = new Int16Array(cols * rows).fill(-1);
          const bestInk = new Uint8Array(cols * rows);
          const lineAdv: number[] = [];
          const lineLeft: number[] = [];
          const lineInkBot: number[] = [];
          const lineInvH: number[] = [];
          let advStart = 0;
          let nInk = 0;

          for (let i = 0; i < raws.length; i++) {
            const r = raws[i];
            const left = r.left * dpr;
            lineAdv.push(advStart);
            lineLeft.push(left);
            lineInkBot.push(r.bot * dpr + padDev);
            lineInvH.push(1 / Math.max(1, (r.bot - r.top) * dpr));
            advStart += Math.max(1, r.right * dpr - left);

            soloCx.clearRect(0, 0, wDev, hDev);
            const idx: number[] = [];
            const sub = words.filter((wd, k) => {
              if (wd.line !== i) return false;
              idx.push(k);
              return true;
            });
            paintWords(soloCx, sub, raster, idx.map((k) => scales[k]));
            inkCx.drawImage(solo, 0, 0);

            const g = reducer.reduce(solo);
            for (let k = 0; k < owner.length; k++) {
              const v = g[k * 4 + 3];
              if (v > 6 && v > bestInk[k]) {
                if (owner[k] < 0) nInk++;
                bestInk[k] = v;
                owner[k] = i;
              }
            }
          }

          // Géométrie dérivée des deux réglages lisibles. La montée est la
          // distance qu'il faut à un niveau pour grimper toute la hauteur de
          // lettre ; le retard est l'écart entre les deux niveaux, donc
          // l'épaisseur du ruban. Leur somme fait la longueur de la bande.
          const em = fsCss * dpr;
          const rise = (T.bandLength * em) / (1 + T.bandThickness);
          const lag = T.bandLength * em - rise;
          const softLead = Math.max(0.05, (T.leadFade * em) / rise);
          const softTrail = Math.max(0.05, (T.trailFade * em) / rise);

          /* Un seuil par cellule vivante, tout précalculé.
             Les deux comparaisons de `draw` sont algébriquement des constantes
             de cellule : `(xb/rise − hy)/softLead + 0.5 ≤ th` équivaut à
             `xb ≤ rise·(hy + (th−0.5)·softLead)`. Les sortir d'ici retire cinq
             divisions, un `ign()` et deux `Math.floor` PAR CELLULE ET PAR
             FRAME — de l'ordre de dix millions d'opérations par seconde
             gaspillées sur un texte de cette taille. */
          const cellOff = new Int32Array(nInk);
          const cellAdv = new Float32Array(nInk);
          const leadCut = new Float32Array(nInk);
          const trailCut = new Float32Array(nInk);
          const jitter = T.jitterX * cell;
          let startA = Infinity;
          let endA = -Infinity;
          let n = 0;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const k = r * cols + c;
              const li = owner[k];
              if (li < 0) continue;
              const hy = (lineInkBot[li] - (r + 0.5) * cell) * lineInvH[li];
              const th = ign(c, r) + noiseAt(c, r) * T.grain;
              const adv =
                lineAdv[li] +
                ((c + 0.5) * cell - lineLeft[li]) +
                noiseAt(li * 7 + c, r * 13 + 5) * jitter;
              const lead = rise * (hy + (th - 0.5) * softLead);
              const trail = lag + rise * (hy + (th - 0.5) * softTrail);
              cellOff[n] = k;
              cellAdv[n] = adv;
              leadCut[n] = lead;
              trailCut[n] = trail;
              if (adv + lead < startA) startA = adv + lead;
              if (adv + trail > endA) endA = adv + trail;
              n++;
            }
          }
          if (!n) return null;

          const maskCv = document.createElement("canvas");
          maskCv.width = cols;
          maskCv.height = rows;
          const maskCx = maskCv.getContext("2d");
          if (!maskCx) return null;
          const maskImg = maskCx.createImageData(cols, rows);

          canvas.width = wDev;
          canvas.height = hDev;
          canvas.style.width = `${wDev / dpr}px`;
          canvas.style.height = `${hDev / dpr}px`;
          canvas.style.top = `${-padDev / dpr}px`;
          ctx.imageSmoothingEnabled = false;

          for (const cv of reducer.canvases) {
            cv.width = 0;
            cv.height = 0;
          }
          solo.width = 0;
          solo.height = 0;

          // Marge d'un pixel de bande de chaque côté : à `p = 0` aucune
          // cellule n'a commencé, à `p = 1` toutes ont fini. Les bornes sont
          // les extrêmes RÉELS des seuils, pas une estimation — l'ancienne
          // borne conservatrice tronquait la traîne dès que `grain` montait.
          const marge = cell * 2;
          return {
            cols,
            rows,
            ink,
            maskCv,
            maskCx,
            maskImg,
            maskU32: new Uint32Array(maskImg.data.buffer),
            cellOff,
            cellAdv,
            leadCut,
            trailCut,
            cPending: packRgba(...rgbPending),
            cAccent: packRgba(...rgbAccent),
            cRevealed: packRgba(...rgbRevealed),
            a0: startA - marge,
            span: endA - startA + 2 * marge,
            sig,
            owned: [ink, maskCv],
          };
        };

        const draw = (s: Scene, A: number) => {
          const m = s.maskU32;
          const off = s.cellOff;
          const adv = s.cellAdv;
          const lead = s.leadCut;
          const trail = s.trailCut;
          const pending = s.cPending;
          const accent = s.cAccent;
          const revealed = s.cRevealed;

          for (let k = 0; k < off.length; k++) {
            const xb = A - adv[k];
            m[off[k]] =
              xb <= lead[k] ? pending : xb > trail[k] ? revealed : accent;
          }
          s.maskCx.putImageData(s.maskImg, 0, 0);

          // La couleur d'abord, agrandie au plus proche voisin — d'où l'arête
          // franche du pixel. Puis l'intersection avec l'encre, qui redonne la
          // forme des lettres et leur anticrénelage.
          ctx.globalCompositeOperation = "copy";
          ctx.drawImage(s.maskCv, 0, 0, s.cols, s.rows, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "destination-in";
          ctx.drawImage(s.ink, 0, 0);
          ctx.globalCompositeOperation = "source-over";
        };

        /** Toute peinture passe par ici : si elle échoue, le texte du DOM
         *  reprend la main plutôt que de laisser un canvas vide sur un
         *  paragraphe transparent. */
        const render = () => {
          if (!scene) return;
          try {
            draw(scene, scene.a0 + state.p * scene.span);
            hideDomText();
          } catch {
            showDomText();
          }
        };

        const remeasure = () => {
          let next: Scene | null = null;
          try {
            next = measure();
          } catch {
            next = null;
          }
          if (!next) {
            showDomText();
            return;
          }
          if (next !== scene) releaseScene(scene);
          scene = next;
          render();
        };

        remeasure();
        // Les métriques de la fonte web arrivent après le premier rendu : la
        // césure change, donc la hauteur du bloc — et donc les positions de
        // TOUS les triggers situés en dessous. `refreshWhenIdle` les recale
        // sans geler une glisse en cours.
        document.fonts?.ready
          .then(() => {
            remeasure();
            refreshWhenIdle();
          })
          .catch(() => showDomText());

        const tl = gsap.timeline({
          scrollTrigger: { trigger: wrap, start, end, scrub: 0.55 },
          onUpdate: render,
        });
        tl.to(state, { p: 1, ease: "none", duration: 1 });

        let raf = 0;
        const ro = new ResizeObserver(() => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(remeasure);
        });
        ro.observe(wrap);

        // Un contexte perdu laisse un canvas blanc : rendre la main au DOM,
        // et re-mesurer quand il revient.
        const onLost = (e: Event) => {
          e.preventDefault();
          showDomText();
        };
        canvas.addEventListener("contextlost", onLost);
        canvas.addEventListener("contextrestored", remeasure);

        return () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          canvas.removeEventListener("contextlost", onLost);
          canvas.removeEventListener("contextrestored", remeasure);
          showDomText();
          releaseScene(scene);
          scene = null;
        };
      });

      return () => mm.revert();
    },
    { scope: wrapRef, dependencies: [start, end, children, pendingToken, accentToken] },
  );

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <p className="m-0">
        {tokens.map((w, i) => (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <span data-pw="">{w}</span>
          </Fragment>
        ))}
      </p>
      <canvas
        ref={canvasRef}
        aria-hidden
        hidden
        className="pointer-events-none absolute left-0"
      />
    </div>
  );
}
