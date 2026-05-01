import RevealText from "@/components/common/RevealText";
import WordmarkMaskReveal from "@/components/common/WordmarkMaskReveal";

export default function Choisir() {
  return (
    <section id="choisir" className="relative w-full bg-gris-tan">
      <div className="px-5 md:px-8 py-32 md:py-48">
        <div className="mx-auto w-full max-w-[1800px]">
          <p className="text-gris-secondaire text-xs uppercase tracking-[0.3em] mb-12">
            Découvrir les refuges Brume<sup className="text-[0.65em]">®</sup>
          </p>

          {/* Headline — screen-wide, ~14-15vw so chars almost touch the edges */}
          <RevealText
            as="h2"
            mode="lines"
            stagger={0.14}
            duration={1.4}
            className="text-creme text-[15vw] md:text-[13vw] font-semibold leading-[0.86] tracking-[-0.045em]"
          >
            {"Trois refuges.\nUn seul, le vôtre."}
          </RevealText>

          {/* Body — present and NOT animated (plain paragraph) */}
          <p className="text-gris-secondaire mt-12 max-w-2xl text-base md:text-lg leading-relaxed">
            On les a posés à des distances précises. Chacun ouvre sur quelque chose qu’aucun autre ne voit.
          </p>
        </div>
      </div>

      {/* Pill mask reveal — wordmark grows + image takes its place at scroll */}
      <WordmarkMaskReveal
        word="Brume"
        imageSrc="/images/hero-shape.avif"
        imageAlt="Un refuge Brume au bord du lac, terrasse en walnut et spa cèdre"
      />
    </section>
  );
}
