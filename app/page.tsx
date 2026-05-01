import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Manifeste from "@/components/sections/Manifeste";
import Medaillons from "@/components/sections/Medaillons";
import Lieu from "@/components/sections/Lieu";
import Concept from "@/components/sections/Concept";
import MarqueeBrand from "@/components/sections/MarqueeBrand";
import Choisir from "@/components/sections/Choisir";
import Unites from "@/components/sections/Unites";
import Activites from "@/components/sections/Activites";
import Galerie from "@/components/sections/Galerie";
import Journal from "@/components/sections/Journal";
import FAQSection from "@/components/sections/FAQ";
import Reservation from "@/components/sections/Reservation";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Manifeste />
        <Medaillons />
        <Lieu />
        <Concept />
        <MarqueeBrand />
        <Choisir />
        <Unites />
        <Activites />
        <Galerie />
        <Journal />
        <FAQSection />
        <Reservation />
      </main>
      <Footer />
    </>
  );
}
