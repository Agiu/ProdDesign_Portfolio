"use client";

import { about, duration } from "@/content/home";
import { PixelPortrait } from "./PixelPortrait";
import { useReveal } from "./useReveal";
import styles from "./About.module.css";

type Row = {
  /** Already read out — how long for a role, which years for a degree. */
  period: string;
  name: string;
  what: string;
  muted?: boolean;
};

/**
 * One stack of rows — the résumé, and the education under it.
 *
 * A row is one line, three columns: how long, where, and what. Every row in
 * both stacks runs the same track sizes (see .entry), so the three read as
 * columns down the whole section rather than as eight independently laid-out
 * lines. Which is the whole reason there is nothing else in a row: a
 * description would be a fourth thing wanting a column, and the alignment is
 * doing the work a description otherwise would.
 *
 * Neither stack carries a heading; the gap between them is what says they are
 * two lists, and the rows themselves say which is which.
 */
function Stack({ rows }: { rows: Row[] }) {
  return (
    <ul className={styles.list}>
      {rows.map((row) => (
        <li
          key={`${row.name} ${row.what}`}
          className={`${styles.entry} ${row.muted ? styles.muted : ""}`}
        >
          <span className={styles.period}>{row.period}</span>
          <span className={styles.name}>{row.name}</span>
          <span className={styles.what}>{row.what}</span>
        </li>
      ))}
    </ul>
  );
}

export function About() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    /* No visible heading, so the section is named for anything navigating by
       landmark — which is what the heading was doing besides being read. */
    <section className={styles.section} id="about">
      {/* The seam. The work above ends on a hard dark edge against this
          section's paper, so a few of its blocks are carried over it — the
          band frays into the page rather than stopping dead at a ruled line.
          Same corner-cluster idiom as the footer's mosaic, cut down to three. */}
      <span className={styles.seam} aria-hidden>
        <span className={styles.block} data-step="1" />
        <span className={styles.block} data-step="2" />
        <span className={styles.block} data-step="3" />
      </span>

      <div ref={reveal} className={`${styles.inner} reveal`}>
        <div className={styles.top}>
          {/* Arrives as pixels and resolves under the pointer — it owns that
              interaction itself, so there is nothing to wire up here. */}
          <div className={styles.portrait}>
            <PixelPortrait src={about.portrait.src} alt={about.portrait.alt} />

            {/* The strokes that ring off the picture's edge — see .reverb.
                After the portrait in source order so it paints over it, and
                empty because the whole of it is two pseudo-elements. */}
            <span className={styles.reverb} aria-hidden />
          </div>

          {/* Who, what, why — three lines with air between them. Real <p>s
              rather than <br>s now that they are set apart: a line break can't
              carry the gap, and doubling it up to fake one would put an empty
              line into the text for a screen reader to read out.

              The heading sits inside this column rather than over the band, so
              it hangs off the top of the prose it introduces instead of over
              the portrait as well — and it names the section again, which is
              what the aria-label was standing in for while there wasn't one. */}
          <div className={styles.bio}>
            {/* Unclassed on purpose — the global h2 rule already carries the
                display size and weight, and .bio owns the spacing. */}
            <h2>{about.heading}</h2>

            {about.body.map((line) => (
              <p key={line}>{line}</p>
            ))}

            {/* Not one of the three passes above — a fact about the person
                rather than another line of the introduction, so it is set
                apart and quieter rather than added to the run of prose. */}
          </div>
        </div>

        {/* Work first, schooling under it: the roles are what the bio above
            them is claiming, and the degrees are the footnote to that rather
            than the other way round. */}
        <div className={styles.credentials}>
          <Stack
            rows={about.experience.map((role) => ({
              period: duration(role.months),
              name: role.org,
              what: role.title,
            }))}
          />

          <Stack
            rows={about.education.map((entry) => ({
              period: entry.period,
              name: entry.institution,
              what: entry.detail,
              muted: entry.muted,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
