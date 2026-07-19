import styles from "../CaseStudy.module.css";

/**
 * The `button` custom block — one line of `Label | URL | Icon`.
 *
 * Renders the Figma "button" widget: a dark CTA card with the label and the
 * diagonal ("open") arrow sharing a row — arrow bottom-aligned against the
 * (possibly multi-line) label — and a single ruled underline spanning the
 * full width of that row, beneath both. The third field is an icon name the
 * markdown carries, but the Figma design draws only the diagonal arrow, so
 * it's parsed off and intentionally not shown.
 *
 * The card's background is snug and symmetric (equal top/bottom padding)
 * around whatever the label actually wraps to — a one-line label makes a
 * shorter box, a two-line one a taller box, rather than forcing every
 * variant to match a fixed height.
 *
 * A plain server component — it's just a link, so no client JS is needed.
 */
export function MarkdownButton({ content }: { content: string }) {
  // Only the first line matters; split off label + href (icon is ignored).
  const [label, href] = content.split("\n")[0].split("|").map((s) => s.trim());
  if (!label || !href) return null;

  const external = href.startsWith("http");

  return (
    <a
      className={styles.mdButton}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      <span className={styles.mdButtonRow}>
        <span className={styles.mdButtonLabel}>{label}</span>
        {/* Diagonal up-right arrow — the design's only glyph. Square caps/miter
            to match the site's ArrowIcon rather than a softer Unicode "↗". */}
        <svg
          className={styles.mdButtonArrow}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M7 17 17 7M9 7h8v8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </span>
      <span className={styles.mdButtonRule} aria-hidden />
    </a>
  );
}
