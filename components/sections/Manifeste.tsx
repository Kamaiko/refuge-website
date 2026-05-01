import CurtainReveal from "@/components/common/CurtainReveal";

const MANIFESTE =
  "Charlevoix garde encore quelque chose de pur. Brume s’y pose sans bruit — trois refuges où ralentir devient une évidence.";

export default function Manifeste() {
  return (
    <section
      id="manifeste"
      className="relative w-full px-5 md:px-10 py-32 md:py-48 min-h-[100svh] flex items-center"
    >
      <CurtainReveal className="w-full text-5xl md:text-7xl lg:text-[6.2vw] font-light leading-[1.06] tracking-[-0.015em]">
        {MANIFESTE}
      </CurtainReveal>
    </section>
  );
}
