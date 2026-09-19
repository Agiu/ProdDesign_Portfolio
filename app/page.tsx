import { SystemHero } from "@/components/system/SystemHero";
import { WorkRegistry } from "@/components/system/WorkRegistry";
import { Profile } from "@/components/system/Profile";
import { FilmReel } from "@/components/system/FilmReel";
import { Contact } from "@/components/system/Contact";
import sys from "@/components/system/System.module.css";

/*
 * Terminal pretrial (see kaelub-redesign-prd.md). Only the homepage is
 * reskinned; case studies, /films, and /recruiter are untouched. The previous
 * homepage's components (Hero, ScrollCue, CaseStudies, About, Filmmaker,
 * Footer, and page.module.css) are left in place, unused, so the two can be
 * compared or swapped back.
 *
 * data-system is what globals.css keys the page ground and the transition
 * curtain off, so neither leaks onto other routes.
 */
export default function Home() {
  return (
    <div className={sys.system} data-system>
      <main>
        <SystemHero />
        <WorkRegistry />
        <Profile />
        <FilmReel />
      </main>
      <Contact />
    </div>
  );
}
