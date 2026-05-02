import CurtainReveal from "@/components/common/CurtainReveal";

const MANIFESTE =
  "Charlevoix garde encore quelque chose de pur. Brume s’y pose sans bruit — trois refuges où ralentir devient une évidence.";

export default function Manifeste() {
  return (
    <section
      id="manifeste"
      className="relative w-full px-5 md:px-10 py-32 md:py-48 min-h-[100svh] flex items-center"
    >
      {/* Capped at ~75% width with tighter leading. Slightly smaller than
          the previous 6.2vw so the manifeste sits as one calm block rather
          than spilling across the full viewport. */}
      <CurtainReveal className="max-w-[75vw] text-4xl md:text-6xl lg:text-[5vw] font-light leading-[0.98] tracking-[-0.015em]">
        {MANIFESTE}
      </CurtainReveal>
    </section>
  );
}
