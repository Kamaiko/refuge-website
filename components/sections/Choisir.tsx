import ScrollLinesScrub from "@/components/common/ScrollLinesScrub";

export default function Choisir() {
  return (
    <section id="choisir" className="relative w-full bg-gris-tan">
      {/* Whole-section gradient noir → transparent (transparent reveals the
          section's gris-tan bg below). Simple 2-stop linear interpolation —
          fewer color stops = no visible quantization between intermediate
          colors. SVG noise overlay at 7% opacity dithers the residual banding. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-base-noir to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative px-5 md:px-8 py-32 md:py-48">
        <div className="mx-auto w-full max-w-[1800px]">
          <p className="text-gris-secondaire text-xs uppercase tracking-[0.3em] mb-12">
            Découvrir les refuges Brume<sup className="text-[0.65em]">®</sup>
          </p>

          <ScrollLinesScrub
            baseOpacity={0.15}
            className="text-creme text-[15vw] md:text-[13vw] font-semibold leading-[0.86] tracking-[-0.045em]"
          >
            {"Trois refuges.\nUn seul, le vôtre."}
          </ScrollLinesScrub>

          <p className="text-creme-dim mt-12 max-w-2xl text-base md:text-lg leading-relaxed font-medium">
            On les a posés à des distances précises. Chacun ouvre sur quelque chose qu’aucun autre ne voit.
          </p>
        </div>
      </div>
    </section>
  );
}
