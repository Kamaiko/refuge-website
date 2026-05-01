import { SITE_CONFIG } from "@/lib/constants";
import Marquee from "@/components/common/Marquee";

export default function MarqueeBrand() {
  return (
    <section
      aria-hidden
      className="relative w-full overflow-hidden py-24 md:py-32 select-none"
    >
      <Marquee
        text={SITE_CONFIG.name}
        speed={70}
        separator="✦"
        directional
        className="text-creme text-[24vw] md:text-[16vw] font-semibold leading-none tracking-[-0.04em]"
      />
    </section>
  );
}
