import WordmarkMaskReveal from "@/components/common/WordmarkMaskReveal";
import ScrollLinesScrub from "@/components/common/ScrollLinesScrub";

export default function Choisir() {
  return (
    <section id="choisir" className="relative w-full bg-gris-tan">
      {/* Soft gradient at the bottom — transition from this gris-tan section
          into the base-noir section that follows (Capsules / MarqueeBrand).
          Begins ~65% down, fully noir at the bottom edge. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[35vh] pointer-events-none bg-gradient-to-t from-base-noir to-transparent"
      />

      <div className="relative px-5 md:px-8 py-32 md:py-48">
        <div className="mx-auto w-full max-w-[1800px]">
          <p className="text-gris-secondaire text-xs uppercase tracking-[0.3em] mb-12">
            Découvrir les refuges Brume<sup className="text-[0.65em]">®</sup>
          </p>

          {/* Headline — scroll-driven scrub: lines reveal continuously with
              scroll, un-reveal in reverse on scroll-up. */}
          <ScrollLinesScrub
            baseOpacity={0.15}
            staggerEach={0.4}
            className="text-creme text-[15vw] md:text-[13vw] font-semibold leading-[0.86] tracking-[-0.045em]"
          >
            {"Trois refuges.\nUn seul, le vôtre."}
          </ScrollLinesScrub>

          {/* Body — present, NOT animated, lighter warm-grey weight-medium */}
          <p className="text-creme-dim mt-12 max-w-2xl text-base md:text-lg leading-relaxed font-medium">
            On les a posés à des distances précises. Chacun ouvre sur quelque chose qu’aucun autre ne voit.
          </p>
        </div>
      </div>

      <WordmarkMaskReveal
        word="Brume"
        imageSrc="/images/hero-shape.avif"
        imageAlt="Un refuge Brume au bord du lac, terrasse en walnut et spa cèdre"
      />
    </section>
  );
}
