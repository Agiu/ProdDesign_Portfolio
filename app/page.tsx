import { Hero } from "@/components/Hero";
import { CaseStudies } from "@/components/CaseStudies";
import { About } from "@/components/About";
import { Filmmaker } from "@/components/Filmmaker";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
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
