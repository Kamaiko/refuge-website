import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Lit un jeton de couleur de `globals.css` au runtime.
 *
 *  Utile là où une valeur concrète est indispensable et où `var()` ne passe
 *  pas : GSAP ne sait pas tweener vers `var(--x)`, et l'API canvas encore
 *  moins. Le passer par ici garde la palette **single-source** dans
 *  `globals.css` au lieu d'en recopier les hex dans le JS — c'est exactement
 *  la duplication que `--color-tan-aquilon` a été créé pour supprimer.
 *
 *  Rend `""` si le jeton n'existe pas ; à l'appelant de décider quoi en
 *  faire. **Ne pas inventer de valeur de repli** : un repli en dur repose le
 *  hex qu'on venait d'éliminer, et peint silencieusement une couleur fausse
 *  au lieu d'échouer visiblement.
 *
 *  Navigateur uniquement : appeler depuis un effet.
 *
 *  ⚠️ Chaque appel force un calcul de style. Pour plusieurs jetons d'affilée,
 *  passer le `CSSStyleDeclaration` en second argument et n'en payer qu'un —
 *  c'est ce que fait `Soir`, qui en lit deux. */
export function readToken(name: string, from?: CSSStyleDeclaration) {
  return (from ?? getComputedStyle(document.documentElement))
    .getPropertyValue(name)
    .trim();
}
