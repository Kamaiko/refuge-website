import CurtainReveal from "@/components/common/CurtainReveal";

const MANIFESTE =
  "Charlevoix garde encore quelque chose de pur. Aquilon s’y pose sans bruit — trois refuges où ralentir devient une évidence.";

/** Single-quote manifesto block. Uses {@link CurtainReveal} for a
 *  scroll-scrubbed sharp-edged wipe between a darker filter copy and
 *  the cream copy. */
export default function Manifeste() {
  return (
    <section
      id="manifeste"
      className="relative w-full px-5 md:px-10 py-32 md:py-48 min-h-[100svh] flex items-center"
    >
      <CurtainReveal className="max-w-[75vw] text-4xl md:text-6xl lg:text-[5vw] font-light leading-[0.98] tracking-[-0.015em]">
        {MANIFESTE}
      </CurtainReveal>
    </section>
  );
}
