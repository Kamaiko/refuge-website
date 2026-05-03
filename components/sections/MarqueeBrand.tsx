import Marquee from "@/components/common/Marquee";

/** Decorative banner between Capsules and Feedback: a giant directional
 *  {@link Marquee} of the brand line. Aria-hidden — pure visual flourish. */
export default function MarqueeBrand() {
  return (
    <section
      aria-hidden
      className="relative w-full overflow-hidden py-24 md:py-32 select-none bg-base-noir"
    >
      <Marquee
        text="Pourquoi Aquilon® ?"
        speed={260}
        mobileSpeed={80}
        separator="·"
        directional
        className="text-creme/90 text-[24vw] md:text-[14vw] font-semibold leading-none tracking-[-0.04em]"
      />
    </section>
  );
}
