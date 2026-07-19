import { Icon } from "./Icon";
import styles from "../CaseStudy.module.css";

/**
 * The `stats` custom block — one `Value | Label | Icon` per line.
 *
 * Renders the Figma "stats" widget: dark, dot-textured cards, each with its
 * label up top, an oversized value bottom-left, the named icon bottom-right,
 * and the shared square ornament in the top-right corner. Stacks full-width
 * on mobile, two per row from tablet up (see .stats in the stylesheet); if
 * that leaves an odd card alone in the last row, it spans both columns
 * rather than sitting in a half-empty row.
 */

type Stat = { value: string; label: string; icon: string };

function parseStats(content: string): Stat[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value = "", label = "", icon = ""] = line
        .split("|")
        .map((part) => part.trim());
      return { value, label, icon };
    });
}

export function StatsBlock({ content }: { content: string }) {
  const stats = parseStats(content);
  if (stats.length === 0) return null;

  // On the two-column desktop grid, an odd count leaves the last card alone
  // in its row — span it full-width instead of leaving the other column empty.
  const spanLast = stats.length % 2 === 1;

  return (
    <div className={styles.stats}>
      {stats.map((stat, i) => {
        const isLast = i === stats.length - 1;
        const className =
          spanLast && isLast
            ? `${styles.statCard} ${styles.statCardWide}`
            : styles.statCard;
        return (
          <div key={i} className={className}>
            <span className={styles.quoteOrnament} aria-hidden>
              <i />
              <i />
              <i />
            </span>
            {stat.label && <p className={styles.statLabel}>{stat.label}</p>}
            <div className={styles.statBottom}>
              <span className={styles.statValue}>{stat.value}</span>
              {stat.icon && <Icon name={stat.icon} className={styles.statIcon} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
