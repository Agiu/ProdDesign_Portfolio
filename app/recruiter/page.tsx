import type { Metadata } from "next";
import { greeting } from "@/content/recruiter";
import { RecruiterHero } from "./RecruiterHero";
import { Timeline } from "./Timeline";
import { Contact } from "./Contact";
import { BackToTop } from "./BackToTop";
import styles from "./Recruiter.module.css";

export const metadata: Metadata = {
  title: "For Recruiters · Caleb Aguiar",
  description: greeting.intro,
};

/**
 * `/recruiter` — the whole résumé in one scroll: the greeting, every position
 * on a single rail with what it changed and a picture of it, and then the ask.
 *
 * Unlinked from the site's own navigation on purpose. It's the page you send
 * someone, not one a visitor stumbles into on the way to the work.
 */
export default function RecruiterPage() {
  return (
    <>
      {/*
        Without JS the rail's entries never animate, and their resting state
        (see .entry[data-anim] in the stylesheet) would leave the page a blank
        column. Attribute selectors rather than class names because a CSS
        module's names are hashed at build time and nothing here could spell
        them — same reason layout.tsx's <noscript> names `.reveal` and
        `[data-intro]` and nothing else.
      */}
      <noscript>
        <style>{`
          [data-anim="pending"] [data-row],
          [data-anim="pending"] [data-mark] {
            opacity: 1 !important;
            transform: none !important;
          }
          [data-anim="pending"] [data-spine] { transform: none !important; }
        `}</style>
      </noscript>

      <main className={styles.page}>
        <RecruiterHero />
        <Timeline />
        <Contact />
      </main>
      <BackToTop />
    </>
  );
}
