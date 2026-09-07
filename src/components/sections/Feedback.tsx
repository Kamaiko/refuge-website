"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MQ } from "@/lib/breakpoints";
import PixelCurtainReveal from "@/components/common/PixelCurtainReveal";

const EYEBROW = "Et eux, qu'en pensent-ils ?";
const QUOTE =
  "On est arrivés avec une liste de choses à faire. On n'en a fait aucune, et c'est la première fois que ça ne m'a pas dérangé.";

/**
 * Closing testimonial section. Trois blocs, et **deux grammaires de reveal**,
 * délibérément :
 *
 * - l'**eyebrow** garde le « voilement » mot à mot (masque + montée + flou +
 *   opacité, scrubbé, staggeré). Sur une ligne de 18 px, le flou est une
 *   nuance, pas un effet ;
 * - la **citation** est passée à {@link PixelCurtainReveal} en septembre
 *   2026. Elle portait le même voilement, et à `3.8vw` le `blur(6px)` sur du
 *   texte de 60 px ne lisait pas comme une mise au point : il lisait comme du
 *   texte mal rendu — d'autant plus voyant que la citation est la dernière
 *   chose qu'on lit avant le CTA. Elle est passée de 3,8 à 5,4vw dans la
 *   foulée, pour que la trame du rideau fasse ~5 px au lieu de ~4 et devienne
 *   visible — voir le commentaire du bloc, la première explication donnée ici
 *   était fausse ;
 * - l'**auteur** monte simplement en opacité.
 *
 * Le voilement scrube DANS LES DEUX SENS — remonter fait redescendre,
 * refloue et efface les mots de l'eyebrow. Reduced-motion peint l'état final
 * sans animation.
 *
 * ⚠️ `WordSplit` ne sert donc plus qu'à l'eyebrow, et la requête
 * `.voile-word` du `useGSAP` ne ramasse plus que ses mots — c'est voulu, pas
 * un reste.
 */
export default function Feedback() {
  const sectionRef = useRef<HTMLElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const words = section.querySelectorAll<HTMLElement>(".voile-word");
      const author = authorRef.current;

      const mm = gsap.matchMedia();
      // Desktop + mobile share the same easing/scrub but mobile fires
      // the trigger earlier — on phones the section enters the viewport
      // and is mostly visible before the desktop `top 50%` window opens,
      // leaving the words held off-screen for an awkwardly long beat.
      // Pulling start up to `top 85%` lets the reveal begin as the
      // section header just clears the fold.
      const setup = ({ start, end }: { start: string; end: string }) => {
        if (!words.length) return;

        gsap.set(words, {
          yPercent: 110,
          opacity: 0,
          filter: "blur(6px)",
        });
        if (author) gsap.set(author, { opacity: 0, y: 20 });

        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: { each: 0.09, from: "start" },
          scrollTrigger: {
            trigger: section,
            start,
            end,
            scrub: 1.4,
          },
        });

        if (author) {
          gsap.to(author, {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: author,
              start: "top 95%",
              end: "top 70%",
              scrub: 0.5,
            },
          });
        }
      };

      mm.add(`(prefers-reduced-motion: no-preference) and ${MQ.mdUp}`, () => {
        setup({ start: "top 50%", end: "center 60%" });
      });
      mm.add(`(prefers-reduced-motion: no-preference) and ${MQ.belowMd}`, () => {
        setup({ start: "top 85%", end: "center 70%" });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(words, { yPercent: 0, opacity: 1, filter: "blur(0px)" });
        if (author) gsap.set(author, { opacity: 1, y: 0 });
      });

      return () => {
        mm.revert();
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === section || t.trigger === author) t.kill();
        });
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="feedback"
      className="relative w-full px-8 md:px-16 pt-16 md:pt-24 pb-20 md:pb-48 flex flex-col"
    >
      {/* No BgGradient here any more. This section used to own the gris-tan →
          base-noir fade, compressed into its top 45% — which left the whole
          warm band flat until the very last moment. `Soir` now closes the band
          within itself and hands off on base-noir, which is also the body's
          colour, so this section needs no background of its own. */}
      {/* Eyebrow — top-left. Acts as the section's semantic title. */}
      <h2 className="text-creme text-lg md:text-xl font-semibold tracking-tight m-0">
        <WordSplit text={EYEBROW} />
      </h2>

      {/* Citation — grand corps, aligné à gauche, plafonné à 82vw.
          Le `className` porte TOUT ce qui est typographique, alinéa et couleur
          du texte révélé compris : `PixelCurtainReveal` les lit sur le wrapper
          via `getComputedStyle` au lieu de les figer.
          ⚠️ Le corps est passé de 3,8 à 5,4vw pour que la trame du rideau se
          lise. La justification qu'on trouvait ici — « en dessous de ~5vw les
          cellules deviennent plus larges que le fût de la lettre » — était
          FAUSSE : `pixelSize` est une fraction du corps, donc le rapport
          trame/lettre est invariant par construction (mesuré : 5,5 % à 3,8vw,
          5,8 % à 5,4vw — la trame est même devenue relativement plus
          grossière). Le vrai gain est en pixels absolus : à 5,4vw une cellule
          fait ~5 px au lieu de ~4, et c'est ce qui la rend visible. */}
      <div className="flex-1 flex items-center mt-16 md:mt-24">
        {/* La fin est calée sur `top`, pas sur `bottom`, **exprès** : une
            borne en `bottom` dépend de la hauteur du bloc, donc le moindre
            changement de corps ou de largeur décale la fin du rideau — et si
            elle passe au-dessus du haut de l'écran, personne ne voit la
            citation se terminer. `top 8%` dit simplement « fini quand le haut
            du bloc est à 8 % du haut de la fenêtre », ce qui reste vrai à
            n'importe quelle taille. */}
        {/* L'ALINÉA est un **retrait de première ligne**, pas un saut de
            ligne. Un `<br>` avait été essayé : il passe à la ligne, ce qui est
            indiscernable d'un retour automatique, donc l'alinéa ne se voyait
            pas. La référence, elle, décale bien le début du texte.
            La COULEUR est `--color-lime-eclat`. Le choix est optique avant
            d'être esthétique — clarté de la crème pour ne pas voir la couture,
            chroma élevé pour poper : voir le commentaire du jeton dans
            `globals.css`. */}
        {/* ⚠️ Fenêtre plus tardive sous `md`. Le même texte fait QUATRE
            lignes à 1600×900 et DIX à 390×844 : à `top 95%`, le rideau part
            alors que 42 px du bloc seulement sont entrés à l'écran, et
            l'essentiel se joue avant qu'on ait de quoi le regarder. À
            `top 75%`, ~210 px sont visibles au départ, soit quatre lignes. */}
        <PixelCurtainReveal
          pendingToken="--color-gris-secondaire"
          accentToken="--color-lime-eclat"
          start="top 95%"
          end="top 8%"
          narrow={{ query: MQ.belowMd, start: "top 75%", end: "top 5%" }}
          className="text-creme text-4xl xs:text-5xl md:text-5xl lg:text-[5.4vw] font-light leading-[1.02] tracking-[-0.02em] max-w-[82vw] [text-indent:2.6em]"
        >
          {QUOTE}
        </PixelCurtainReveal>
      </div>

      {/* Author — bottom-left, avatar + name + location */}
      <div ref={authorRef} className="flex items-center gap-4 mt-12 will-change-transform">
        <Image
          src="/images/photo-patrick.avif"
          alt="Patrick Patenaude"
          width={96}
          height={96}
          unoptimized
          className="h-12 w-12 rounded-full object-cover shrink-0"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-creme text-sm">Patrick P.</span>
          <span className="text-gris-secondaire text-sm">(Sorel)</span>
        </div>
      </div>
    </section>
  );
}

/** Splits `text` on whitespace and wraps each word in a `(mask, inner)`
 *  pair so per-word transforms / opacity / blur can be tweened without
 *  affecting word spacing or line wrapping.
 *
 *  - Outer span (`overflow-hidden`, `align-bottom`): the mask. Width
 *    follows its content, baseline anchored to bottom so the inner word
 *    sliding from below appears to rise out of the line itself.
 *  - Inner span (`.voile-word`): the GSAP target. `will-change` opts it
 *    into a compositor layer so blur + transform updates don't repaint
 *    the surrounding text. */
function WordSplit({ text }: { text: string }) {
  const tokens = text.split(/(\s+)/);
  return (
    <span aria-label={text}>
      {tokens.map((token, i) =>
        /^\s+$/.test(token) ? (
          <span key={i} aria-hidden>
            {token}
          </span>
        ) : (
          <span
            key={i}
            aria-hidden
            className="inline-block overflow-hidden align-bottom"
          >
            <span className="voile-word inline-block will-change-[transform,filter,opacity]">
              {token}
            </span>
          </span>
        ),
      )}
    </span>
  );
}
