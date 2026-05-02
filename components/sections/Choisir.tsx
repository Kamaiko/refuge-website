import ScrollLinesScrub from "@/components/common/ScrollLinesScrub";
import { BgGradient } from "@/components/common/BgTransition";

export default function Choisir() {
  return (
    <section id="choisir" className="relative w-full bg-gris-tan">
      {/* Whole-section noir → gris-tan transition, OKLAB-interpolated to
          eliminate banding on dark colors. Default 4% noise dither for any
          residual quantization on low-end 8-bit panels. */}
      <BgGradient
        from="var(--color-base-noir)"
        to="var(--color-gris-tan)"
        direction="down"
      />

      <div className="relative px-5 md:px-8 py-32 md:py-48">
        <div className="mx-auto w-full max-w-[1800px]">
          <p className="text-gris-secondaire text-xs uppercase tracking-[0.3em] mb-12">
            Découvrir les refuges Brume<sup className="text-[0.65em]">®</sup>
          </p>

          <ScrollLinesScrub
            baseOpacity={0.15}
            className="text-creme text-[15vw] md:text-[13vw] font-semibold leading-[0.86] tracking-[-0.045em]"
          >
            {"Trois refuges.\nUn seul, le vôtre."}
          </ScrollLinesScrub>

          <p className="text-creme-dim mt-12 max-w-2xl text-lg md:text-xl leading-relaxed font-medium">
            On les a posés à des distances précises. Chacun ouvre sur quelque chose qu’aucun autre ne voit.
          </p>
        </div>
      </div>
    </section>
  );
}
