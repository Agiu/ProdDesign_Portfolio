import { Hero } from "@/components/Hero";
import { CaseStudies } from "@/components/CaseStudies";
import { About } from "@/components/About";
import { Filmmaker } from "@/components/Filmmaker";
import { Footer } from "@/components/Footer";
import { HideScrollbar } from "@/components/HideScrollbar";
import { ScrollCue } from "@/components/ScrollCue";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <HideScrollbar />
      <main>
        {/* The hero is pinned for its own height of scroll and the rest of the
            page is drawn up over it — see page.module.css. */}
        <div className={styles.pin}>
          <Hero />
        </div>
        <div className={styles.stack}>
          {/* Stands on this wrapper's top edge, i.e. the work section's, and
              rides up over the pinned hero with it. */}
          <ScrollCue />
          <CaseStudies />
          <About />
          <Filmmaker />
        </div>
      </main>
      <Footer />
    </>
  );
}
