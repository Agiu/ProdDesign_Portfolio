import { Hero } from "@/components/Hero";
import { CaseStudies } from "@/components/CaseStudies";
import { About } from "@/components/About";
import { Filmmaker } from "@/components/Filmmaker";
import { Footer } from "@/components/Footer";
import { HideScrollbar } from "@/components/HideScrollbar";

export default function Home() {
  return (
    <>
      <HideScrollbar />
      <main>
        <Hero />
        <CaseStudies />
        <About />
        <Filmmaker />
      </main>
      <Footer />
    </>
  );
}
