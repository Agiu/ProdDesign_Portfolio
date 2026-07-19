/**
 * The site's one arrow glyph — a plain geometric line rather than the
 * Unicode "→", whose shape (and presence of serifs) varies by font/platform.
 * Sizes with the surrounding text via `1em`, so it drops into any CTA at
 * that CTA's own font-size. Square caps and a mitered head keep the point
 * crisp rather than blunted — deliberately sharper than the case-study
 * page's (unrelated) round-cornered back button.
 */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M5 12h14m0 0-6-6m6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
