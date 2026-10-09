import { about, footer } from "@/content/home";
import { system } from "@/content/system";
import sys from "./System.module.css";
import styles from "./Profile.module.css";

const resume = footer.elsewhere.find((link) => link.label === "Résumé")?.href;

/**
 * The brief About section: two short paragraphs in plain language, and a
 * profile readout built from the same résumé data the rest of the site uses.
 */
export function Profile() {
  const organisations = [...new Set(about.experience.map((role) => role.org))];
  const education = about.education.filter((entry) => !entry.muted);
  const basedIn = footer.now.find((item) => item.label === "Based in")?.value;

  return (
    <section id="about" className={sys.section} aria-labelledby="about-title">
      <div className={sys.container}>
        <div className={sys.sectionHead}>
          <h2 id="about-title" className={sys.sectionTitle}>
            {system.about.heading}
          </h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.prose}>
            {system.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <p className={styles.links}>
              <a href={about.more.href} className={styles.link}>
                {about.more.label}
              </a>
              {resume && (
                <a
                  href={resume}
                  className={styles.link}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Résumé (PDF) <span aria-hidden>↗</span>
                </a>
              )}
            </p>
          </div>

          <dl className={`${sys.readout} ${styles.profile}`}>
            <div className={styles.row}>
              <dt className={sys.label}>Education</dt>
              <dd>
                {education.map((entry) => (
                  <span key={entry.institution} className={styles.entry}>
                    {entry.institution}
                    <span className={sys.label}>
                      {entry.detail}, {entry.period}
                    </span>
                  </span>
                ))}
              </dd>
            </div>

            <div className={styles.row}>
              <dt className={sys.label}>Experience</dt>
              <dd>{organisations.join(", ")}</dd>
            </div>

            <div className={styles.row}>
              <dt className={sys.label}>Disciplines</dt>
              <dd>{system.about.disciplines}</dd>
            </div>

            {basedIn && (
              <div className={styles.row}>
                <dt className={sys.label}>Based in</dt>
                <dd>{basedIn}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
