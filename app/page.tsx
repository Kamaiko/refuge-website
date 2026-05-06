import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Manifeste from "@/components/sections/Manifeste";
import Medaillons from "@/components/sections/Medaillons";
import Choisir from "@/components/sections/Choisir";
import Hebergements from "@/components/sections/Hebergements";
import MarqueeBrand from "@/components/sections/MarqueeBrand";
import Pourquoi from "@/components/sections/Pourquoi";
import Feedback from "@/components/sections/Feedback";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Manifeste />
        <Medaillons />
        <Choisir />
        <Hebergements />
        <MarqueeBrand />
        <Pourquoi />
        <Feedback />
      </main>
    </>
  );
}
