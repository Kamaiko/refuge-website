import RevealText from "@/components/common/RevealText";
import WordmarkMaskReveal from "@/components/common/WordmarkMaskReveal";
import { SITE_CONFIG } from "@/lib/constants";

export default function Choisir() {
  return (
    <section id="choisir" className="relative w-full">
      <div className="px-5 md:px-10 py-32 md:py-48">
        <div className="mx-auto max-w-7xl">
          <RevealText
            mode="words"
            stagger={0.04}
            duration={0.9}
            className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-12"
          >
            Choisir
          </RevealText>

          <RevealText
            as="h2"
            mode="lines"
            stagger={0.14}
            duration={1.4}
            className="text-creme text-[14vw] md:text-[12vw] font-semibold leading-[0.88] tracking-[-0.04em]"
          >
            {"Trois refuges.\nUn seul,\nle vôtre."}
          </RevealText>

          <RevealText
            mode="lines"
            stagger={0.1}
            delay={0.4}
            className="text-creme-dim mt-12 max-w-xl text-base md:text-lg leading-relaxed"
          >
            {"On les a posés à des distances précises.\nChacun ouvre sur quelque chose qu’aucun autre ne voit."}
          </RevealText>
        </div>
      </div>

      {/* Pill mask reveal — wordmark grows + image takes its place at scroll */}
      <WordmarkMaskReveal
        word={SITE_CONFIG.name}
        imageSrc="/images/hero-shape.avif"
        imageAlt="Un refuge Brume au bord du lac, terrasse en walnut et spa cèdre"
      />
    </section>
  );
}
