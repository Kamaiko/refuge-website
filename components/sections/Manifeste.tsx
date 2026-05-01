import ScrollLineReveal from "@/components/common/ScrollLineReveal";

const MANIFESTE_LINES = [
  "Charlevoix garde encore quelque chose de pur.",
  "Le fleuve qui s’élargit en mer,",
  "la forêt qui descend jusqu’à l’eau,",
  "le silence qu’on n’attend plus.",
  "Brume s’y pose sans bruit —",
  "trois refuges où ralentir cesse",
  "d’être un luxe pour devenir",
  "une évidence.",
].join("\n");

export default function Manifeste() {
  return (
    <section
      id="manifeste"
      className="relative w-full px-5 md:px-10 py-32 md:py-48 min-h-[100svh] flex items-center"
    >
      <ScrollLineReveal
        baseOpacity={0.18}
        className="text-creme w-full text-5xl md:text-7xl lg:text-[6.5vw] font-light leading-[1.06] tracking-[-0.015em]"
      >
        {MANIFESTE_LINES}
      </ScrollLineReveal>
    </section>
  );
}
