"use client";

import { about } from "@/content/home";
import { useReveal } from "./useReveal";
import styles from "./About.module.css";

export function About() {
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section className={styles.section} id="about">
      <div ref={reveal} className={`${styles.inner} reveal`}>
        <h2 className={styles.heading}>{about.heading}</h2>

        <div className={styles.grid}>
          <p className={styles.bio}>{about.body}</p>

          <div className={styles.education}>
            <h3 className={styles.label}>Education</h3>
            <dl className={styles.list}>
              {about.education.map((entry) => (
                <div
                  key={entry.institution}
                  className={`${styles.entry} ${entry.muted ? styles.muted : ""}`}
                >
                  <dt>
                    <span className={styles.institution}>
                      {entry.institution}
                    </span>
                    <span className={styles.detail}>{entry.detail}</span>
                  </dt>
                  <dd className={styles.period}>{entry.period}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
