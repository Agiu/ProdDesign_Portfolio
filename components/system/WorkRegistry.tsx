"use client";

import Image from "next/image";
import { useState, type MouseEvent, type ReactNode } from "react";
import { listedCaseStudies, type CaseStudy } from "@/content/home";
import { system } from "@/content/system";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import sys from "./System.module.css";
import styles from "./WorkRegistry.module.css";

/**
 * A link to a study, with the same coming-soon handling as CaseCard.tsx: a
 * study flagged `comingSoon` opens its dialog instead of navigating, and opts
 * out of PageTransition's curtain so the click reaches this handler.
 */
function StudyLink({
  study,
  className,
  children,
}: {
  study: CaseStudy;
  className: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const soon = study.comingSoon;

  return (
    <>
      <a
        href={`/case-study/${study.slug}`}
        className={className}
        data-no-curtain={soon ? "" : undefined}
        onClick={
          soon
            ? (event: MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault();
                setOpen(true);
              }
            : undefined
        }
      >
        {children}
      </a>
      {soon && (
        <ComingSoonModal
          open={open}
          onClose={() => setOpen(false)}
          title={study.title}
          figmaUrl={soon.figmaUrl}
          seeInsteadHref={`/case-study/${soon.seeInstead}`}
          seeInsteadLabel={soon.seeInsteadTitle}
        />
      )}
    </>
  );
}

/** The study's readout block. Only fields that exist are shown. */
function readouts(study: CaseStudy) {
  return [
    { label: "Role", value: study.meta?.role },
    { label: "Year", value: study.year },
    { label: "Discipline", value: study.discipline },
    { label: "Access", value: study.protected ? "Password protected" : undefined },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));
}

/**
 * The case study registry. Every title, summary, and readout is visible at
 * rest; hover and focus only restore the cover's colour and fill the "Read"
 * control, so nothing depends on a pointer.
 */
export function WorkRegistry() {
  const featured = listedCaseStudies.slice(0, system.work.featuredCount);
  const more = listedCaseStudies.slice(system.work.featuredCount);

  return (
    <section
      id="work"
      className={`${sys.section} ${styles.first}`}
      aria-labelledby="work-title"
    >
      <div className={sys.container}>
        <div className={sys.sectionHead}>
          <h2 id="work-title" className={sys.sectionTitle}>
            {system.work.heading}
          </h2>
          <p className={`${sys.readout} ${sys.label}`}>
            {listedCaseStudies.length} projects
          </p>
        </div>

        <ul className={styles.list}>
          {featured.map((study, i) => (
            <li key={study.slug}>
              <StudyLink study={study} className={styles.entry}>
                <span className={`${sys.duotone} ${styles.cover}`}>
                  <Image
                    src={study.cover}
                    alt=""
                    fill
                    loading={i === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 900px) 100vw, 540px"
                    className={styles.coverImage}
                  />
                </span>

                <span className={styles.text}>
                  <span className={styles.title}>{study.title}</span>
                  <span className={styles.summary}>{study.summary}</span>
                  <span className={`${sys.readout} ${styles.meta}`}>
                    {readouts(study).map(({ label, value }) => (
                      <span key={label} className={styles.metaRow}>
                        <span className={sys.label}>{label}</span>
                        <span>{value}</span>
                      </span>
                    ))}
                  </span>
                  <span className={styles.open}>Read case study</span>
                </span>
              </StudyLink>
            </li>
          ))}
        </ul>

        {more.length > 0 && (
          <>
            <h3 className={styles.moreHeading}>{system.work.moreHeading}</h3>
            <ul className={styles.list}>
              {more.map((study) => (
                <li key={study.slug}>
                  <StudyLink study={study} className={styles.row}>
                    <span className={styles.rowTitle}>{study.title}</span>
                    <span className={`${sys.readout} ${styles.rowDiscipline}`}>
                      {study.discipline}
                    </span>
                    <span className={`${sys.readout} ${styles.rowYear}`}>
                      {study.year}
                    </span>
                  </StudyLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
