"use client";

import { caseStudies, caseStudiesIntro, type CaseStudy } from "@/content/home";
import {
  BREAK_BASE_COUNT,
  BREAK_BLOCKS,
  BREAK_COLUMNS,
  BREAK_ROWS,
} from "./breakBlocks";
import { CaseCard } from "./CaseCard";
import { useOrganicBlocks } from "./useOrganicBlocks";
import { useReveal } from "./useReveal";
import styles from "./CaseStudies.module.css";

const u = (n: number) => `calc(${n} * var(--u))`;

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

/**
 * The break between the lead card and the rest: a label, a hairline, and a
 * small block cluster standing on the end of it — the footer's mosaic
 * (breakBlocks.ts) at ornament scale, inked for paper instead of night.
 *
 * The heading is real, not decoration: it's what makes the second `<ul>` below
 * a named group rather than an unexplained second list.
 */
function CaseBreak() {
  const blocks = useOrganicBlocks(BREAK_BASE_COUNT, BREAK_BLOCKS.length);
  const reveal = useReveal<HTMLDivElement>();

  return (
    <div ref={reveal} className={`${styles.break} reveal`}>
      <h3 className={styles.breakLabel}>{caseStudiesIntro.more}</h3>
      <span className={styles.rule} aria-hidden />

      <span
        className={styles.breakMosaic}
        style={{ width: u(BREAK_COLUMNS), height: u(BREAK_ROWS) }}
        aria-hidden
      >
        {BREAK_BLOCKS.map((b, i) => (
          <span
            key={i}
            ref={(el) => {
              blocks.current[i] = el;
            }}
            className={styles.breakBlock}
            data-kind={b.kind}
            style={{
              left: u(b.a),
              bottom: u(b.b),
              width: u(b.s),
              height: u(b.s),
              /* Grow blocks scale up from the edge where they touch the
                 cluster, so they read as sprouting from it rather than
                 swelling in from nowhere. Base blocks leave the class's
                 centred default, which is inert since they never scale. */
              transformOrigin: b.origin,
            }}
          />
        ))}
      </span>
    </div>
  );
}

export function CaseStudies() {
  const [lead, ...rest] = caseStudies;

  // The header stays put so the section title + note can peek above the fold
  // from the hero — a cue that there's more to scroll to — rather than being
  // hidden until the section arrives.
  return (
    <section className={styles.section} id="work">
      <div className={styles.inner}>
        <div className={styles.header}>
          {/* Unclassed on purpose — the global h2 rule already carries the
              display size and weight, and .header owns the spacing. */}
          <h2>{caseStudiesIntro.heading}</h2>

          <p className={styles.note}>{caseStudiesIntro.note}</p>
        </div>

        {/* Two lists, not one: the lead card and the rest are separate groups,
            and the break between them carries the <h3> that names the second.
            A single list with a divider spliced into it would either lie about
            its item count or leave that heading dangling outside any group. */}
        <ul className={styles.list}>
          <CaseItem
            study={lead}
            /* Usually above the fold on tall screens. */
            priority
            /* The lead card gets the taller frame and the caption-below layout
               instead of the sliding panel — see CaseCard.tsx. */
            featured
          />
        </ul>

        {rest.length > 0 && (
          <>
            <CaseBreak />

            <ul className={styles.list}>
              {rest.map((study) => (
                <CaseItem
                  key={study.slug}
                  study={study}
                  priority={false}
                  featured={false}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
