import type { ProjectMeta } from "@/content/home";
import styles from "./CaseStudy.module.css";

/**
 * Role and Time, set into the hero's own bottom-right rather than the band
 * below it. Both are a label and one short value — there was empty paper on
 * that side of every hero doing nothing while the study's two shortest facts
 * queued up in a band of their own beneath it.
 *
 * Desktop only (`.heroVitals` hides itself below 761px, CaseStudy.module.css)
 * — a phone's hero is too short on both height and width to earn a second
 * column, so `CaseMeta` below carries the same two facts back in the band for
 * that width instead. Duplicated in the DOM rather than reflowed with CSS
 * `order`: the two live in genuinely different parents (this one absolutely
 * positioned over a photograph, that one in the paper band's own flow) with
 * different colour systems, and exactly one copy is ever `display`-ed at a
 * time, so nothing doubles up for a screen reader.
 */
export function CaseHeroVitals({ meta }: { meta: ProjectMeta }) {
  return (
    <div className={styles.heroVitals}>
      <div className={styles.heroVitalsGroup}>
        <p className={styles.heroVitalsLabel}>My Role</p>
        <p className={styles.heroVitalsValue}>{meta.role}</p>
      </div>

      {meta.timeline && (
        <div className={styles.heroVitalsGroup}>
          <p className={styles.heroVitalsLabel}>Time</p>
          <p className={styles.heroVitalsValue}>{meta.timeline}</p>
          {meta.timelineDetail && (
            <p className={styles.heroVitalsDetail}>{meta.timelineDetail}</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The rest of the vitals — Contributions and Team, plus (mobile only) the
 * Role/Time that live in the hero above 760px — as one band on paper with no
 * divider inside it and no rule along the top: the hero's own bottom edge is
 * already the line this sits under, and a second one a few pixels below it
 * just boxed the band in.
 *
 * Source order is the *phone's* reading order — Role, Contributions, Team,
 * Time — so the width that stacks these vertically needs no `order` juggling
 * to say what it means: what I was, what I did, who I did it with, when.
 * Desktop is the one that reorders (`.metaGroup` before `.metaContribGroup`),
 * and it only swaps two blocks sitting side by side in a row, where there is
 * no strong reading order to contradict in the first place.
 *
 * `.metaMobileOnly` marks the two that are hidden above 760px because
 * `CaseHeroVitals` is carrying them — see its note for why they're a second
 * copy in the DOM rather than one moved around with CSS.
 */
export function CaseMeta({ meta }: { meta: ProjectMeta }) {
  return (
    <section className={styles.metaWrap} aria-label="Project details">
      <div className={styles.metaRow}>
        <div className={`${styles.metaGroup} ${styles.metaMobileOnly}`}>
          <p className={styles.metaLabel}>My Role</p>
          <p className={styles.metaValue}>{meta.role}</p>
        </div>

        <div className={styles.metaContribGroup}>
          <p className={styles.metaLabel}>Outcomes</p>
          <ul className={styles.metaContributions}>
            {meta.contributions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.metaGroup}>
          <p className={styles.metaLabel}>Team Members</p>
          <ul className={styles.metaTeam}>
            {meta.team.map((name, i) => (
              <li key={i} className={i === 0 ? styles.metaTeamLead : undefined}>
                {name}
              </li>
            ))}
          </ul>

          {meta.advisors && meta.advisors.length > 0 && (
            <>
              <p className={`${styles.metaLabel} ${styles.metaLabelStacked}`}>
                Advisors
              </p>
              <ul className={styles.metaAdvisors}>
                {meta.advisors.map((advisor, i) => (
                  <li key={i}>
                    {advisor.name}
                    {advisor.title && (
                      <span className={styles.metaAdvisorTitle}>, {advisor.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {meta.timeline && (
          <div className={`${styles.metaGroup} ${styles.metaMobileOnly}`}>
            <p className={styles.metaLabel}>Time</p>
            <p className={styles.metaValue}>{meta.timeline}</p>
            {meta.timelineDetail && (
              <p className={styles.metaTimeDetail}>{meta.timelineDetail}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
