"use client";

import Image from "next/image";
import { animate, cubicBezier, stagger, utils } from "animejs";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/content/home";
import { ArrowIcon } from "./ArrowIcon";
import styles from "./CaseStudies.module.css";

/*
 * How far the image drifts, as a share of the card. Small on purpose: the panel
 * crosses its own full width while the image barely moves, and that difference
 * in rate is what makes it read as parallax — the image sitting behind the
 * panel rather than being shoved by it. Matching the panel's travel would make
 * them one rigid slab.
 */
const IMAGE_DRIFT = "8%";

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

/*
 * Crops the viewport down to a band across its middle. A card counts as the one
 * being read only while it crosses that band, which is what makes the shadow
 * follow the scroll rather than sitting under every card that's on screen. Any
 * wider and two neighbours light up at once on a tall window.
 */
const ACTIVE_BAND = "-35% 0px -35% 0px";

const isDesktop = () => window.matchMedia(DESKTOP).matches;
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
 * Reduced motion collapses the duration to zero rather than skipping the reveal
 * outright. Skipping would strand the panel offstage — and since the panel *is*
 * the caption, that would leave those users with no case-study text at all. They
 * get the panel, just without the travel.
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
   * sliding panel on desktop, so the study reads as a showcase instead of as
   * one more row. Every bit of the panel choreography below is skipped for it;
   * its hover is a plain CSS push-down.
   */
  featured?: boolean;
}) {
  /*
   * Typed to the base element rather than HTMLAnchorElement: the featured
   * card's outer wrapper is a plain <div> (see the render branch below), not
   * a link, so this ref has to fit both.
   */
  const card = useRef<HTMLElement | null>(null);
  const cover = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);

  // Whether this is the card the reader has scrolled to — drives the shadow
  // bloom in CSS. Unlike the entrance reveal this is not a one-shot: it has to
  // keep up as cards scroll past in either direction.
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = card.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: ACTIVE_BAND },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /*
   * anime.js reads transforms off the inline style attribute, not off computed
   * styles — a transform declared in a stylesheet is invisible to it. Without
   * this, the first hover would assume the panel starts at translateX(0), write
   * that inline, and snap it straight to its end position before animating.
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
      const p = panel.current;
      const l = lines.current;
      if (!p || !l) return;
      const rows = Array.from(l.children);

      if (mq.matches) {
        utils.set(p, { translateX: "-100%" });
        utils.set(rows, { opacity: 0, translateY: 8 });
        return;
      }

      // Below the breakpoint the panel is a plain static caption. Any leftover
      // inline transform would shove it off-screen, so clear it back to CSS.
      p.style.transform = "";
      for (const row of rows) {
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
    const c = cover.current;
    const p = panel.current;
    const l = lines.current;
    if (featured || !c || !p || !l || !isDesktop()) return;

    // An HTMLCollection is live and isn't a reliable anime.js target — take a
    // plain array snapshot.
    const rows = Array.from(l.children);

    /*
     * The cover pans rather than resizes. Animating its width would make the
     * image's object-fit recompute mid-flight, so the picture re-crops as it
     * moves — that reflow is what reads as jarring. A transform leaves the
     * framing untouched and simply drifts it.
     *
     * Nothing is hard-reset first: each property animates from wherever it
     * currently sits, so re-hovering mid-exit is picked up smoothly rather than
     * snapping back to the start.
     */
    animate(c, { translateX: IMAGE_DRIFT, duration: ms(DURATION), ease: EASE });
    animate(p, { translateX: "0%", duration: ms(DURATION), ease: EASE });

    animate(rows, {
      opacity: 1,
      translateY: 0,
      duration: ms(380),
      ease: EASE_OUT,
      // Text follows just behind the leading edge, rather than waiting for it.
      delay: reduced() ? 0 : stagger(45, { start: 160 }),
    });
  }, [featured]);

  const onLeave = useCallback(() => {
    const c = cover.current;
    const p = panel.current;
    const l = lines.current;
    if (featured || !c || !p || !l || !isDesktop()) return;

    animate(c, { translateX: "0%", duration: ms(EXIT), ease: EASE });
    // Retreats the way it came, hiding off the left edge. Sending it right would
    // sweep it straight across the image: it rides above the image now, so it
    // has nothing left to tuck behind.
    animate(p, { translateX: "-100%", duration: ms(EXIT), ease: EASE });
    animate(Array.from(l.children), {
      opacity: 0,
      translateY: 8,
      duration: ms(180),
      ease: EASE_OUT,
    });
  }, [featured]);

  const href = `/case-study/${study.slug}`;

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
      <div
        ref={(el) => {
          card.current = el;
        }}
        className={`${styles.card} ${styles.cardFeatured}`}
        data-active={active ? "true" : undefined}
      >
        <a href={href} className={styles.frame} aria-label={`View case study: ${study.title}`}>
          <div className={styles.cover} ref={cover}>
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

        <div className={styles.panel} ref={panel}>
          <div className={styles.lines} ref={lines}>
            <h3 className={styles.title}>{study.title}</h3>
            <p className={styles.summary}>{study.summary}</p>
            {tags}
            <a href={href} className={styles.cta}>
              View case study
              <ArrowIcon className={styles.arrow} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      ref={(el) => {
        card.current = el;
      }}
      href={href}
      className={styles.card}
      data-active={active ? "true" : undefined}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      <div className={styles.frame}>
        <div className={styles.cover} ref={cover}>
          <Image
            src={study.cover}
            alt=""
            fill
            sizes="(max-width: 1100px) 100vw, 1100px"
            priority={priority}
            className={styles.image}
          />
        </div>
      </div>

      <div className={styles.panel} ref={panel}>
        {/* These rows are what the stagger animates over. */}
        <div className={styles.lines} ref={lines}>
          <h3 className={styles.title}>{study.title}</h3>
          <p className={styles.summary}>{study.summary}</p>
          {/* Inline caption tags — mobile / no-hover only. Desktop hides
              these entirely (no on-image equivalent). Kept last in source
              order (so the desktop stagger sequence, which reads this same
              list, is unaffected) — CSS `order` moves them visually to the
              top on mobile. */}
          {tags}
          <p className={styles.cta}>
            View case study
            <ArrowIcon className={styles.arrow} />
          </p>
        </div>
      </div>
    </a>
  );
}
