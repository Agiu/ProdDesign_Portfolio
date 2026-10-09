import styles from "./System.module.css";

/*
 * The registration frame: small solid squares at a block's corners and, on the
 * full frame, at the midpoint of each edge. It's the redesign's one recurring
 * motif, so the page uses it twice at most (hero and contact). Place it inside
 * a positioned element; it fills that element's box.
 */
const FULL = ["tl", "tc", "tr", "ml", "mr", "bl", "bc", "br"] as const;
const CORNERS = ["tl", "tr", "bl", "br"] as const;

export function RegMarks({ cornersOnly = false }: { cornersOnly?: boolean }) {
  const marks = cornersOnly ? CORNERS : FULL;

  return (
    <div className={styles.marks} aria-hidden>
      {marks.map((at) => (
        <span key={at} className={styles.mark} data-at={at} />
      ))}
    </div>
  );
}
