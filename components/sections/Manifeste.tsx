import { SITE_CONFIG } from "@/lib/constants";
import RevealText from "@/components/common/RevealText";
import ScrollTextReveal from "@/components/common/ScrollTextReveal";

export default function Manifeste() {
  return (
    <section
      id="manifeste"
      className="relative w-full px-5 md:px-10 py-32 md:py-48 min-h-[100svh] flex flex-col justify-center"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <RevealText
          mode="words"
          stagger={0.04}
          duration={0.9}
          className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-12"
        >
          Manifeste
        </RevealText>

        <ScrollTextReveal
          as="p"
          baseOpacity={0.12}
          start="top 70%"
          end="bottom 75%"
          className="text-creme text-5xl md:text-7xl lg:text-[6vw] font-light leading-[1.05] tracking-[-0.015em]"
        >
          {SITE_CONFIG.manifeste}
        </ScrollTextReveal>
      </div>
    </section>
  );
}
