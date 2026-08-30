import BgGradient from "@/components/common/BgGradient";
import SectionHeading from "@/components/common/SectionHeading";
import { SITE_CONFIG } from "@/lib/constants";

const LINES = ["Choisissez celui", "qui vous convient"] as const;

/** Brand pillars surfaced as a tag cloud at the bottom-right of the section.
 *  Rendered as outlined pills, alternating between a muted gris and a brighter
 *  cream variant via index parity in the map below. */
const FEATURES = [
  "Bois carbonisé",
  "Bain nordique",
  "Éco-responsable",
  "Granit de Charlevoix",
  "Verre pleine hauteur",
  "Vue ouverte",
  "Foyer intérieur",
  "Toit végétal",
] as const;

/** Transition section before the Hebergements slideshow. The headline triggers
 *  three synchronised scroll-scrubbed effects (depth scale + opacity ramp,
 *  parallax y-drift slower than page scroll, per-line clip-path curtain).
 *  A {@link BgGradient} fades from `--color-base-noir` into the gris-tan
 *  background so the section seams cleanly into Hebergements below.
 *  Reduced-motion: lines are revealed instantly, no scroll-driven motion. */
export default function Choisir() {
  return (
    <section id="choisir" className="relative w-full bg-gris-tan">
      <BgGradient
        from="var(--color-base-noir)"
        to="var(--color-gris-tan)"
        direction="down"
      />

      {/* Single padding scope (px-8 md:px-16) for every block — eyebrow,
          headline, and the two-column footer all share the same left edge,
          so the content reads as one composed page rather than three
          differently-inset blocks. */}
      <div className="relative px-8 md:px-16 py-32 md:py-48">
        <SectionHeading
          eyebrow={<>Découvrir les refuges {SITE_CONFIG.brandMark}</>}
          lines={LINES}
        />

        <div className="mt-16 md:mt-32 grid gap-12 md:grid-cols-2 md:gap-16">
          <p className="text-creme-terre/70 max-w-4xl text-xl xs:text-2xl md:text-5xl font-medium leading-snug">
            {/* ⚠️ Cette phrase énumère les trois refuges dans l'ordre de
                `REFUGES` et doit être relue à CHAQUE fois qu'une de leurs
                photos change. Elle a déjà menti une fois : elle promettait
                « l'un se dérobe dans la forêt » alors qu'Aubépine était
                passée sur un cap, et plus aucun refuge n'était en forêt —
                une promesse faite section 3, intenable section 4. */}
            L&apos;un domine le fjord. L&apos;autre regarde le couchant. Le dernier touche presque l&apos;eau. Trois rapports distincts au même territoire. Le vôtre se reconnaît avant d&apos;avoir fini de lire.
          </p>

          <div className="flex flex-col gap-8">
            <p className="text-creme text-xl md:text-2xl font-semibold tracking-tight leading-snug max-w-md">
              Les refuges ont été construits selon les mêmes règles :
            </p>
            <ul className="flex flex-wrap gap-3" aria-label="Principes communs aux refuges">
              {FEATURES.map((f, i) => (
                <li
                  key={f}
                  className={`inline-flex items-center rounded-pill border-[2px] md:border-[3px] px-5 md:px-10 py-2.5 md:py-5 text-sm md:text-xl ${
                    i % 2 === 0
                      ? "border-creme-terre/70 text-creme-terre"
                      : "border-white/50 text-white"
                  }`}
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
