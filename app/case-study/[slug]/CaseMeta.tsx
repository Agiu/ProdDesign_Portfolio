import type { ProjectMeta } from "@/content/home";
import styles from "./CaseStudy.module.css";

export function CaseMeta({ meta }: { meta: ProjectMeta }) {
  return (
    <section aria-label="Project details">
      {meta.contributions.length > 0 && (
        <div className={styles.outcomes}>
          <p className={styles.factLabel}>Outcomes</p>
          <ol className={styles.outcomeList}>
            {meta.contributions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </div>
      )}

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>My Role</dt>
          <dd className={styles.factValue}>{meta.role}</dd>
        </div>

        {meta.timeline && (
          <div className={`${styles.fact} ${styles.factTimeline}`}>
            <dt className={styles.factLabel}>Timeline</dt>
            <dd className={styles.factValue}>
              {meta.timeline}
              {meta.timelineDetail && (
                <span className={styles.factDetail}>{meta.timelineDetail}</span>
              )}
            </dd>
          </div>
        )}

        <div className={styles.fact}>
          <dt className={styles.factLabel}>Team</dt>
          <dd>
            <ul className={styles.factList}>
              {meta.team.map((name, i) => (
                <li key={i} className={i === 0 ? styles.factListLead : undefined}>
                  {name}
                </li>
              ))}
            </ul>
          </dd>
        </div>

        {meta.advisors && meta.advisors.length > 0 && (
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Advisors</dt>
            <dd>
              <ul className={`${styles.factList} ${styles.advisorList}`}>
                {meta.advisors.map((advisor, i) => (
                  <li key={i}>
                    {advisor.name}
                    {advisor.title && (
                      <span className={styles.factDetail}>{advisor.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
