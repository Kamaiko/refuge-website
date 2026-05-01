import { JOURNAL } from "@/lib/data/journal";
import RevealText from "@/components/common/RevealText";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export default function Journal() {
  return (
    <section id="journal" className="relative w-full px-5 md:px-10 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <RevealText
            mode="words"
            stagger={0.04}
            className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
          >
            Journal
          </RevealText>

          <RevealText
            as="h2"
            mode="lines"
            className="text-creme text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
          >
            {"Quelques lignes, au fil\ndes saisons."}
          </RevealText>
        </div>

        <RevealOnScroll
          y={40}
          stagger={0.12}
          className="grid gap-px bg-creme/10 md:grid-cols-3 overflow-hidden rounded-[20px]"
        >
          {JOURNAL.map((entry) => (
            <article key={entry.slug} className="bg-base-noir p-8 md:p-10">
              <div className="flex items-center justify-between text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">
                <span>{entry.saison}</span>
                <time>{entry.date}</time>
              </div>
              <h3 className="text-creme mt-8 text-2xl font-semibold tracking-tight leading-tight">
                {entry.titre}
              </h3>
              <p className="text-creme-dim mt-6 text-sm leading-relaxed">
                {entry.texte}
              </p>
            </article>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
