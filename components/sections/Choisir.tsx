import WordmarkMaskReveal from "@/components/common/WordmarkMaskReveal";
import ScrollLinesScrub from "@/components/common/ScrollLinesScrub";

export default function Choisir() {
  return (
    <section id="choisir" className="relative w-full bg-gris-tan">
      {/* Soft gradient at the top — transition from the noir of preceding
          section into the gris-tan of this section. Begins at the top edge,
          fades out by ~25% so the rest is solid gris-tan. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[35vh] pointer-events-none bg-gradient-to-b from-base-noir to-transparent"
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
