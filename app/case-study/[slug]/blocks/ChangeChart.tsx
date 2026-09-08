import { ArrowIcon } from "@/components/ArrowIcon";
import styles from "../CaseStudy.module.css";

/**
 * The `chart` custom block — one `Before -> After` per line.
 *
 * A rename/change log: what a thing used to be called, what it became.
 * Light and text-first like `compare`, not a dark highlight card like
 * `stats` — this reads as part of the paragraph flow, answering an inline
 * "here's what changed" rather than calling out a headline number. The
 * prior term is struck through and dimmed, the arrow marks direction, and
 * the resolved term sits in full ink weight so the eye lands on the name
 * that shipped.
 */

type Change = { before: string; after: string };

function parseChanges(content: string): Change[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [before = "", after = ""] = line.split("->").map((part) => part.trim());
      return { before, after };
    })
    .filter((change) => change.before || change.after);
}

export function ChangeChart({ content }: { content: string }) {
  const changes = parseChanges(content);
  if (changes.length === 0) return null;

  return (
    <div className={styles.chart}>
      {changes.map((change, i) => (
        <div key={i} className={styles.chartRow}>
          {change.before && (
            <span className={styles.chartBefore}>{change.before}</span>
          )}
          <ArrowIcon className={styles.chartArrow} />
          {change.after && <span className={styles.chartAfter}>{change.after}</span>}
        </div>
      ))}
    </div>
  );
}
