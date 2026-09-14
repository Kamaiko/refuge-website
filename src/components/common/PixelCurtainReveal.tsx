"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, refreshWhenIdle } from "@/lib/gsap";
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
  /** **TAILLE D'UN PIXEL**, en fraction du corps. 0,052 donne ~4,5 px sur un
   *  corps de 86 px. Descendre le rend plus fin et plus nombreux — mais pas
   *  moins quadrillé : pour ça, voir GRAIN. */
  pixelSize: 0.052,

  /** **LONGUEUR DE LA BANDE** de couleur, en cadratins (multiples du corps).
   *  C'est LE réglage qui décide si l'effet lit comme une vague ou comme un
   *  scanner : une bande courte traverse chaque mot en un éclair, une bande
   *  longue en tient plusieurs à la fois.
   *
   *  ⚠️ **Ne se compare pas en cadratins d'un site à l'autre** — la valeur ne
   *  veut rien dire hors de son texte. La grandeur qui se compare est **la
   *  part de l'encre colorée à un instant donné**, mesurée sur des captures et
   *  classée en trois familles (à lire / ruban / lu) : elle ne dépend ni de la
   *  longueur du texte, ni du nombre de lignes, ni de la vitesse de scroll.
   *  Relevé le 2026-09-07 sur le bon bloc de produx.design — celui de « Where
   *  intent meets identity… », et non celui du footer, qui n'a aucune couleur
   *  et avait d'abord été mesuré par erreur :
   *
   *      produx          9,4 → 14,2 %   (moyenne 11,4 %)
   *      nous, à 14,5    5,8 →  8,1 %   (moyenne  6,9 %)  ← deux fois trop mince
   *      nous, à 24      9,3 → 11,9 %   (moyenne 11,1 %)  ← calé
   *
   *  ⚠️ **C'est ici que se corrige « le rideau va trop vite »**, pas dans la
   *  fenêtre de scroll. Mesuré : le rideau était DÉJÀ deux fois plus lent que
   *  la référence sur l'ensemble (6,3 contre 14,3 % de texte révélé par 100 px
   *  de scroll) et paraissait pourtant brusque — ce qu'on perçoit est la
   *  vitesse du ruban SUR CHAQUE MOT, et une bande deux fois plus courte le
   *  traverse deux fois plus vite. Allonger la fenêtre étale l'ensemble sans
   *  élargir la vague. */
  bandLength: 24,

  /** **ÉPAISSEUR DE LA BANDE**, en fraction de la hauteur de lettre. 1 = la
   *  couleur remplit toute la lettre ; 0,22 = une LIGNE mince qui la traverse.
   *  Descendu de 0,38 à 0,22 le 2026-09-08 : « la ligne lime un peu plus
   *  mince », demande de Patrick, et le mot juste est bien LIGNE, pas masse.
   *
   *  ⚠️ L'ANGLE des bords se DÉDUIT de ces deux valeurs, il ne se règle pas
   *  directement : la montée vaut `bandLength / (1 + bandThickness)`, donc
   *  l'angle vaut `atan(hauteur de lettre / montée)`. Allonger la bande
   *  l'aplatit, la raccourcir la redresse. Sur la référence il tombe à ~5°.
   *  Une bande à 45° serait forcément courte — donc redonnerait l'effet
   *  scanner. Les deux demandes se contredisent, et c'est l'étalement qui
   *  l'emporte chez eux. */
  bandThickness: 0.22,

  /** **EFFILAGE DE LA QUEUE** : de combien le bord de fuite grimpe plus vite
   *  que le bord d'attaque. 0 = ruban à épaisseur constante ; au-dessus, un
   *  coin qui part à pleine épaisseur contre le gris et se referme au fil de
   *  sa course.
   *
   *  ⚠️ Sans ça, le ruban garde la même épaisseur du début à la fin, et loin
   *  derrière le front il reste de la couleur au milieu des lettres au lieu
   *  d'avoir été chassée par le haut. Mesuré : sur la référence, la hauteur
   *  moyenne des pixels colorés monte de 0,05 à 0,71 de la hauteur de lettre
   *  entre le front et la queue ; à épaisseur constante on n'obtenait que
   *  0,27 → 0,43, le ruban stagnant dans une bande médiane.
   *
   *  ⚠️ **0,3 est son plafond utile, et ce n'est PAS le levier pour monter la
   *  couleur** — celui-là est `montee`, plus bas. Mesuré le 2026-09-08 :
   *  porté à 0,38, `tailTaper` fait TOMBER la hauteur moyenne de la couleur
   *  (0,44 → 0,35), parce qu'il supprime les cellules hautes du bout de course
   *  au lieu de les peupler. Avec les valeurs actuelles, l'épaisseur au bout
   *  de la course — `bandThickness + 1 − 1/(1 − tailTaper)` — est déjà
   *  négative : le ruban se referme entièrement avant la fin, et c'est voulu. */
  tailTaper: 0.3,

  // Note de réglage — les deux valeurs ci-dessus se contrarient : refermer
  // vite le ruban (tailTaper haut) le fait bien monter, mais vide la queue de
  // ses pixels. Re-mesuré le 2026-09-08, et c'est pire que « ça ne monte plus
  // beaucoup » : porté de 0,30 à 0,38, la hauteur moyenne de la couleur
  // TOMBE (0,44 → 0,35), parce qu'on supprime les cellules hautes du bout de
  // course au lieu de les peupler. 0,30 est le plafond utile.
  //
  // ⚠️ Pour condenser la couleur vers le haut, le levier n'est PAS ici : c'est
  // `montee`, plus bas. Celui-là monte la couleur sans vider la queue.

  /** **AVANCE** : sur quelle distance, DEVANT la bande, les premiers pixels
   *  apparaissent déjà (en cadratins). C'est ce qui fait que la trame précède
   *  la couleur au lieu d'arriver avec elle.
   *
   *  ⚠️ C'est aussi le flou du bord entre le gris et la couleur. Trop grand,
   *  des cellules restent grises loin SOUS le niveau atteint par le rideau —
   *  du gris qui « traîne en bas » au lieu de rester groupé en haut. */
  leadFade: 0.8,

  /** **TRAÎNE** : sur quelle distance, DERRIÈRE la bande, les derniers pixels
   *  s'éteignent un à un (en cadratins).
   *
   *  ⚠️ C'est le réglage de la DISPERSION, avec `leadFade` : une longue traîne
   *  sème les pixels loin derrière le ruban au lieu de les tenir groupés.
   *  Ramenée de 6 à 3 le 2026-09-08 (« un peu moins dispersé ») — mesuré, le
   *  ruban est passé de 546 à ~390 colonnes actives sur la même course. */
  trailFade: 3,

  /** **GRAIN** : désordre ajouté au tramage. 0 = tramage nu, 1 = franchement
   *  bruité. C'est le seul réglage qui répond à « ça fait encore une grille »
   *  (monter) ou « c'est devenu du grain de photo » (descendre).
   *
   *  ⚠️ Ne pas confondre avec `pixelSize` : une trame plus grosse rend la
   *  maille PLUS visible, pas moins. Si le quadrillage se voit, c'est ici
   *  qu'on corrige, pas là-bas. */
  grain: 0.4,

  /** **COURBE DE MONTÉE** des deux niveaux dans la lettre. 1 = montée
   *  régulière, la couleur traverse la lettre à vitesse constante et sa
   *  hauteur moyenne ne peut alors PAS dépasser ~0,5 — c'est une limite du
   *  modèle, pas un réglage manqué. Au-dessus de 1, les niveaux grimpent vite
   *  puis ralentissent : la couleur atteint le haut tôt et y séjourne, ce qui
   *  la condense vers le haut des lettres.
   *
   *  ⚠️ C'est le SEUL levier qui monte la couleur sans vider la queue —
   *  `tailTaper`, malgré son nom, fait l'inverse au-delà de 0,3 (voir sa
   *  note). Mesuré le 2026-09-08 : 0,44 → 0,50 de hauteur moyenne, queue à
   *  0,67. */
  montee: 2.6,

  /** Décalage horizontal du front, par colonne (× pixel). Minuscule : il
   *  empêche seulement les colonnes voisines de basculer à l'unisson. */
  jitterX: 0.35,
} as const;

/* ── Entrée en scène ───────────────────────────────────────────────────── */
/** **LES LIGNES MONTENT ET SE REDRESSENT.** Chaque ligne arrive de sous sa
 *  place, légèrement inclinée vers la droite, et se redresse en se posant.
 *  Elles partent l'une après l'autre, dans l'ordre de lecture, une seule fois.
 *
 *  ⚠️ **Le mouvement se joue DANS LE CANVAS, jamais dans le DOM**, et c'est la
 *  contrainte qui commande tout le reste. Le texte visible est peint sur le
 *  canvas : animer les mots du `<p>` ne déplacerait rien de ce qu'on voit. On
 *  découpe donc le rendu en BANDES — une par ligne, préparées à la mesure — et
 *  on les pose une à une avec leur propre montée et leur propre inclinaison.
 *  La mise en page, elle, ne bouge pas d'un pixel.
 *
 *  ⚠️ Trois pistes ont été essayées puis jetées les 2026-09-07/08, chacune
 *  pour une raison qu'il ne faut pas redécouvrir :
 *
 *  - un MASQUE PAR MOT, le geste de `RevealText` dans `adjointe-virtuelle`,
 *    que Patrick citait en modèle. **Incompatible avec cette citation** :
 *    envelopper chaque mot dans un `inline-block` fait passer le paragraphe de
 *    353 à **1322 px** de haut, parce que la boîte de la fonte (115 px)
 *    déborde d'une ligne serrée à 88 px et que l'inline-block la fait compter
 *    dans le flux. Seul « tout en inline » préserve la page ;
 *  - un GLISSEMENT du bloc entier (translation + fondu) : correct, mais banal ;
 *  - une APPARITION PAR LA TRAME (les pixels se densifient jusqu'à former les
 *    lettres) : jolie, mais redondante — le rideau dit déjà « pixels », et
 *    l'entrée le répétait au lieu d'ajouter un geste. */
const E = {
  /** **MONTÉE** de chaque ligne, en cadratins : d'où elle part sous sa place. */
  monte: 0.42,

  /** **INCLINAISON** de départ, en degrés, côté droit vers le bas. Elle se
   *  résorbe pendant la montée, si bien que la ligne se **redresse** en se
   *  posant.
   *
   *  ⚠️ Reste petite pour une raison mesurable : la rotation se fait autour du
   *  centre de la ligne, donc à 1,5° sur un bloc de 1300 px les extrémités
   *  montent et descendent déjà de 17 px. Au-delà, les lignes voisines se
   *  croisent avant d'être posées. */
  tilt: 1.5,

  /** **DURÉE** d'une ligne — une proportion, pas des secondes : durée et
   *  cascade se répartissent sur `entreeCourse` pixels de scroll. */
  duration: 0.9,

  /** **DURÉE TOTALE DE LA CASCADE** — l'écart entre le départ de la première
   *  ligne et celui de la dernière, en proportion de la course d'entrée. Exprimée en TOTAL, pas en écart entre deux
   *  lignes : le même texte fait quatre lignes sur un grand écran et DIX sur un
   *  téléphone, et un écart fixe y produirait une cascade deux fois et demie
   *  plus longue. */
  cascade: 0.42,

  /** Une arrivée qui se pose : décélération franche, sans rebond. */
  ease: "expo.out",

  /** **COURSE DE L'ENTRÉE**, en pixels de scroll : les lignes se posent
   *  pendant que la page avance d'autant, puis le rideau prend le relais
   *  exactement là.
   *
   *  ⚠️ Une course, jamais une durée : une entrée jouée en temps fait dépendre
   *  le départ du rideau de la vitesse de scroll, jusqu'à le jouer hors écran
   *  quand on scrolle vite. */
  entreeCourse: 330,

  /** **LISSAGE** — le `scrub` de l'entrée ET du rideau : `true`, aucun amorti
   *  ajouté. Lenis lisse déjà le scroll ; un `scrub` en secondes par-dessus
   *  laisse la couleur en retard sur le bloc, d'autant plus qu'on scrolle vite. */
  lissage: true,

  /** **COURSE DU RIDEAU** après l'entrée, en pixels de scroll. Ne sert que
   *  lorsque l'entrée est active. Au-delà d'environ 900, sa fin se joue sur
   *  un texte déjà sorti par le haut. */
  course: 620,
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
  /** Une BANDE par ligne de texte, préparée seulement si l'entrée est
   *  demandée : l'encre de cette ligne, teintée dans la couleur du texte pas
   *  encore lu, dans un canvas à sa seule hauteur.
   *
   *  ⚠️ Découpées par LIGNE LOGIQUE, jamais par tranche horizontale. Les
   *  boîtes de deux lignes voisines se chevauchent à cet interligne (115 px
   *  d'encre pour 88 px de ligne) : un découpage géométrique couperait les
   *  jambages. Ici chaque bande est peinte depuis la rastérisation de SA
   *  ligne, donc un « g » qui descend sur la ligne suivante reste avec la
   *  sienne et voyage avec elle. */
  bandes: { cv: HTMLCanvasElement; top: number }[];
  /** Le cadratin en pixels DEVICE. Mesuré une fois ici plutôt que relu par un
   *  `getComputedStyle` ailleurs : la relecture force un recalcul de style, et
   *  redéduire le `dpr` depuis `canvas.width / clientWidth` donnait un second
   *  chemin qui ne coïncidait avec le premier que par construction. */
  em: number;
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
        s.cx.drawImage(
          cur,
          0,
          0,
          cur.width,
          cur.height,
          0,
          0,
          s.cv.width,
          s.cv.height,
        );
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
  narrow,
  entrance = false,
  entranceStart = "top bottom",
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
  /** Fenêtre de scroll de remplacement sous une largeur donnée.
   *
   *  ⚠️ Une seule fenêtre pour toutes les largeurs ne marche pas : le nombre
   *  de lignes change du simple au triple entre un téléphone et un grand
   *  écran, donc le même `start` en pourcentage de fenêtre ne montre pas la
   *  même chose. Mesuré sur ce projet — quatre lignes à 1600×900, **dix** à
   *  390×844 : à `top 95%`, le rideau part alors que 42 px du bloc seulement
   *  sont entrés à l'écran, et l'essentiel se joue hors de vue.
   *
   *  Passée en un objet plutôt qu'en trois props, pour que la requête et les
   *  bornes qu'elle commande ne puissent pas se désynchroniser. */
  narrow?: { query: string; start: string; end: string };
  /** Fait **arriver le bloc en scène** une fois, sans retour — sur
   *  `E.entreeCourse` pixels de scroll, jamais en temps ; le rideau part
   *  ensuite exactement où l'entrée finit. */
  entrance?: boolean;
  /** Où l'entrée se déclenche — par défaut dès que le bloc entre dans l'écran. */
  entranceStart?: string;
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

      // Deux requêtes, un seul corps. Sous `reduce` aucune ne correspond, donc
      // le corps ne s'exécute jamais et il n'y a pas de branche à défaire —
      // c'est la règle 1 de `docs/reduced-motion.md`. Sans `narrow`, la
      // seconde requête est inatteignable et le comportement est celui d'une
      // fenêtre unique.
      const MOTION = "(prefers-reduced-motion: no-preference)";
      // ⚠️ Les parenthèses autour du `not` ne sont pas décoratives : écrit
      // `A and not B`, le navigateur parse la requête entière en `not all` et
      // elle ne correspond JAMAIS — l'animation disparaîtrait en silence sur
      // grand écran. Vérifié dans Chrome. La grammaire des media queries
      // n'admet `not` à côté d'un `and` que parenthésé.
      mm.add(
        {
          large: narrow ? `${MOTION} and (not ${narrow.query})` : MOTION,
          etroit: narrow ? `${MOTION} and ${narrow.query}` : "not all",
        },
        (self) => {
          const win =
            narrow && self.conditions?.etroit
              ? { start: narrow.start, end: narrow.end }
              : { start, end };
          const ctx = canvas.getContext("2d");
          const para = wrap.querySelector("p");
          if (!ctx || !para) return;
          ctx.imageSmoothingEnabled = false;

          let scene: Scene | null = null;
          const state = { p: 0 };
          /** Vrai seulement PENDANT le vol des lignes : le canvas peint alors
           *  les bandes en mouvement, pas le rideau.
           *
           *  ⚠️ Faux au montage, et c'est essentiel. Posé vrai d'avance, tout
           *  `render()` d ici au déclenchement peignait un canvas VIDE tout en
           *  rendant le `<p>` transparent : la citation disparaissait, et son
           *  état caché vivait dans les pixels d un canvas — l'endroit le moins
           *  inspectable qui soit, et précisément ce que l'avertissement en
           *  tête de fichier interdit. */
          let entreeEnCours = false;
          /** Passe à vrai quand les lignes se sont posées, et ne redescend
           *  jamais : sert à ne pas reconstruire les bandes à chaque mesure
           *  ultérieure, ni à rejouer l'entrée. */
          let entreeFaite = !entrance;
          /** Position de chaque ligne pendant l'entrée — montée, inclinaison,
           *  opacité. Rempli au démarrage, vidé à la fin. */
          let vols: { y: number; rot: number; a: number }[] = [];
          /** Le déclencheur de l'entrée. Le rideau lit sa fin pour partir
           *  exactement là. */
          let entreeST: ScrollTrigger | null = null;

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
            const sig = [
              wCss,
              hCss,
              fsCss,
              dpr,
              cs.color,
              pendingCss,
              accentCss,
            ].join("|");
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
            type Raw = {
              top: number;
              bot: number;
              left: number;
              right: number;
            };
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
                raws.push({
                  top: b.y,
                  bot: b.y + b.h,
                  left: b.x,
                  right: b.x + b.w,
                });
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
            const bandes: { cv: HTMLCanvasElement; top: number }[] = [];
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
              paintWords(
                soloCx,
                sub,
                raster,
                idx.map((k) => scales[k]),
              );
              inkCx.drawImage(solo, 0, 0);

              // La bande de cette ligne, pour l'entrée en scène. On la prend
              // ICI parce que `solo` ne contient QUE cette ligne — c'est la
              // seule fois où elle est isolée.
              if (entrance && !entreeFaite) {
                // Marge fine : `r.top`/`r.bot` sont déjà la boîte inline
                // complète de la fonte, ascendante et descendante comprises.
                // Elle ne couvre donc que le débordement des glyphes.
                const marge = Math.ceil(fsCss * dpr * 0.06);
                const y0 = Math.max(0, Math.floor(r.top * dpr) + padDev - marge);
                const y1 = Math.min(hDev, Math.ceil(r.bot * dpr) + padDev + marge);
                const bande = document.createElement("canvas");
                bande.width = wDev;
                bande.height = Math.max(1, y1 - y0);
                const bcx = bande.getContext("2d");
                if (bcx) {
                  bcx.drawImage(solo, 0, -y0);
                  // Teinte : l'encre est blanche, on la repeint dans la
                  // couleur du texte pas encore lu — l état où le rideau
                  // prendra la ligne au moment de la poser.
                  bcx.globalCompositeOperation = "source-in";
                  bcx.fillStyle = pendingCss;
                  bcx.fillRect(0, 0, bande.width, bande.height);
                  bandes.push({ cv: bande, top: y0 });
                }
              }

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
            // Le bord de fuite a sa propre pente, plus raide, ce qui referme
            // le ruban en coin au lieu de le laisser filer à épaisseur
            // constante. Il se ferme complètement à
            // `xb = bandThickness · rise / tailTaper`.
            const riseTrail = rise * (1 - T.tailTaper);
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
                // `hm` : la hauteur passée à la courbe de montée. C'est elle
                // qui décide où la couleur SÉJOURNE dans la lettre.
                // ⚠️ Le signe se préserve à la main. `hy` passe SOUS zéro pour
                // les cellules qui descendent plus bas que la boîte de leur
                // ligne — un jambage de « g », l'anticrénelage du bas — et
                // `Math.pow(négatif, 2.6)` rend **NaN**, ce qui contaminerait
                // les deux seuils de la cellule et ferait mentir les
                // comparaisons de `draw()` : la cellule se peindrait dans un
                // état arbitraire, en bas des lettres, là où ça se voit.
                const hm =
                  hy < 0 ? -Math.pow(-hy, T.montee) : Math.pow(hy, T.montee);
                const lead = rise * (hm + (th - 0.5) * softLead);
                // Le bord de fuite grimpe PLUS VITE que le bord d'attaque —
                // d'où `riseTrail < rise`. C'est ce seul écart qui donne au
                // ruban sa forme de coin.
                const trail = lag + riseTrail * (hm + (th - 0.5) * softTrail);
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
              bandes,
              em,
              owned: [ink, maskCv, ...bandes.map((b) => b.cv)],
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
            ctx.drawImage(
              s.maskCv,
              0,
              0,
              s.cols,
              s.rows,
              0,
              0,
              canvas.width,
              canvas.height,
            );
            ctx.globalCompositeOperation = "destination-in";
            ctx.drawImage(s.ink, 0, 0);
            ctx.globalCompositeOperation = "source-over";
          };

          /** Ferme l'entrée : les lignes sont posées, le rideau prend la main.
           *
           *  ⚠️ Les bandes sont **relâchées ici**, pas au démontage. Elles pèsent
           *  ~2,5 Mo pièce hors du tas JS — quatre lignes sur un grand écran,
           *  dix sur un téléphone — et `releaseScene()` n'interviendrait qu au
           *  remplacement de la scène, qui n'arrive pas si personne ne
           *  redimensionne. Les garder, c'est retenir plus que toute la scène
           *  pour une entrée de quelques centaines de pixels de scroll. */
          const terminerEntree = () => {
            entreeEnCours = false;
            entreeFaite = true;
            vols = [];
            if (scene) {
              for (const b of scene.bandes) {
                b.cv.width = 0;
                b.cv.height = 0;
              }
              scene.bandes = [];
            }
            render();
          };

          /** Les lignes en vol : chacune est peinte depuis SA bande, montée de
           *  `y` et inclinée de `rot` autour de son propre centre. Rien n est
           *  recomposé — les bandes sont prêtes depuis la mesure, on ne fait que
           *  les poser. */
          const dessinerVol = (s: Scene) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx0 = canvas.width / 2;
            for (let i = 0; i < s.bandes.length; i++) {
              const b = s.bandes[i];
              const v = vols[i];
              if (!v || v.a <= 0.001) continue;
              // Posée : plus rien à transformer, on blitte tel quel. Avec un
              // ease sortant, la moitié des frames tombent ici — autant
              // d'éviter le rééchantillonnage d une rotation sous-pixel.
              if (v.a > 0.999 && Math.abs(v.rot) < 1e-4 && Math.abs(v.y) < 0.5) {
                ctx.drawImage(b.cv, 0, b.top);
                continue;
              }
              const cy0 = b.top + b.cv.height / 2;
              ctx.save();
              ctx.globalAlpha = v.a;
              ctx.translate(cx0, cy0 + v.y);
              ctx.rotate(v.rot);
              ctx.translate(-cx0, -cy0);
              ctx.drawImage(b.cv, 0, b.top);
              ctx.restore();
            }
          };

          /** Toute peinture passe par ici : si elle échoue, le texte du DOM
           *  reprend la main plutôt que de laisser un canvas vide sur un
           *  paragraphe transparent. */
          const render = () => {
            if (!scene) return;
            try {
              if (entreeEnCours) dessinerVol(scene);
              else draw(scene, scene.a0 + state.p * scene.span);
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
            // ⚠️ Une re-mesure PENDANT le vol reconstruit les bandes, mais les
            // objets que le tween anime, eux, visent l'ancien tableau : les
            // lignes resteraient figées jusqu'à la fin. Plutôt que de
            // resynchroniser deux états, on pose les lignes tout de suite —
            // un redimensionnement en pleine entrée est un cas de bord, et le
            // texte doit en sortir lisible, pas à moitié animé.
            if (entreeEnCours) {
              gsap.killTweensOf(vols);
              terminerEntree();
              return;
            }
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

          /** Le rideau, créé AU MONTAGE. Avec l'entrée, sa fenêtre part de la FIN
           *  de celle de l'entrée : une position de scroll, jamais un instant. Les
           *  deux fenêtres se suivent sans se chevaucher, si bien que le rideau ne
           *  peut pas être consommé pendant l'entrée.
           *
           *  ⚠️ Créé seulement à la fin de l'entrée, il partirait de 0 et
           *  rattraperait le scroll d'un bond, après un temps mort visible. */
          let tl: gsap.core.Timeline | null = null;
          const demarrerRideau = () => {
            if (tl) return;
            const st = entreeST;
            tl = gsap.timeline({
              scrollTrigger: {
                trigger: wrap,
                start: st ? () => st.end : win.start,
                end: st ? () => st.end + E.course : win.end,
                scrub: E.lissage,
              },
              onUpdate: render,
            });
            tl.to(state, { p: 1, ease: "none", duration: 1 });
          };
          if (!entrance) demarrerRideau();

          // ── Entrée en scène : les lignes montent et se redressent ──────
          // Chaque ligne arrive de sous sa place, légèrement inclinée vers la
          // droite, et se redresse en se posant. Elles partent l une après
          // l'autre, dans l ordre de lecture.
          //
          // ⚠️ Le mouvement se joue DANS LE CANVAS, jamais dans le DOM. Un
          // masque par mot a été essayé — le geste de RevealText dans
          // adjointe-virtuelle — et fait passer le paragraphe de 353 à 1322 px
          // de haut : la boîte de la fonte (115 px) déborde d une ligne serrée
          // à 88 px, et l inline-block la fait compter dans le flux. Ici la
          // mise en page ne bouge pas d un pixel.
          const premiere = scene as Scene | null;
          if (entrance && premiere) {
            vols = premiere.bandes.map(() => ({
              y: E.monte * premiere.em,
              rot: (E.tilt * Math.PI) / 180,
              a: 0,
            }));
            const lignes = gsap.to(vols, {
              y: 0,
              rot: 0,
              a: 1,
              duration: E.duration,
              ease: E.ease,
              stagger: { amount: E.cascade },
              paused: true,
              onUpdate: render,
              onComplete: terminerEntree,
            });
            // La course de scroll, au même `scrub` que le rideau. Elle ne pousse
            // les lignes que vers l'avant — une entrée ne se rejoue pas à
            // l'envers : la progression de `lignes` est le maximum déjà atteint.
            const course = { p: 0 };
            entreeST =
              gsap.to(course, {
                p: 1,
                ease: "none",
                onUpdate: () => {
                  if (entreeFaite || course.p <= lignes.progress()) return;
                  // Le canvas ne prend la main qu'au premier pixel de course, pas
                  // au montage : d'ici là c'est le rideau qui peint, à zéro.
                  entreeEnCours = true;
                  lignes.progress(course.p);
                },
                scrollTrigger: {
                  trigger: wrap,
                  start: entranceStart,
                  end: `+=${E.entreeCourse}`,
                  scrub: E.lissage,
                },
              }).scrollTrigger ?? null;
            demarrerRideau();
          }

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
        },
      );

      return () => mm.revert();
    },
    {
      scope: wrapRef,
      // `narrow` est déplié : passer l'objet ferait une référence neuve à
      // chaque rendu, donc un démontage complet de la scène pour rien.
      dependencies: [
        start,
        end,
        children,
        pendingToken,
        accentToken,
        narrow?.query,
        narrow?.start,
        narrow?.end,
        entrance,
        entranceStart,
      ],
    },
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
