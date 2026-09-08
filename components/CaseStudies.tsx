"use client";

import { listedCaseStudies, type CaseStudy } from "@/content/home";
import { CaseCard } from "./CaseCard";
import { useReveal } from "./useReveal";
import styles from "./CaseStudies.module.css";

/**
 * One row of the list. The reveal lives here rather than on the `<ul>` so each
 * card fades up as it reaches the viewport, instead of the whole section
 * arriving as a single slab.
 *
 * It sits on the `<li>` and not on the card itself on purpose: the card's own
 * transforms are written per-frame by anime.js (CaseCard.tsx), and this way the
 * entrance animation never has to share an element with them.
 */
function CaseItem({
  study,
  priority,
  featured,
}: {
  study: CaseStudy;
  priority: boolean;
  featured: boolean;
}) {
  const reveal = useReveal<HTMLLIElement>();

  return (
    <li ref={reveal} className="reveal">
      <CaseCard study={study} priority={priority} featured={featured} />
    </li>
  );
}

export function CaseStudies() {
  const [lead, ...rest] = listedCaseStudies;

  /*
   * The section starts below the fold: the hero owns the whole first screen,
   * and this band arrives on its own terms as the reader scrolls into it.
   *
   * One list, unheaded — the cards introduce themselves. The lead is simply its
   * first item, set apart by a little extra air beneath it (see .list in the
   * stylesheet) rather than by a divider.
   */
  return (
    <section className={styles.section} id="work">
      <div className={styles.inner}>
        <ul className={styles.list}>
          <CaseItem
            study={lead}
            /* Usually above the fold on tall screens. */
            priority
            /* The lead card gets the taller frame and the caption-below layout
               instead of the sliding panel — see CaseCard.tsx. */
            featured
          />

          {rest.map((study) => (
            <CaseItem
              key={study.slug}
              study={study}
              priority={false}
              featured={false}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
