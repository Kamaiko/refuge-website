import { SITE_CONFIG } from "@/lib/constants";
import RevealText from "@/components/common/RevealText";
import ScrollTextReveal from "@/components/common/ScrollTextReveal";

export default function Manifeste() {
  return (
    <section
      id="manifeste"
      className="relative w-full px-5 md:px-10 py-48 md:py-64 min-h-[100svh] flex flex-col justify-center"
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
          baseOpacity={0.1}
          start="top 75%"
          end="bottom 70%"
          className="text-creme text-4xl md:text-7xl lg:text-[5.5vw] font-light leading-[1.05] tracking-[-0.01em]"
        >
          {SITE_CONFIG.manifeste}
        </ScrollTextReveal>
      </div>
    </section>
  );
}
