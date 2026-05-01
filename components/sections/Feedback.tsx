import RevealText from "@/components/common/RevealText";

export default function Feedback() {
  return (
    <section
      id="feedback"
      className="relative w-full px-5 md:px-10 py-32 md:py-48"
    >
      <div className="mx-auto max-w-5xl text-center">
        <RevealText
          mode="words"
          stagger={0.04}
          duration={0.9}
          className="text-gris-secondaire text-xs uppercase tracking-[0.3em] mb-10"
        >
          Feedback
        </RevealText>

        <RevealText
          as="p"
          mode="lines"
          stagger={0.12}
          duration={1.2}
          className="text-creme text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight"
        >
          {
            "« Un séjour à Brume\nau Québec a redéfini\nce que repos veut dire.\nLe design moderne se mêle à la nature,\net chaque coucher de soleil\nressemble à un tableau silencieux. »"
          }
        </RevealText>

        <p className="text-creme-dim mt-10 text-sm tracking-tight">
          Patrick P. <span className="text-gris-secondaire mx-2">·</span>{" "}
          <span className="text-gris-secondaire">Hiver 2026, Charlevoix</span>
        </p>
      </div>
    </section>
  );
}
