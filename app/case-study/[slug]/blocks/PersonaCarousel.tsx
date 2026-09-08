"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import styles from "../CaseStudy.module.css";

/**
 * The `personas` custom block — one interviewee category per line:
 *
 *   ID | Name | Traits, comma-separated | Group traits, comma-separated | Tag
 *
 * The last two fields are optional (some categories weren't interviewed as
 * part of a group, and only a couple carry a Game Pass tier worth calling
 * out). Renders as a full-bleed strip that runs edge-to-edge of the viewport
 * rather than sitting inside the narrow content column — there are eight of
 * these and the point is breadth across the whole audience, which a column
 * as wide as body copy would flatten into a long scroll of near-identical
 * cards.
 *
 * `data-nav-fade` marks this element for Toc.tsx: the sticky "Navigation"
 * rail lives in the column this strip breaks out of, and a strip cards wide
 * enough to reach the viewport edge would run straight through it, so the
 * rail fades out while this is in view (desktop only — see Toc.tsx) rather
 * than fighting it for the same strip of screen.
 *
 * Below the strip sits a scrubber — a plain `<input type="range">` bound to
 * scroll position, the same "drag the bar, the strip slides" control OpenAI's
 * incident-timeline carousel uses. It reads back from the strip's own scroll
 * events (so scrolling by hand keeps it in sync) and writes straight to
 * `scrollLeft` on input rather than `scrollBy`, so it tracks the pointer 1:1
 * during a drag instead of chasing a smooth-scroll animation. A native range
 * gets keyboard and screen-reader support for free — arrow keys and Home/End
 * all move it without any extra wiring here. There's no scroll-snap on the
 * strip itself (see .personaStrip) for the same reason: snapping would yank
 * the strip to the nearest card mid-drag instead of tracking the scrubber
 * smoothly. `--progress` (also set inline, same value as the range itself)
 * is what paints the track in two shades — travelled in one, remaining in
 * the other — see .personaScrubInput.
 *
 * At rest (scrollLeft 0) the first card's left edge lines up with the left
 * edge of the content column — the actual rendered edge of the "markdown
 * box", not an approximation of it. Two things make that a measurement
 * rather than a `calc()`:
 *
 *   1. The column sits to the right of the sticky Navigation rail (Toc.tsx),
 *      whose own width is a `minmax()` grid track (CaseStudy.module.css's
 *      `.body`) with no fixed pixel value CSS can hand to another element's
 *      `calc()`.
 *   2. The classic "full-bleed" trick this block used to use for
 *      `.personaCarousel` itself — `width: 100vw` plus a `calc(50% - 50vw)`
 *      (or equivalently `left: 50%; margin-left: -50vw`) — only actually
 *      lands on the true viewport edge when the element's own ancestor is
 *      *centred* in the viewport, because that `%` resolves against the
 *      ancestor's width, not the viewport's. `.content` is the second column
 *      of the nav+content grid, pushed right by the rail with nothing
 *      matching it on the right, so it isn't centred — the calc version
 *      landed short of the real edge by however wide the rail happened to
 *      be.
 *
 * `getBoundingClientRect` on the actual `.content` ancestor sidesteps both:
 * it's the one number that already accounts for the rail's resolved width,
 * and it's what turns `.personaCarousel`'s bleed into a real 0-to-viewport
 * span regardless of what sits to either side of `.content`. The layout
 * effect below measures it once and uses it for two different offsets:
 * `.personaCarousel`'s own negative margin-left (so the wrapper spans true
 * edge to true edge) and `.personaStrip`'s padding-inline (so the first card
 * still starts at the content column's edge inside that now-correct span).
 * The stylesheet's plain gutter-based `calc()` is only the fallback for SSR
 * and the first client paint, before this effect has run. Past that inset,
 * the strip fades to transparent at both ends (a mask-image on
 * .personaStrip) instead of stopping on a hard card edge — the cue that
 * there's more to either side once you've scrolled past the aligned start.
 *
 * Eight cards at their clamped width comfortably exceed the content
 * column's own width, so the strip overflows — and stays scrollable — at
 * any viewport size; there's deliberately no attempt to fit them all in
 * view on a wide screen.
 *
 * Each card carries its own `--accent` (one of ACCENTS below, assigned by
 * position) — eight near-identical dark cards in a row read as one grey
 * smear at a glance, so the id, name, and top edge of each are tinted a
 * distinct hue to make the eight categories separable while still scanning
 * as one coordinated set rather than a random clash.
 */

const ACCENTS = [
  "#5B9DFF", // blue
  "#FF9F45", // orange
  "#4ED9A0", // green
  "#FF6E6E", // red
  "#C99BFF", // purple
  "#3FD4C6", // teal
  "#FF80C0", // pink
  "#FFD166", // amber
];

type Persona = {
  id: string;
  name: string;
  traits: string[];
  group: string[];
  tag: string;
};

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parsePersonas(content: string): Persona[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id = "", name = "", traits = "", group = "", tag = ""] = line
        .split("|")
        .map((part) => part.trim());
      return {
        id,
        name,
        traits: splitList(traits),
        group: splitList(group),
        tag,
      };
    })
    .filter((p) => p.id && p.name);
}

export function PersonaCarousel({ content }: { content: string }) {
  const personas = parsePersonas(content);
  const carousel = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  // 0–100, the strip's own scrollLeft expressed as a fraction of its scroll
  // range — what the scrubber's value reads and writes.
  const [progress, setProgress] = useState(0);
  // Measured distance from the viewport's left edge to the content column's
  // own left edge — null until measured, in which case the stylesheet's
  // gutter-based approximation applies instead (see .personaCarousel and
  // .personaStrip). Drives both: a negative margin on the wrapper (true
  // full-bleed) and inline padding on the strip (aligning the first card).
  const [inset, setInset] = useState<number | null>(null);

  // A layout effect, not a plain effect: this runs before the browser paints,
  // so nothing ever visibly flashes the approximate CSS position before
  // snapping to the measured one.
  useLayoutEffect(() => {
    const el = strip.current;
    const content = el?.closest<HTMLElement>(`.${styles.content}`);
    if (!content) return;

    const measure = () => setInset(content.getBoundingClientRect().left);
    measure();

    window.addEventListener("resize", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(content);

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setOverflowing(max > 1);
      setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [personas.length]);

  if (personas.length === 0) return null;

  // Direct scrollLeft assignment, not scrollBy/scrollTo — a smooth-scroll
  // animation would lag behind the pointer while the scrubber is mid-drag.
  const scrub = (value: number) => {
    const el = strip.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (value / 100) * max;
  };

  return (
    <div
      className={styles.personaCarousel}
      data-nav-fade
      ref={carousel}
      style={inset !== null ? { marginLeft: `${-inset}px` } : undefined}
    >
      <ul
        className={styles.personaStrip}
        ref={strip}
        style={inset !== null ? { paddingInline: `${inset}px` } : undefined}
      >
        {personas.map((persona, i) => (
          <li
            key={`${persona.id}-${i}`}
            className={styles.personaCard}
            style={{ "--accent": ACCENTS[i % ACCENTS.length] } as CSSProperties}
          >
            <span className={styles.personaIdRow}>
              <span className={styles.personaDot} aria-hidden />
              <span className={styles.personaId}>{persona.id}</span>
            </span>
            <h3 className={styles.personaName}>{persona.name}</h3>

            {persona.traits.length > 0 && (
              <ul className={styles.personaChips}>
                {persona.traits.map((trait, j) => (
                  <li key={j} className={styles.personaChip}>
                    {trait}
                  </li>
                ))}
              </ul>
            )}

            {persona.group.length > 0 && (
              <>
                <p className={styles.personaGroupLabel}>Group</p>
                <ul className={styles.personaChips}>
                  {persona.group.map((trait, j) => (
                    <li
                      key={j}
                      className={`${styles.personaChip} ${styles.personaChipMuted}`}
                    >
                      {trait}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {persona.tag && <p className={styles.personaTag}>{persona.tag}</p>}
          </li>
        ))}
      </ul>

      {overflowing && (
        <div className={styles.personaScrub}>
          <input
            type="range"
            className={styles.personaScrubInput}
            style={{ "--progress": progress } as CSSProperties}
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={(e) => scrub(Number(e.target.value))}
            aria-label="Scroll through player categories"
          />
        </div>
      )}
    </div>
  );
}
