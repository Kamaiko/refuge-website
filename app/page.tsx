import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Manifeste from "@/components/sections/Manifeste";
import Medaillons from "@/components/sections/Medaillons";
import Choisir from "@/components/sections/Choisir";
import Capsules from "@/components/sections/Capsules";
import MarqueeBrand from "@/components/sections/MarqueeBrand";
import Vivre from "@/components/sections/Vivre";
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
        <Capsules />
        <MarqueeBrand />
        <Vivre />
        <Feedback />
      </main>
    </>
  );
}
