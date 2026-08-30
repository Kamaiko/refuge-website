import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Manifeste from "@/components/sections/Manifeste";
import Soir from "@/components/sections/Soir";
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
        <Activites />
        <Carousel />
        {/* Soir closes the activity block. The Carousel's last card is "Le feu
            de minuit — la nuit tombe, le feu prend", and this section picks
            that up to reveal the fire isn't an event but a nightly habit:
            "Le feu est allumé tous les soirs. Qu'il y ait quelqu'un ou non."
            It used to run third, right after the Manifeste — promising "le
            soir, ensemble" six sections before anything picked the thread back
            up, and directly above Hebergements, which sold solitude. (That
            phrasing used to quote Aubépine's "aucun voisin"; the refuge was
            rewritten in August 2026 and the words are gone, but the ordering
            constraint stands on the same ground: the shared side must not be
            promised before the private one has been established.)
            It also has to carry `bg-gris-tan`: Feedback below fades gris-tan →
            base-noir over its top 45%, and that fade assumes it arrives onto
            the warm band. */}
        <Soir />
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
