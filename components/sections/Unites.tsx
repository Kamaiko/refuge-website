import Image from "next/image";
import { UNITES } from "@/lib/data/unites";
import RevealText from "@/components/common/RevealText";
import RevealOnScroll from "@/components/common/RevealOnScroll";
import ScrollScaleImage from "@/components/common/ScrollScaleImage";

export default function Unites() {
  return (
    <section id="refuges" className="relative w-full px-5 md:px-10 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 max-w-3xl">
          <RevealText
            mode="words"
            stagger={0.04}
            className="text-creme-dim text-xs uppercase tracking-[0.3em] mb-8"
          >
            Les refuges
          </RevealText>

          <RevealText
            as="h2"
            mode="lines"
            stagger={0.1}
            className="text-creme text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
          >
            {"Trois refuges, trois manières\nd’être ici."}
          </RevealText>
        </div>

        <div className="space-y-32">
          {UNITES.map((unite, i) => (
            <article
              key={unite.slug}
              className="grid gap-10 md:grid-cols-12 md:gap-16 items-start"
            >
              <div
                className={`md:col-span-7 ${
                  i % 2 === 1 ? "md:col-start-6 md:row-start-1" : ""
                }`}
              >
                <ScrollScaleImage
                  scaleFrom={1.25}
                  scaleTo={1}
                  className="aspect-[4/3] w-full rounded-[28px] bg-base-noir-soft"
                >
                  <Image
                    src={unite.image}
                    alt={`Refuge ${unite.nom} — ${unite.surnom}`}
                    fill
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </ScrollScaleImage>
              </div>

              <div className={`md:col-span-5 ${i % 2 === 1 ? "md:row-start-1" : ""}`}>
                <RevealOnScroll y={28} stagger={0.08}>
                  <span className="text-creme-dim/60 text-xs tabular-nums block">
                    {String(i + 1).padStart(2, "0")} / 03
                  </span>

                  <h3 className="text-creme mt-4 text-4xl md:text-5xl font-semibold leading-[0.95] tracking-tight">
                    {unite.nom}
                  </h3>

                  <p className="text-creme-dim mt-3 text-base italic">
                    {unite.surnom}
                  </p>

                  <p className="text-creme/90 mt-8 text-base leading-relaxed">
                    {unite.positionnement}
                  </p>

                  <p className="text-creme-dim mt-4 text-base leading-relaxed">
                    {unite.description}
                  </p>

                  <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-creme/10 pt-6">
                    <div>
                      <dt className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">
                        Capacité
                      </dt>
                      <dd className="text-creme mt-2 text-sm">{unite.capacite}</dd>
                    </div>
                    <div>
                      <dt className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">
                        Surface
                      </dt>
                      <dd className="text-creme mt-2 text-sm">{unite.surface}</dd>
                    </div>
                    <div>
                      <dt className="text-creme-dim/60 text-[10px] uppercase tracking-[0.2em]">
                        Particularité
                      </dt>
                      <dd className="text-creme mt-2 text-sm">{unite.particularite}</dd>
                    </div>
                  </dl>
                </RevealOnScroll>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
