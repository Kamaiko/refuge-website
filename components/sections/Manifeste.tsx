import CurtainReveal from "@/components/common/CurtainReveal";
import { SITE_CONFIG } from "@/lib/constants";

const MANIFESTE = `Charlevoix garde encore quelque chose de pur. ${SITE_CONFIG.brandMark} s’y pose sans bruit — trois refuges où ralentir devient une évidence.`;

/** Single-quote manifesto block. Uses {@link CurtainReveal} for a
 *  scroll-scrubbed sharp-edged wipe between a darker filter copy and
 *  the cream copy. */
export default function Manifeste() {
  return (
    <section
      id="manifeste"
      className="relative w-full px-5 md:px-10 py-20 md:py-48 flex items-center"
    >
      <CurtainReveal
        end="bottom 55%"
        className="max-w-[75vw] text-4xl md:text-6xl lg:text-[5vw] font-light leading-[1.05] tracking-[-0.015em]"
      >
        {MANIFESTE}
      </CurtainReveal>
    </section>
  );
}
