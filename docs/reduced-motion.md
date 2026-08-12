# Reduced motion — regles du projet

## Reduced motion — règles du projet

> **L'état caché vit en CSS, plus en JSX.** C'est la règle numéro un depuis
> août 2026, et elle remplace un mécanisme qui avait déjà coûté trois pertes
> de contenu — dont un Hero qui rendait une image sans un seul mot dessus.
>
> ```css
> @media (prefers-reduced-motion: no-preference) {
>   [data-anim="fade"]   { opacity: 0; }
>   [data-anim="hidden"] { visibility: hidden; }
> }
> ```
>
> Un élément qui doit apparaître porte `data-anim` **au lieu** d'un
> `style={{opacity:0}}` inline, et il n'y a **plus rien à écrire côté
> reduced-motion** : sous `reduce` il n'est jamais caché, donc il n'y a rien à
> annuler. Écrire une branche `reduce` pour ré-afficher quelque chose est
> désormais le signe qu'on a caché l'élément au mauvais endroit.
>
> Le bloc est **hors de toute cascade layer**, donc il bat les utilitaires
> Tailwind quel que soit l'ordre ; un style inline gagne encore, et c'est
> exactement par là que GSAP révèle l'élément.
>
> ⚠️ Ne s'applique pas aux états cachés qui sont des **transforms** (glyphes
> parqués, clip-path) : GSAP doit les poser lui-même pour tenir son cache. Là,
> voir la règle 3 ci-dessous.

Trois outils, à ne pas confondre :

1. **`gsap.matchMedia()`** pour les paramètres d'animation. Une seule branche
   `no-preference` suffit désormais dans le cas courant : l'état caché étant
   en CSS, il n'y a plus rien à défaire sous `reduce`. Les branches `reduce`
   qui subsistent (CurtainReveal, MapOverlay, Feedback, Hebergements, Soir)
   annulent un état posé **en JS**, pas par le markup — c'est ce qui les rend
   légitimes.
2. **`usePrefersReducedMotion()`** quand il faut changer de **layout**.
   Carousel et Pourquoi s'en servent pour rendre leur pile mobile à toutes les
   largeurs : leur piste desktop est entièrement pilotée par ScrollTrigger, donc
   sans pin les cartes suivantes seraient inatteignables.
   ⚠️ **Jamais pour décider d'animer ou non.** Le hook renvoie `false` au rendu
   d'hydratation — c'est son contrat, voulu pour que le layout animé soit celui
   qui hydrate — et c'est précisément la course qui a rendu le wordmark du
   footer invisible en production.
3. **`wantsReducedMotion()`** pour lire la préférence dans un effet ou un
   handler. Les effets ne tournent que côté client, donc la lecture directe y
   est toujours correcte, contrairement au hook. C'est l'outil des primitives
   dont l'état caché est un **transform** : `RevealChars` et `AquilonReveal`
   parquent leurs glyphes, `RevealText` pousse ses lignes hors de leur masque.
   Toutes trois gardent le hook en dépendance, uniquement pour rester
   réactives à un changement de préférence en cours de session.

**Assertion de contrôle** — sous `prefers-reduced-motion: reduce`, après une
descente en scroll continu : aucun `[data-anim]` en `visibility: hidden` ou
`opacity < 0.05`, aucun `.rc-glyph` avec un `transform` non identitaire,
aucune `.reveal-inner` décalée. Tester `getComputedStyle`, jamais
`getBoundingClientRect().height` — qui reste non nul sur du `visibility:
hidden` et a déjà rendu une vérification aveugle.

