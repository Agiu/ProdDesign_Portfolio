"use client";

import Image from "next/image";
import Link from "next/link";
import { createTimeline, cubicBezier, stagger } from "animejs";
import { useCallback, useEffect, useRef, useState } from "react";
import { duration } from "@/content/home";
import {
  positions,
  timeline,
  type Position,
  type PositionLink,
} from "@/content/recruiter";
import { ArrowIcon } from "@/components/ArrowIcon";
import { QuickNav } from "./QuickNav";
import { positionId } from "./position-id";
import { Lightbox, type ZoomedShot } from "./Lightbox";
import { ShotCarousel } from "./ShotCarousel";
import styles from "./Recruiter.module.css";

/*
 * The rail.
 *
 * One entry per position, each hung off a vertical spine: a mark on the spine
 * carrying the organisation, and the role's evidence beside it. The spine is
 * drawn per entry rather than as one line down the section, which is what lets
 * each segment arrive with the entry it belongs to instead of the whole rail
 * being ruled in before there is anything on it.
 *
 * Choreography is anime.js, one timeline per entry, fired the first time the
 * entry reaches the viewport: the spine draws down, the mark strikes on as it
 * passes, and the rows beside it come up in a stagger behind it. That order is
 * the point — the line arrives, then what it is holding.
 *
 * The resting state is CSS, keyed off `data-anim="pending"` in the markup (see
 * .entry in the stylesheet), so the page is server-rendered hidden rather than
 * hidden by a script after first paint. Two ways out of it if the animation
 * never runs: the reduced-motion block in the stylesheet, and the <noscript>
 * override on the page — both settle every piece where it belongs.
 */

const EASE = cubicBezier(0.22, 1, 0.36, 1);

/* Trips a little before the entry is fully on screen, so the draw reads as
   arriving rather than as starting at the viewport's edge. Same margin the
   site's reveal hook uses. */
const ROOT_MARGIN = "0px 0px -15% 0px";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The mark's stand-in until real logo files land (`public/logos/`, see the
 * `logo` field in content/recruiter.ts). Initials, taken from the capitals the
 * organisation writes itself — "ForeFlight" gives FF, "University of
 * Washington" gives UW — and a lone initial for a name that only capitalises
 * its first letter, since "MI" for Microsoft reads as a truncation rather than
 * as a monogram.
 */
function monogram(org: string) {
  const caps = org.match(/[A-Z]/g) ?? [];
  return caps.slice(0, 3).join("") || org.slice(0, 1).toUpperCase();
}

/** The play mark on a video CTA — the site's own geometry, no dependency. */
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

/**
 * A CTA under a position: a case study on this site, or a film off it.
 *
 * A link with no `href` yet renders as an inert chip rather than as an anchor
 * to nowhere — the CTA is decided, the URL isn't in (see the placeholder note
 * in content/recruiter.ts). It keeps the hatched marker the other placeholders
 * carry, so an unfinished entry looks unfinished.
 */
function Cta({ link }: { link: PositionLink }) {
  const glyph =
    link.kind === "video" ? (
      <PlayIcon className={styles.chipIcon} />
    ) : (
      <ArrowIcon className={styles.chipIcon} />
    );

  if (!link.href) {
    return (
      <span className={styles.chip} data-placeholder aria-disabled="true">
        {glyph}
        {link.label}
        <span className={styles.chipNote}>link to come</span>
      </span>
    );
  }

  /* Off-site links are plain anchors with the usual target/rel; internal ones
     go through Link so the route is prefetched like everywhere else. */
  if (link.href.startsWith("http")) {
    return (
      <a
        href={link.href}
        className={styles.chip}
        data-kind={link.kind}
        target="_blank"
        rel="noreferrer noopener"
      >
        {glyph}
        {link.label}
      </a>
    );
  }

  /* A case study reached from here should hand back to here — the case-study
     page's own back arrow otherwise only knows one destination, the
     homepage's case-study list (BackLink.tsx). The marker rides in the query
     string rather than in app state, since a query string is the one thing
     that survives a real navigation to a whole different page. */
  const href =
    link.kind === "study" ? `${link.href}?from=recruiter` : link.href;

  return (
    <Link href={href} className={styles.chip} data-kind={link.kind}>
      {glyph}
      {link.label}
    </Link>
  );
}

/**
 * One position. Owns its own observer and its own timeline — nothing is shared
 * between entries, so an entry added to the content file needs no wiring and
 * the rail can't get out of step with itself.
 *
 * The viewer is the one thing that isn't local to the entry: `onZoom` is how
 * a click on a photo here reaches the single Lightbox mounted once for the
 * whole rail.
 */
function Entry({
  position,
  onZoom,
}: {
  position: Position;
  onZoom: (shot: ZoomedShot) => void;
}) {
  const root = useRef<HTMLLIElement>(null);
  /* Kept so an unmount mid-draw can stop it rather than leave it writing to
     detached nodes. */
  const running = useRef<ReturnType<typeof createTimeline> | null>(null);

  useEffect(() => {
    const el = root.current;
    /* Reduced motion leaves `data-anim="pending"` in place: the stylesheet's
       own media query settles it, so there is nothing here to do. */
    if (!el || reduced()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const spine = el.querySelector<HTMLElement>("[data-spine]");
        const mark = el.querySelector<HTMLElement>("[data-mark]");
        const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-row]"));

        const tl = createTimeline({
          defaults: { ease: EASE },
          /* The pending rules come off the moment the last tween lands, so
             nothing on the page is left depending on inline styles anime
             happens to have written. */
          onComplete: () => {
            el.dataset.anim = "done";
          },
        });

        if (spine) tl.add(spine, { scaleY: [0, 1], duration: 760 }, 0);
        if (mark) {
          tl.add(mark, { opacity: [0, 1], scale: [0.82, 1], duration: 520 }, 200);
        }
        if (rows.length > 0) {
          tl.add(
            rows,
            {
              opacity: [0, 1],
              translateY: [18, 0],
              duration: 620,
              delay: stagger(70),
            },
            300,
          );
        }

        running.current = tl;
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      running.current?.pause();
    };
  }, []);

  /* How long, when, and where — whichever of the three this entry knows.
     Duration is read out of the same formatter the homepage résumé uses, so
     the two can't disagree about what 18 months is called. */
  const when = [
    position.period,
    position.months ? duration(position.months) : null,
    position.place,
  ].filter(Boolean);

  return (
    <li
      ref={root}
      id={positionId(position)}
      className={styles.entry}
      data-kind={position.kind ?? "role"}
      data-anim="pending"
    >
      {/* The rail column. Ornament as far as a screen reader is concerned —
          the organisation it stands for is read out of the heading beside
          it. */}
      <div className={styles.rail} aria-hidden>
        <span className={styles.mark} data-mark>
          {position.logo ? (
            <Image
              src={position.logo}
              alt=""
              width={64}
              height={64}
              className={styles.logo}
            />
          ) : (
            <span className={styles.monogram}>{monogram(position.org)}</span>
          )}
        </span>
        <span className={styles.spine} data-spine />
      </div>

      <div className={styles.body}>
        <h3 className={styles.org} data-row>
          {position.org}
          <span className={styles.role}>{position.title}</span>
        </h3>

        {when.length > 0 && (
          <p className={styles.when} data-row>
            {when.map((part, i) => (
              <span key={i} className={styles.whenPart}>
                {part}
              </span>
            ))}
          </p>
        )}

        <p className={styles.summary} data-row>
          {position.summary}
        </p>

        {/* A link here is the position's own — nothing one impact below can
            claim (see Impact.links for the ones that can) — so it reads right
            off the description rather than waiting at the foot of the entry,
            after every bullet and photo. */}
        {position.links && position.links.length > 0 && (
          <div className={styles.ctas} data-row>
            {position.links.map((link) => (
              <Cta key={`${link.label}-${link.href}`} link={link} />
            ))}
          </div>
        )}

        {position.impacts.length > 0 && (
          <ul className={styles.impacts}>
            {position.impacts.map((impact) => (
              <li
                key={impact.headline}
                className={styles.impact}
                data-placeholder={impact.placeholder || undefined}
                data-row
              >
                <p className={styles.impactHead}>{impact.headline}</p>
                {impact.detail && (
                  <p className={styles.impactDetail}>{impact.detail}</p>
                )}
                {impact.links && impact.links.length > 0 && (
                  <div className={styles.impactCtas}>
                    {impact.links.map((link) => (
                      <Cta key={`${link.label}-${link.href}`} link={link} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {position.shots.length > 0 && (
          <div data-row>
            <ShotCarousel
              shots={position.shots}
              org={position.org}
              title={position.title}
              onZoom={onZoom}
            />
          </div>
        )}
      </div>
    </li>
  );
}

export function Timeline() {
  /* Whichever photo is being looked at full size, or null. One viewer for
     the whole rail rather than one per entry: only ever one can be open, and
     a modal per position would be six of them waiting their turn. */
  const [zoomed, setZoomed] = useState<ZoomedShot | null>(null);

  /* Stable, so the viewer's own open/close effect isn't torn down and set up
     again on every render of this section. */
  const closeZoom = useCallback(() => setZoomed(null), []);

  return (
    <section className={styles.timeline} id="experience">
      <QuickNav />

      <ol className={styles.entries}>
        {positions.map((position) => (
          <Entry
            key={`${position.org} ${position.title}`}
            position={position}
            onZoom={setZoomed}
          />
        ))}
      </ol>

      <Lightbox shot={zoomed} onClose={closeZoom} />
    </section>
  );
}
