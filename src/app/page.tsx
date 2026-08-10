import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Manifeste from "@/components/sections/Manifeste";
import Medaillons from "@/components/sections/Medaillons";
import Choisir from "@/components/sections/Choisir";
import Hebergements from "@/components/sections/Hebergements";
import Proximite from "@/components/sections/Proximite";
import MarqueeBrand from "@/components/sections/MarqueeBrand";
import Pourquoi from "@/components/sections/Pourquoi";
import Activites from "@/components/sections/Activites";
import Carousel from "@/components/sections/Carousel";
import Feedback from "@/components/sections/Feedback";
import Cta from "@/components/sections/Cta";
import Footer from "@/components/sections/Footer";
import BgGradient from "@/components/common/BgGradient";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Manifeste />
        <Choisir />
        <Hebergements />
        <Proximite />
        <MarqueeBrand />
        <Pourquoi />
        {/* Medaillons is the day→evening hinge, so it has to sit AFTER the
            refuges have been introduced. It used to run third, right after
            the Manifeste — promising "le soir, ensemble" six sections before
            anything else picked the thread back up, and directly on top of
            Hebergements selling "aucun voisin, aucune vue ouverte".
            Here it reads as an escalation instead: Pourquoi ends on the
            distance (quinze minutes de marche), Medaillons lights the fire,
            Activités opens on "Seul, ou tous ensemble". */}
        <Medaillons />
        <Activites />
        <Carousel />
        <Feedback />
        {/* CTA + Footer share one base-noir → gris-tan background
            gradient. The wrapper carries `isolate` so the gradient
            (at `-z-10`) stays scoped to this stacking context, and
            `top-[40%]` anchors the gradient's top edge to roughly
            the CTA's secondary-text paragraph — base-noir above it
            (still the body's bg-base-noir showing through), gradient
            sliding to its darkest gris-tan at the very bottom of
            the Footer's wordmark. */}
        <div className="relative isolate">
          <BgGradient
            from="var(--color-base-noir)"
            to="var(--color-gris-tan)"
            direction="down"
            toAt={55}
            className="top-[40%] -z-10"
          />
          <Cta />
          <Footer />
        </div>
      </main>
    </>
  );
}
