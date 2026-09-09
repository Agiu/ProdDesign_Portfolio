"use client";

import { createTimeline, cubicBezier, stagger } from "animejs";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import styles from "../CaseStudy.module.css";

/**
 * The `variants` custom block — the Logbook Link modal, redrawn once per
 * design pass and run along a strip you can scrub.
 *
 * These are the seven variants of the track-log → logbook prompt from the
 * ForeFlight branding file, rebuilt in markup rather than pasted in as a flat
 * export of the Figma board. Two reasons for rebuilding them:
 *
 *   1. A screenshot of seven near-identical modals is a wall. Laid along the
 *      same scrubbable strip the Xbox study uses for its interviewee
 *      categories (PersonaCarousel.tsx, whose measuring and scrubber this
 *      block reuses wholesale), they're read one at a time, in the order the
 *      passes actually happened — barest first, most furnished last.
 *   2. The variants differ by what each one *adds*: a plane, then a book
 *      beside it, then a rule under the route, then the blurb that explains
 *      why any of it is on screen. Those differences are a part list, so the
 *      fence authors them as one (see parseVariants) and the modal below is
 *      assembled from it — the same modal every time, with parts switched on.
 *
 * "Slightly interactable" is the point of the rebuild: every card's own
 * `Link Track Log` presses, and pressing it plays that variant through to the
 * confirmation the seventh variant shows at rest — the green bar, the check,
 * "Redirecting you to logbook…" — before settling back. The close control
 * dismisses the card and it returns. Nothing here navigates anywhere; it's a
 * design board you can poke, not a prototype pretending to be the product.
 *
 * Sizes are the Figma numbers, kept as Figma numbers: the modal is 168px wide
 * (127px for the two narrow passes) with 6px body copy, all multiplied by
 * `--s` in the stylesheet. So the proportions are the file's, at a size a
 * reader can actually read, and re-scaling the whole set is one number.
 *
 * Entrance follows TrackStream.tsx and LinkFlow.tsx: CSS owns the pending
 * state off `data-anim`, so the cards are served hidden rather than hidden by
 * a script after first paint, and both ways out of it — reduced motion, and
 * no JS at all — settle every card where it belongs.
 */

const EASE = cubicBezier(0.22, 1, 0.36, 1);

/* Same margin the site's reveal hook uses, so this trips on the same beat as
   every other block that arrives on scroll. */
const ROOT_MARGIN = "0px 0px -15% 0px";

/* How long a pressed card holds the confirmation, and how long a dismissed
   one stays gone. Both long enough to read, short enough that a reader who
   pressed two cards in a row isn't waiting on the first. */
const CONFIRM_MS = 2000;
const DISMISS_MS = 900;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The parts a variant can switch on. Anything else in the fence is ignored
 *  rather than rendered as a mystery. */
const PARTS = [
  "narrow",
  "plane",
  "book",
  "route",
  "rule",
  "blurb",
  "action",
  "confirm",
] as const;
type Part = (typeof PARTS)[number];

type Variant = { name: string; parts: Set<Part>; note: string };
type Copy = {
  title: string;
  route: string;
  blurb: string;
  action: string;
  confirm: string;
};

/** Idle, mid-press, or dismissed — per card, and never for long. */
type CardState = "idle" | "confirming" | "dismissed";

const DEFAULT_COPY: Copy = {
  title: "Logbook Link",
  route: "",
  blurb: "",
  action: "Link Track Log",
  confirm: "",
};

/**
 * The fence. Copy shared by every variant is set once at the top, then one
 * line per variant:
 *
 *   title:   the modal's header
 *   route:   the flight it's offering to link
 *   blurb:   the explanatory line, on the variants that carry one
 *   action:  the button label
 *   confirm: what the confirmation says
 *
 *   variant: name | parts, comma-separated | what this pass was trying
 *
 * The copy lives here rather than in this file because it is the designed
 * copy — changing "Link Track Log" is a design decision, and it belongs next
 * to the prose making the argument, not in a constant.
 */
function parseVariants(content: string): { copy: Copy; variants: Variant[] } {
  const copy = { ...DEFAULT_COPY };
  const variants: Variant[] = [];

  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (key === "variant") {
      const [name = "", parts = "", note = ""] = value
        .split("|")
        .map((part) => part.trim());
      if (!name) continue;
      variants.push({
        name,
        parts: new Set(
          parts
            .split(",")
            .map((part) => part.trim().toLowerCase())
            .filter((part): part is Part => (PARTS as readonly string[]).includes(part)),
        ),
        note,
      });
    } else if (key in copy) {
      copy[key as keyof Copy] = value;
    }
  }

  return { copy, variants };
}

export function VariantCarousel({ content }: { content: string }) {
  const { copy, variants } = parseVariants(content);

  const strip = useRef<HTMLUListElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const timers = useRef(new Map<number, number>());

  const [overflowing, setOverflowing] = useState(false);
  // 0–100, the strip's own scrollLeft as a fraction of its scroll range —
  // what the scrubber reads and writes.
  const [progress, setProgress] = useState(0);
  // Measured distance from the viewport's left edge to the content column's,
  // null until measured. See PersonaCarousel.tsx for why this is a
  // measurement rather than a calc(); the same reasoning applies here.
  const [inset, setInset] = useState<number | null>(null);
  const [states, setStates] = useState<Record<number, CardState>>({});

  // A layout effect, not a plain effect: this runs before the browser paints,
  // so nothing flashes the approximate CSS position before the measured one.
  useLayoutEffect(() => {
    const el = strip.current;
    const column = el?.closest<HTMLElement>(`.${styles.content}`);
    if (!column) return;

    const measure = () => setInset(column.getBoundingClientRect().left);
    measure();

    window.addEventListener("resize", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(column);

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
  }, [variants.length]);

  useEffect(() => {
    const el = wrap.current;
    if (!el || reduced() || variants.length === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));
        if (cards.length === 0) {
          el.dataset.anim = "done";
          return;
        }

        createTimeline({
          defaults: { ease: EASE },
          onComplete: () => {
            el.dataset.anim = "done";
          },
        }).add(cards, {
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 560,
          delay: stagger(80),
        });
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every state a card enters is temporary — it goes back to idle on its own,
  // so a reader who wandered off doesn't come back to a board of dismissed
  // cards. Written as one timer per card, replaced if that card is pressed
  // again mid-hold.
  const flash = (i: number, state: CardState, ms: number) => {
    const previous = timers.current.get(i);
    if (previous) window.clearTimeout(previous);

    setStates((current) => ({ ...current, [i]: state }));
    timers.current.set(
      i,
      window.setTimeout(() => {
        timers.current.delete(i);
        setStates((current) => ({ ...current, [i]: "idle" }));
      }, ms),
    );
  };

  useEffect(() => {
    const running = timers.current;
    return () => {
      running.forEach((timer) => window.clearTimeout(timer));
      running.clear();
    };
  }, []);

  if (variants.length === 0) return null;

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
      className={styles.variantCarousel}
      data-anim="pending"
      data-nav-fade
      ref={wrap}
      style={inset !== null ? { marginLeft: `${-inset}px` } : undefined}
    >
      <ul
        className={styles.variantStrip}
        ref={strip}
        style={inset !== null ? { paddingInline: `${inset}px` } : undefined}
      >
        {variants.map((variant, i) => {
          // A variant authored as `confirm` is the confirmation — it has no
          // idle state to return to, so a press never moves it.
          const fixed = variant.parts.has("confirm");
          const state = fixed ? "confirming" : (states[i] ?? "idle");

          return (
            <li className={styles.variantCell} data-row key={`${variant.name}-${i}`}>
              <p className={styles.variantLabel}>
                <span className={styles.variantIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {variant.name}
              </p>

              <div
                className={styles.variantModal}
                data-state={state}
                data-narrow={variant.parts.has("narrow") ? "" : undefined}
              >
                <div className={styles.variantBar}>
                  <span className={styles.variantBarTitle}>{copy.title}</span>
                  <button
                    type="button"
                    className={styles.variantClose}
                    onClick={() => !fixed && flash(i, "dismissed", DISMISS_MS)}
                    disabled={fixed}
                    aria-label={`Dismiss the ${variant.name} modal`}
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className={styles.variantBody}>
                  {state === "confirming" ? (
                    <>
                      <span className={styles.variantConfirmBar}>
                        <CheckIcon />
                      </span>
                      <p className={styles.variantConfirmNote}>{copy.confirm}</p>
                    </>
                  ) : (
                    <>
                      {(variant.parts.has("plane") || variant.parts.has("book")) && (
                        <p className={styles.variantGlyphs} aria-hidden>
                          <PlaneIcon />
                          {variant.parts.has("book") && (
                            <>
                              <span className={styles.variantPlus}>+</span>
                              <BookIcon />
                            </>
                          )}
                        </p>
                      )}

                      {variant.parts.has("route") && (
                        <p className={styles.variantRoute}>{copy.route}</p>
                      )}

                      {variant.parts.has("rule") && (
                        <span className={styles.variantRule} aria-hidden />
                      )}

                      {variant.parts.has("blurb") && (
                        <p className={styles.variantBlurb}>{copy.blurb}</p>
                      )}

                      {variant.parts.has("action") && (
                        <button
                          type="button"
                          className={styles.variantAction}
                          onClick={() => flash(i, "confirming", CONFIRM_MS)}
                        >
                          {copy.action}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {variant.note && <p className={styles.variantNote}>{variant.note}</p>}
            </li>
          );
        })}
      </ul>

      {overflowing && (
        <div className={styles.variantScrub}>
          <input
            type="range"
            className={styles.personaScrubInput}
            style={{ "--progress": progress } as CSSProperties}
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={(e) => scrub(Number(e.target.value))}
            aria-label="Scroll through the modal variants"
          />
        </div>
      )}
    </div>
  );
}

/*
 * The four glyphs, exactly as the Figma file exports them — Font Awesome's
 * plane-departure and Akar's book-open, circle-check and close. Inlined
 * rather than fetched as four files because that's how every other icon on
 * this site is carried (Icon.tsx, BrandIcons.tsx), and `currentColor` in
 * place of the exported literals is what lets the stylesheet tint them:
 * white on the header bar, ink on the body, green on the confirmation.
 *
 * Exported (rather than kept file-local, like everything else here) because
 * LinkSubmenu.tsx's modal draws the same plane/book/check/close set on the
 * same "Logbook Link" chrome — re-importing them there is what keeps that
 * file from re-typing the same four path strings.
 */

export function PlaneIcon({ className }: { className?: string } = {}) {
  return (
    <svg viewBox="0 0 15.0003 12" fill="none" aria-hidden focusable="false" className={className}>
      <path
        d="M14.6251 10.5H0.375067C0.167879 10.5 6.6625e-05 10.6678 6.6625e-05 10.875V11.625C6.6625e-05 11.8322 0.167879 12 0.375067 12H14.6251C14.8323 12 15.0001 11.8322 15.0001 11.625V10.875C15.0001 10.6678 14.8323 10.5 14.6251 10.5ZM1.88796 7.99852C2.03514 8.15883 2.24186 8.24977 2.45819 8.24953L5.51772 8.24531C5.75918 8.24501 5.99716 8.18784 6.21241 8.07844L13.0318 4.61789C13.6585 4.29984 14.2203 3.84586 14.6026 3.25125C15.0317 2.58375 15.0783 2.1007 14.9089 1.75945C14.7399 1.41797 14.3291 1.16719 13.5437 1.11609C12.8441 1.07062 12.1482 1.25484 11.5215 1.57266L9.21264 2.7443L4.08686 0.821016C4.02523 0.7795 3.95363 0.7552 3.87946 0.750626C3.8053 0.746052 3.73125 0.761371 3.66499 0.795L2.12397 1.57711C1.87389 1.70391 1.81343 2.03766 2.0028 2.24578L5.66421 4.545L3.24522 5.77266L1.54952 4.91789C1.4911 4.88843 1.42657 4.87312 1.36114 4.8732C1.29572 4.87328 1.23122 4.88875 1.17288 4.91836L0.232332 5.39578C-0.0123552 5.52 -0.0768084 5.84391 0.101785 6.05391L1.88796 7.99852Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BookIcon({ className }: { className?: string } = {}) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false" className={className}>
      <path
        d="M8 13.3333C8 13.3333 9 12.6667 11.3333 12.6667C13.6667 12.6667 14.6667 13.3333 14.6667 13.3333V4C14.6667 4 13.6667 2.66667 11.3333 2.66667C9 2.66667 8 4 8 4C8 4 7 2.66667 4.66667 2.66667C2.33333 2.66667 1.33333 4 1.33333 4V13.3333C1.33333 13.3333 2.33333 12.6667 4.66667 12.6667C7 12.6667 8 13.3333 8 13.3333ZM8 4V13.3333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string } = {}) {
  return (
    <svg viewBox="0 0 15.3333 15.3333" fill="none" aria-hidden focusable="false" className={className}>
      <path
        d="M5 8L7 10L10.3333 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.66667 14.3333C11.3486 14.3333 14.3333 11.3486 14.3333 7.66667C14.3333 3.98477 11.3486 1 7.66667 1C3.98477 1 1 3.98477 1 7.66667C1 11.3486 3.98477 14.3333 7.66667 14.3333Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string } = {}) {
  return (
    <svg viewBox="0 0 11 11" fill="none" aria-hidden focusable="false" className={className}>
      <path
        d="M5.5 0C8.53757 0 11 2.46243 11 5.5C11 8.53757 8.53757 11 5.5 11C2.46243 11 0 8.53757 0 5.5C0 2.46243 2.46243 0 5.5 0ZM7.99219 2.70215C7.79691 2.50705 7.48036 2.50694 7.28516 2.70215L5.34668 4.63965L3.40918 2.70215C3.21392 2.50689 2.89741 2.50689 2.70215 2.70215C2.50689 2.89741 2.50689 3.21392 2.70215 3.40918L4.63965 5.34668L2.70215 7.28516C2.50694 7.48036 2.50705 7.79691 2.70215 7.99219C2.89742 8.18732 3.21396 8.18741 3.40918 7.99219L5.34668 6.05371L7.28516 7.99219C7.48043 8.18732 7.79697 8.18741 7.99219 7.99219C8.18741 7.79697 8.18732 7.48043 7.99219 7.28516L6.05371 5.34668L7.99219 3.40918C8.18741 3.21396 8.18732 2.89742 7.99219 2.70215Z"
        fill="currentColor"
      />
    </svg>
  );
}
