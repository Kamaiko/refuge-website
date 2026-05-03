import RevealText from "@/components/common/RevealText";

/** Closing testimonial section. Eyebrow, large quote, and author signature,
 *  each fading in via {@link RevealText} as it scrolls into view. */
export default function Feedback() {
  return (
    <section
      id="feedback"
      className="relative w-full px-8 md:px-16 py-32 md:py-48 min-h-[100svh] flex flex-col"
    >
      {/* Eyebrow — top-left */}
      <RevealText
        mode="words"
        stagger={0.04}
        duration={0.9}
        className="text-creme text-base md:text-lg font-semibold tracking-tight"
      >
        Et eux, qu&apos;en pensent-ils ?
      </RevealText>

      {/* Quote — large, left-aligned, capped at ~75% of viewport width with
          a tighter leading. Smaller display size than the original 5.5vw so
          the quote reads as one calm block instead of dominating. */}
      <div className="flex-1 flex items-center mt-16 md:mt-24">
        <RevealText
          as="p"
          mode="lines"
          stagger={0.12}
          duration={1.2}
          className="text-creme text-3xl md:text-5xl lg:text-[4.4vw] font-light leading-[0.98] tracking-[-0.02em] max-w-[75vw]"
        >
          {"Un séjour à Aquilon au Québec a redéfini ce que repos veut dire — le design moderne se mêle à la nature, et chaque coucher de soleil ressemble à un tableau silencieux."}
        </RevealText>
      </div>

      {/* Author — bottom-left, avatar + name + location */}
      <div className="flex items-center gap-4 mt-12">
        <span
          aria-hidden
          className="inline-block h-12 w-12 rounded-full bg-gris-tan-soft shrink-0"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-creme text-sm">Patrick P.</span>
          <span className="text-gris-secondaire text-sm">(Sorel)</span>
        </div>
      </div>
    </section>
  );
}
