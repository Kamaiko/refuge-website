import RevealText from "@/components/common/RevealText";
import RevealOnScroll from "@/components/common/RevealOnScroll";

export default function Concept() {
  const principes = [
    {
      titre: "Bois carbonisé",
      texte:
        "La technique japonaise du shou sugi ban : le bois passé au feu pour qu’il absorbe la lumière au lieu de la renvoyer. Le refuge se fond, la forêt revient à elle-même.",
    },
    {
      titre: "Baies pleine façade",
      texte:
        "Le verre prend toute la place qu’il peut. Quand on est dedans, on est presque dehors. Quand on est dehors, on devine quelqu’un dedans.",
    },
    {
      titre: "Ancrage léger",
      texte:
        "Pilotis fins, fondations minimales, aucune coupe d’arbre inutile. Le sol garde sa mousse. Quand le refuge partira, il ne restera presque rien.",
    },
  ];

  return (
    <section
      id="concept"
      className="relative w-full px-5 md:px-10 py-32 bg-base-noir-soft"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <RevealText
            mode="words"
            stagger={0.04}
            duration={0.9}
            className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
          >
            Concept architectural
          </RevealText>

          <RevealText
            as="h2"
            mode="lines"
            stagger={0.1}
            className="text-creme text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
          >
            {"Trois volumes,\ntrois lectures du paysage."}
          </RevealText>

          <RevealOnScroll y={16} className="mt-8">
            <p className="text-creme-dim text-base leading-relaxed">
              Aucun ornement. La forêt, le bois et le silence font le reste.
            </p>
          </RevealOnScroll>
        </div>

        <RevealOnScroll
          stagger={0.15}
          y={40}
          className="mt-20 grid gap-px bg-creme/10 md:grid-cols-3 overflow-hidden rounded-[20px]"
        >
          {principes.map((p, i) => (
            <div key={p.titre} className="bg-base-noir-soft p-8 md:p-10">
              <span className="text-creme-dim/60 text-xs tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-creme mt-6 text-xl font-semibold tracking-tight">
                {p.titre}
              </h3>
              <p className="text-creme-dim mt-4 text-sm leading-relaxed">
                {p.texte}
              </p>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
