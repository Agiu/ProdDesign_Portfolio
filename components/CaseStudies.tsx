"use client";

import { caseStudies, caseStudiesIntro } from "@/content/home";
import { CaseCard } from "./CaseCard";
import { useReveal } from "./useReveal";
import styles from "./CaseStudies.module.css";

export function CaseStudies() {
  // Only the card list reveals on scroll. The header stays put so the section
  // title + note can peek above the fold from the hero — a cue that there's
  // more to scroll to — rather than being hidden until the section arrives.
  const reveal = useReveal<HTMLUListElement>();

  return (
    <section className={styles.section} id="work">
      <div className={styles.inner}>
        <div className={styles.header}>
          {/* Unclassed on purpose — the global h2 rule already carries the
              display size and weight, and .header owns the spacing. */}
          <h2>{caseStudiesIntro.heading}</h2>

          <p className={styles.note}>
            {/* Inline, so it sits in the same right-aligned line flow as the
                text and lands immediately before the first word. */}
            <span className={styles.plus} aria-hidden>
              +
            </span>
            {caseStudiesIntro.note}
          </p>
        </div>

        <ul ref={reveal} className={`${styles.list} reveal`}>
          {caseStudies.map((study, i) => (
            <li key={study.slug}>
              <CaseCard
                study={study}
                /* First card is usually above the fold on tall screens. */
                priority={i === 0}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
