import RevealText from "@/components/common/RevealText";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export default function Galerie() {
  const items = [
    { aspect: "aspect-[4/5]", span: "md:col-span-3", legende: "Brume du matin" },
    { aspect: "aspect-square", span: "md:col-span-3", legende: "Bois carbonisé" },
    { aspect: "aspect-[3/4]", span: "md:col-span-3", legende: "Forêt boréale" },
    { aspect: "aspect-[4/5]", span: "md:col-span-3", legende: "Le fjord" },
    { aspect: "aspect-[16/10]", span: "md:col-span-6", legende: "Octobre" },
    { aspect: "aspect-[16/10]", span: "md:col-span-6", legende: "Aubépine, intérieur" },
  ];

  return (
    <section
      id="galerie"
      className="relative w-full px-5 md:px-10 py-32 bg-base-noir-soft"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <RevealText
            mode="words"
            stagger={0.04}
            className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
          >
            Galerie
          </RevealText>

          <RevealText
            as="h2"
            mode="lines"
            className="text-creme text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
          >
            Le territoire, sans détour.
          </RevealText>
        </div>

        <RevealOnScroll
          y={40}
          stagger={0.08}
          className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-5"
        >
          {items.map((item, i) => (
            <figure
              key={i}
              className={`relative ${item.aspect} ${item.span} overflow-hidden rounded-[20px] bg-base-noir`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-creme-dim/40 text-xs">
                [{item.legende}]
              </div>
            </figure>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
