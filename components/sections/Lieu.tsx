import RevealText from "@/components/common/RevealText";
import RevealOnScroll from "@/components/common/RevealOnScroll";
import ScrollScaleImage from "@/components/common/ScrollScaleImage";

export default function Lieu() {
  return (
    <section id="lieu" className="relative w-full px-5 md:px-10 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <RevealText
              mode="words"
              stagger={0.04}
              duration={0.9}
              className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
            >
              Le lieu
            </RevealText>

            <RevealText
              as="h2"
              mode="lines"
              stagger={0.1}
              duration={1.2}
              className="text-creme text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
            >
              {"Charlevoix,\nle souffle\ndu Saint-Laurent."}
            </RevealText>

            <RevealOnScroll
              y={20}
              stagger={0.1}
              className="text-creme-dim mt-10 space-y-5 text-base leading-relaxed max-w-md"
            >
              <p>
                Cinquante kilomètres de falaises, de baies et de villages accrochés
                au fleuve. Le Saint-Laurent y devient mer. Les bélugas remontent
                l’été ; les baleines, plus loin, après Tadoussac.
              </p>
              <p>
                À l’automne, la forêt boréale prend feu en silence. La lumière, le
                matin, devient liquide. C’est ce paysage que nos refuges essaient
                simplement de ne pas déranger.
              </p>
            </RevealOnScroll>
          </div>

          <div className="md:col-span-7 md:col-start-7">
            <ScrollScaleImage
              scaleFrom={1.3}
              scaleTo={1}
              className="aspect-[4/5] w-full rounded-[28px] bg-base-noir-soft"
            >
              <div className="flex h-full w-full items-center justify-center text-creme-dim/40 text-sm">
                [paysage Charlevoix — image AI]
              </div>
            </ScrollScaleImage>
            <div className="mt-4 flex items-center justify-between text-xs text-creme-dim">
              <span>Baie-Saint-Paul → Tadoussac</span>
              <span>Région touristique du Québec</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
