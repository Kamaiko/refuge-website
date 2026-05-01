import Marquee from "@/components/common/Marquee";
import { MARQUEE } from "@/lib/motion";

export default function MarqueeBrand() {
  return (
    <section
      aria-hidden
      className="relative w-full overflow-hidden py-24 md:py-32 select-none bg-base-noir"
    >
      <Marquee
        text="Pourquoi Brume® ?"
        speed={MARQUEE.speedBase}
        separator="·"
        flipAt={MARQUEE.threshold}
        className="text-creme/90 text-[24vw] md:text-[14vw] font-semibold leading-none tracking-[-0.04em]"
      />
    </section>
  );
}
