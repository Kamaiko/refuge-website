import Marquee from "@/components/common/Marquee";

export default function MarqueeBrand() {
  return (
    <section
      aria-hidden
      className="relative w-full overflow-hidden py-24 md:py-32 select-none bg-base-noir"
    >
      <Marquee
        text="Pourquoi Brume® ?"
        speed={140}
        separator="·"
        directional
        className="text-creme/90 text-[24vw] md:text-[14vw] font-semibold leading-none tracking-[-0.04em]"
      />
    </section>
  );
}
