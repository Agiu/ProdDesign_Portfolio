"use client";

import Image from "next/image";
import { animate, cubicBezier, utils } from "animejs";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { CaseStudy } from "@/content/home";
import { ArrowIcon } from "./ArrowIcon";
import { ComingSoonModal } from "./ComingSoonModal";
import styles from "./CaseStudies.module.css";

/*
 * How far each half of the caption travels, in px. The title comes down from
 * the card's top edge and the summary + CTA go up from its bottom, so the same
 * number is used negated for the one and plain for the other.
 *
 * Short on purpose: the two halves are meant to read as settling into place
 * from the edges they're pinned to, not as flying in from off the card. The
 * matching resting offsets are in CaseStudies.module.css — change one, change
 * both.
 */
const TEXT_RISE = 18;

/*
 * Decelerating curves, not symmetric in-out ones: they leave immediately and
 * settle softly, which is what lets a move be unhurried without feeling heavy.
 */
const DURATION = 700;
const EXIT = 600;
const EASE = cubicBezier(0.22, 1, 0.36, 1);
const EASE_OUT = cubicBezier(0.16, 1, 0.3, 1);

/** The whole reveal is a pointer affordance — it has no place on a touch screen. */
const DESKTOP = "(min-width: 900px) and (hover: hover)";

const isDesktop = () => window.matchMedia(DESKTOP).matches;
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
 * Reduced motion collapses the duration to zero rather than skipping the reveal
 * outright. Skipping would strand the caption at its resting opacity of 0 —
 * and since that caption is the only place the summary appears on desktop,
 * those users would be left with no case-study text at all. They get all of
 * it, just without the travel.
 */
const ms = (value: number) => (reduced() ? 0 : value);

export function CaseCard({
  study,
  priority,
  featured = false,
}: {
  study: CaseStudy;
  priority: boolean;
  /**
   * The lead card. It keeps the caption-below-the-image layout at every width
   * — the one the small screens already get — rather than switching to the
   * veiled panel on desktop, so the study reads as a showcase instead of as
   * one more row. Every bit of the panel choreography below is skipped for it;
   * its hover is a plain CSS push-down.
   */
  featured?: boolean;
}) {
  const lines = useRef<HTMLDivElement>(null);
  /* The wash over the cover. It can't live inside the panel — see .veil in
     CaseStudies.module.css for why. */
  const veil = useRef<HTMLSpanElement>(null);
  /* The two halves of the caption. They move in opposite directions, so each
     one is animated on its own rather than as a row in a stagger. */
  const title = useRef<HTMLHeadingElement>(null);
  const foot = useRef<HTMLDivElement>(null);

  /*
   * Whatever the last hover set going, so the next one can call it off.
   *
   * anime.js replaces tweens that are already running, which covers the
   * ordinary case — but not one still sitting out its delay. The caption
   * enters on a delay (it follows the veil in), so a pointer that left again
   * inside that window used to leave a fade-to-visible queued behind it: the
   * veil went, the leave finished, and then the caption arrived on its own
   * over a card with nothing behind it. Cancelled by hand instead of trusted
   * to compose.
   */
  const running = useRef<ReturnType<typeof animate>[]>([]);

  const halt = useCallback(() => {
    /* cancel(), not revert() — this has to drop the animation where it stands
       so the next one picks the value up mid-flight. revert() would seek every
       property back to where the tween started and snap the card. */
    for (const anim of running.current) anim.cancel();
    running.current = [];
  }, []);

  /* Nothing should still be writing to these nodes once they're gone. */
  useEffect(() => halt, [halt]);

  /*
   * anime.js reads transforms off the inline style attribute, not off computed
   * styles — a transform declared in a stylesheet is invisible to it. Without
   * this, the first hover would assume the caption starts at translateY(0),
   * write that inline, and snap it straight to its end position before
   * animating.
   *
   * So mirror the CSS resting state into inline styles once mounted. The CSS
   * still owns the pre-hydration and no-JS paint; this only gives anime.js a
   * value it can actually see.
   */
  useEffect(() => {
    // The featured card never leaves the static-caption layout, so there's no
    // offstage resting state to seed — and seeding one would hide its text.
    if (featured) return;

    const mq = window.matchMedia(DESKTOP);

    const seed = () => {
      const l = lines.current;
      const v = veil.current;
      const t = title.current;
      const f = foot.current;
      if (!l || !v || !t || !f) return;

      if (mq.matches) {
        utils.set(v, { opacity: 0 });
        utils.set(t, { opacity: 0, translateY: -TEXT_RISE });
        utils.set(f, { opacity: 0, translateY: TEXT_RISE });
        return;
      }

      // Below the breakpoint the caption is plain static text under the
      // picture. Any leftover inline offset would hold it off its own edge, so
      // clear the lot back to CSS.
      v.style.opacity = "";
      for (const row of Array.from(l.children)) {
        const el = row as HTMLElement;
        el.style.opacity = "";
        el.style.transform = "";
      }
    };

    seed();
    mq.addEventListener("change", seed);
    return () => mq.removeEventListener("change", seed);
  }, [featured]);

  const onEnter = useCallback(() => {
    const v = veil.current;
    const t = title.current;
    const f = foot.current;
    if (featured || !v || !t || !f || !isDesktop()) return;

    /*
     * Nothing is hard-reset first: each property animates from wherever it
     * currently sits, so re-hovering mid-exit is picked up smoothly rather than
     * snapping back to the start. Only the previous hover's animations are
     * called off, and calling them off leaves those values untouched.
     */
    halt();

    running.current = [
      animate(v, { opacity: 1, duration: ms(DURATION), ease: EASE }),

      /*
       * Both halves in one call. They rest at opposite offsets and both land at
       * 0, so a single target list gives them one arrival — which is the point:
       * the caption should read as opening from both edges at once, not as two
       * rows queued behind each other.
       *
       * They come in just behind the veil rather than with it, so the ground is
       * already darkening as the type arrives on it.
       */
      animate([t, f], {
        opacity: 1,
        translateY: 0,
        duration: ms(420),
        ease: EASE_OUT,
        delay: ms(120),
      }),
    ];
  }, [featured, halt]);

  const onLeave = useCallback(() => {
    const v = veil.current;
    const t = title.current;
    const f = foot.current;
    if (featured || !v || !t || !f || !isDesktop()) return;

    halt();

    running.current = [
      animate(v, { opacity: 0, duration: ms(EXIT), ease: EASE }),
      // Each half retreats the way it came — the title back up over the top
      // edge, the summary and CTA back down under the bottom one. Sending them
      // the same way would close the caption as a slide instead of as the split
      // it opened with.
      animate(t, {
        opacity: 0,
        translateY: -TEXT_RISE,
        duration: ms(220),
        ease: EASE_OUT,
      }),
      animate(f, {
        opacity: 0,
        translateY: TEXT_RISE,
        duration: ms(220),
        ease: EASE_OUT,
      }),
    ];
  }, [featured, halt]);

  const href = `/case-study/${study.slug}`;

  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const comingSoon = study.comingSoon;
  const onCardClick = comingSoon
    ? (e: MouseEvent) => {
        e.preventDefault();
        setComingSoonOpen(true);
      }
    : undefined;
  /* Keeps PageTransition's capture-phase interceptor off this link, so the
     click reaches the handler above instead of committing the route. */
  const noCurtain = comingSoon ? "" : undefined;
  const comingSoonModal = comingSoon && (
    <ComingSoonModal
      open={comingSoonOpen}
      onClose={() => setComingSoonOpen(false)}
      title={study.title}
      figmaUrl={comingSoon.figmaUrl}
      seeInsteadHref={`/case-study/${comingSoon.seeInstead}`}
      seeInsteadLabel={comingSoon.seeInsteadTitle}
    />
  );

  // Same tags markup either way — pulled out so both branches below read the
  // same list rather than drifting apart if one gets edited and not the other.
  const tags = study.tags && study.tags.length > 0 && (
    <ul className={styles.tags} aria-label="Disciplines and tools">
      {study.tags.map((tag) => (
        <li key={tag} className={styles.tag}>
          {tag}
        </li>
      ))}
    </ul>
  );

  /*
   * The featured (lead) card reads as a showcase, not a row — so unlike the
   * rest of the list it isn't one giant `<a>`. Only the image and the "View
   * case study" CTA are click targets; the title/summary/tags are plain text
   * a reader can select without also navigating away.
   */
  if (featured) {
    return (
      <div className={`${styles.card} ${styles.cardFeatured}`}>
        <a
          href={href}
          className={styles.frame}
          aria-label={`View case study: ${study.title}`}
          onClick={onCardClick}
          data-no-curtain={noCurtain}
        >
          <div className={styles.cover}>
            <Image
              src={study.cover}
              alt=""
              fill
              sizes="(max-width: 1100px) 100vw, 1100px"
              priority={priority}
              className={styles.image}
            />
          </div>
        </a>

        <div className={styles.panel}>
          <div className={styles.lines}>
            <h3 className={styles.title}>{study.title}</h3>
            <p className={styles.summary}>{study.summary}</p>
            {tags}
            <a
              href={href}
              className={styles.cta}
              onClick={onCardClick}
              data-no-curtain={noCurtain}
            >
              <ArrowIcon className={styles.arrow} />
              View case study
            </a>
          </div>
        </div>
        {comingSoonModal}
      </div>
    );
  }

  return (
    <>
    <a
      href={href}
      className={styles.card}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onCardClick}
      data-no-curtain={noCurtain}
    >
      <div className={styles.frame}>
        <div className={styles.cover}>
          <Image
            src={study.cover}
            alt=""
            fill
            sizes="(max-width: 1100px) 100vw, 1100px"
            priority={priority}
            className={styles.image}
          />
        </div>

        {/* Sits in the frame rather than in the panel so it has the cover to
            multiply against, and on a layer of its own so the blend can't
            reach the type. */}
        <span className={styles.veil} ref={veil} aria-hidden />
      </div>

      <div className={styles.panel}>
        <div className={styles.lines} ref={lines}>
          <h3 className={styles.title} ref={title}>
            {study.title}
          </h3>

          {/* Summary and CTA travel together, so they're one element rather
              than two rows kept in step — and on desktop this is also what
              stands on the card's floor while the title holds its top. */}
          <div className={styles.foot} ref={foot}>
            <p className={styles.summary}>{study.summary}</p>
            <p className={styles.cta}>
              <ArrowIcon className={styles.arrow} />
              View case study
            </p>
          </div>

          {/* Inline caption tags — mobile / no-hover only; desktop has no
              on-image equivalent and hides them. Last in source order, with
              CSS `order` moving them where each width wants them. */}
          {tags}
        </div>
      </div>
    </a>
    {comingSoonModal}
    </>
  );
}
