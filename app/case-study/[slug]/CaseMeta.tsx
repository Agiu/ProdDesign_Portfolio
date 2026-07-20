"use client";

import { useState } from "react";
import type { ProjectMeta } from "@/content/home";
import styles from "./CaseStudy.module.css";

/**
 * The project-metadata band under the hero, from the Figma design. A dark
 * card split into a padded left area (Team Members + My Contributions, side by
 * side on desktop) and a flush right stack of two grey panels (My Role over
 * Time). The first team member — the author — is emphasised, and the shared
 * pixel-square ornament sits in the card's bottom-left corner.
 *
 * A toggle bar across the top collapses the whole band (height animates via
 * the grid-rows 1fr→0fr trick, which reduced-motion flattens globally). Below
 * 760px — the same breakpoint the page body uses — the content stacks to one
 * column and the Time panel drops when a study has no `timeline`.
 */
export function CaseMeta({ meta }: { meta: ProjectMeta }) {
  const [open, setOpen] = useState(true);
  const hasAdvisors = meta.advisors && meta.advisors.length > 0;

  return (
    <section className={styles.metaWrap} aria-label="Project details">
      <div className={styles.metaCard}>
        <button
          type="button"
          className={styles.metaToggle}
          aria-expanded={open}
          aria-controls="project-meta-body"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.metaToggleLabel}>Project Details</span>
          <svg
            className={`${styles.metaChevron} ${
              open ? "" : styles.metaChevronCollapsed
            }`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          id="project-meta-body"
          className={styles.metaCollapse}
          data-collapsed={!open}
        >
          <div className={styles.metaClip}>
            <div className={styles.metaBody}>
              <div className={styles.metaMain}>
                <div className={styles.metaCol}>
                  <p className={styles.metaLabel}>Team Members</p>
                  <ul className={styles.metaTeam}>
                    {meta.team.map((name, i) => (
                      <li
                        key={i}
                        className={i === 0 ? styles.metaTeamLead : undefined}
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                  {hasAdvisors && (
                    <>
                      <p
                        className={`${styles.metaLabel} ${styles.metaLabelStacked}`}
                      >
                        Advisors
                      </p>
                      <ul className={styles.metaTeam}>
                        {meta.advisors!.map((name, i) => (
                          <li key={i}>{name}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className={styles.metaCol}>
                  <p className={styles.metaLabel}>My Contributions</p>
                  <ul className={styles.metaContributions}>
                    {meta.contributions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.metaSide}>
                <div className={styles.metaRole}>
                  <p className={styles.metaLabel}>My Role</p>
                  <p className={styles.metaRoleValue}>{meta.role}</p>
                </div>
                {meta.timeline && (
                  <div className={styles.metaTime}>
                    <p className={styles.metaLabel}>Time</p>
                    <p className={styles.metaTimeValue}>{meta.timeline}</p>
                  </div>
                )}
              </div>

              <span className={styles.metaOrnament} aria-hidden>
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
