"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import {
  DiscordBadge,
  InstagramBadge,
  PlayStationBadge,
  RedditBadge,
  SteamBadge,
  TwitchBadge,
  XboxBadge,
  YoutubeBadge,
} from "./BrandIcons";
import styles from "../CaseStudy.module.css";

/**
 * The `logo-orbit` custom block. Stands in for a screenshot where the point is
 * the shape of the problem rather than any one interface, and it argues the
 * case study's premise in three beats:
 *
 *   1. `scattered` — seven platforms strung across the frame in a tangled
 *      mesh, every one wired to every other, nothing in the middle. That
 *      topology *is* the fragmentation: the coordination cost is the lines.
 *   2. `orbiting`  — the mesh drops away and they swing into a single ring
 *      around Discord, revolving together on one clock.
 *   3. `tucked`    — the ring contracts and every badge slides in behind the
 *      Discord mark until only Discord is left. Not seven places wired
 *      together — one place that absorbs the job.
 *
 * Smaller things carry the same reading: scattered, each badge drifts on its
 * own timing, tilted and desaturated; gathered, they sit upright at full
 * colour and breathe in lockstep with the hub's pulse. Out of phase, then in
 * phase.
 *
 * The fence body is the caption; split it on `|` to caption the beats
 * separately (the last one supplied carries any beats left over), and they
 * crossfade with the diagram.
 */

const VIEW = { w: 600, h: 400 };
const CENTER = { x: 300, y: 200 };
const RING_RADIUS = 150;

type Phase = "scattered" | "orbiting" | "tucked";

/** The loop: which beat, how long it holds before the next, and its eyebrow. */
const BEATS: { phase: Phase; hold: number; label: string }[] = [
  { phase: "scattered", hold: 4000, label: "Every group, on its own" },
  { phase: "orbiting", hold: 4400, label: "Circling one place" },
  { phase: "tucked", hold: 3000, label: "One app they're already in" },
];

type Point = { x: number; y: number };

type OrbitNode = {
  key: string;
  Badge: ComponentType<{ className?: string }>;
  /** Where the badge sits while the network is a mesh. */
  scatter: Point & { scale: number; rotate: number };
  /** Per-badge drift timing — deliberately unrelated so nothing syncs up. */
  drift: { dur: number; delay: number };
};

/* Scatter positions are hand-placed rather than generated: they hug the edges
   of the frame and leave the middle conspicuously empty, which is the whole
   claim — there is no centre yet for any of this to report to. */
const NODES: OrbitNode[] = [
  {
    key: "xbox",
    Badge: XboxBadge,
    scatter: { x: 86, y: 74, scale: 0.94, rotate: -9 },
    drift: { dur: 5200, delay: 0 },
  },
  {
    key: "twitch",
    Badge: TwitchBadge,
    scatter: { x: 250, y: 42, scale: 1.08, rotate: 6 },
    drift: { dur: 6100, delay: -900 },
  },
  {
    key: "youtube",
    Badge: YoutubeBadge,
    scatter: { x: 447, y: 66, scale: 0.86, rotate: -14 },
    drift: { dur: 4700, delay: -2100 },
  },
  {
    key: "steam",
    Badge: SteamBadge,
    scatter: { x: 546, y: 168, scale: 1, rotate: 10 },
    drift: { dur: 5800, delay: -1400 },
  },
  {
    key: "playstation",
    Badge: PlayStationBadge,
    scatter: { x: 474, y: 336, scale: 1.04, rotate: -7 },
    drift: { dur: 5000, delay: -3200 },
  },
  {
    key: "instagram",
    Badge: InstagramBadge,
    scatter: { x: 232, y: 354, scale: 0.92, rotate: 12 },
    drift: { dur: 6400, delay: -600 },
  },
  {
    key: "reddit",
    Badge: RedditBadge,
    scatter: { x: 68, y: 262, scale: 1.1, rotate: -11 },
    drift: { dur: 5500, delay: -2600 },
  },
];

/** Evenly spaced around the hub, first badge straight up. */
function ringPoint(index: number): Point {
  const angle = (-90 + (index * 360) / NODES.length) * (Math.PI / 180);
  return {
    x: CENTER.x + RING_RADIUS * Math.cos(angle),
    y: CENTER.y + RING_RADIUS * Math.sin(angle),
  };
}

/* Which scattered badges are wired to each other. Not the full mesh (21 lines
   reads as noise, not as a point) — twelve pairs chosen so the paths cross the
   empty middle as often as possible. `bow` bends each one off its chord so the
   set looks tangled rather than like a star polygon. */
const MESH: { a: number; b: number; bow: number }[] = [
  { a: 0, b: 2, bow: 26 },
  { a: 0, b: 3, bow: -34 },
  { a: 0, b: 4, bow: 18 },
  { a: 1, b: 4, bow: -22 },
  { a: 1, b: 5, bow: 30 },
  { a: 1, b: 6, bow: -16 },
  { a: 2, b: 4, bow: 20 },
  { a: 2, b: 5, bow: -28 },
  { a: 2, b: 6, bow: 14 },
  { a: 3, b: 5, bow: 24 },
  { a: 3, b: 6, bow: -30 },
  { a: 4, b: 6, bow: 16 },
];

/** Quadratic path between two points, bowed perpendicular to the chord. */
function chord(a: Point, b: Point, bow: number): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (a.x + b.x) / 2 - (dy / len) * bow;
  const cy = (a.y + b.y) / 2 + (dx / len) * bow;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPref(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const PHASE_CLASS: Record<Phase, string> = {
  scattered: styles.orbitScattered,
  orbiting: styles.orbitOrbiting,
  tucked: styles.orbitTucked,
};

export function LogoOrbit({ content }: { content: string }) {
  const captions = content
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  const stageRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const [live, setLive] = useState(false);

  // Readers who've asked for less motion get the middle beat as a still, with
  // the mesh left faint underneath it — one frame that still holds the tangle
  // and the thing that replaces it. Nothing loops for them.
  const reduced = useSyncExternalStore(
    subscribeToMotionPref,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  // Only run the loop while the diagram is actually on screen, so a reader
  // arriving at it always catches the mesh first rather than walking in on
  // whichever beat the timer happened to be showing.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!live || reduced) return;
    const timer = window.setTimeout(
      () => setBeat((current) => (current + 1) % BEATS.length),
      BEATS[beat].hold,
    );
    return () => window.clearTimeout(timer);
  }, [live, beat, reduced]);

  const phase: Phase = reduced ? "orbiting" : BEATS[beat].phase;
  const stageClass = [styles.orbitStage, PHASE_CLASS[phase], reduced && styles.orbitStill]
    .filter(Boolean)
    .join(" ");

  // The field's revolve and each badge's counter-spin are started and stopped
  // imperatively (SMIL's own beginElement()/endElement(), not a React
  // conditional) — see the comment on the elements below for why: mounting
  // them fresh at the same moment a sibling's CSS transition needs to run was
  // making that transition snap straight to its end value instead of easing.
  const shouldRevolve = !reduced && phase !== "scattered";
  const wasRevolvingRef = useRef(false);
  const fieldAnimRef = useRef<SVGAnimateTransformElement>(null);
  const spinAnimRefs = useRef<(SVGAnimateTransformElement | null)[]>([]);
  useEffect(() => {
    if (shouldRevolve === wasRevolvingRef.current) return;
    wasRevolvingRef.current = shouldRevolve;
    const elements = [fieldAnimRef.current, ...spinAnimRefs.current];
    for (const el of elements) {
      if (!el) continue;
      if (shouldRevolve) el.beginElement();
      else el.endElement();
    }
  }, [shouldRevolve]);

  return (
    <figure className={styles.figure}>
      <div className={stageClass} ref={stageRef}>
        {/* All three eyebrows stacked in one grid cell so the chip never
            resizes as the wording swaps. */}
        <p className={styles.orbitLabel} aria-hidden>
          <span className={styles.orbitLabelDot} />
          <span className={styles.orbitLabelSlot}>
            {BEATS.map((entry) => (
              <span
                key={entry.phase}
                className={
                  entry.phase === phase ? styles.orbitFadeIn : styles.orbitFadeOut
                }
              >
                {entry.label}
              </span>
            ))}
          </span>
        </p>

        <svg
          className={styles.orbitSvg}
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          role="img"
          aria-label="Seven gaming platforms tangled in a mesh, then circling Discord, then tucked away behind it."
        >
          <defs>
            <radialGradient id="orbit-halo">
              <stop offset="0" stopColor="#5865F2" stopOpacity="0.22" />
              <stop offset="1" stopColor="#5865F2" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Beat one: everyone talking to everyone. */}
          <g className={styles.orbitMesh}>
            {MESH.map(({ a, b, bow }, index) => (
              <path
                key={`${a}-${b}`}
                className={index % 2 ? styles.orbitMeshBack : styles.orbitMeshForward}
                d={chord(NODES[a].scatter, NODES[b].scatter, bow)}
              />
            ))}
          </g>

          {/* Beat two's ground: the halo the hub sits in and the path the
              badges take around it. */}
          <circle className={styles.orbitHalo} cx={CENTER.x} cy={CENTER.y} r={126} fill="url(#orbit-halo)" />
          <circle className={styles.orbitGuide} cx={CENTER.x} cy={CENTER.y} r={RING_RADIUS} />

          {/* `orbitField` revolves the whole set about the centre while they're
              gathered; `orbitSpin` unwinds that on each badge so the marks stay
              upright as they travel. The revolve is only dropped once they've
              tucked into the centre — where a rotation about that same centre
              has no visible effect — so the reset is never seen.

              The rotation itself is done with `<animateTransform>` — SVG's
              native, pre-CSS animation primitive — rather than a CSS
              `animation` pivoted with `transform-box`/`transform-origin`. Two
              rounds of that (`transform-box: view-box` with a pixel origin,
              then `transform-box: fill-box` with an anchor shape) both worked
              in Chrome but still put the tucked badges beside the hub rather
              than under it on a real device, which points at the pivot
              calculation itself rather than at anything specific to either
              approach — `transform-box` on a nested SVG `<g>` has a history of
              inconsistent support. `<animateTransform>`'s `from`/`to` take
              literal numbers, so there's no box for a browser to get wrong.

              It's mounted once and left in the DOM (`begin="indefinite"`,
              started/stopped with beginElement()/endElement() above) rather
              than conditionally rendered on `phase`: inserting it fresh in the
              same render as the scattered→orbiting handoff — the moment
              `.orbitNode`'s CSS transition most needs to run — made that
              transition snap straight to its end value instead of easing, on
              a real device (not reproducible by eye in a desktop browser, only
              by sampling actual frame positions). */}
          <g className={styles.orbitField}>
            <animateTransform
              ref={fieldAnimRef}
              attributeName="transform"
              type="rotate"
              from={`0 ${CENTER.x} ${CENTER.y}`}
              to={`360 ${CENTER.x} ${CENTER.y}`}
              dur="13s"
              begin="indefinite"
              repeatCount="indefinite"
            />
            {NODES.map((node, index) => {
              const ring = ringPoint(index);
              const { x, y, scale, rotate } = node.scatter;
              const target =
                phase === "scattered"
                  ? `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`
                  : phase === "orbiting"
                    ? `translate(${ring.x.toFixed(1)}px, ${ring.y.toFixed(1)}px) rotate(0deg) scale(1)`
                    : `translate(${CENTER.x}px, ${CENTER.y}px) rotate(0deg) scale(0.02)`;
              return (
                <g
                  key={node.key}
                  className={styles.orbitNode}
                  style={{ transform: target, "--i": index } as React.CSSProperties}
                >
                  <g className={styles.orbitSpin}>
                    {/* Unwinds the field's rotation on this one badge. Its
                        pivot is literally "0 0" — this group's own local
                        origin, which is exactly where the badge sits, since
                        it's centred here rather than at the field's (300, 200)
                        — so again nothing for a browser to compute wrong.
                        Mounted once and started/stopped imperatively, same as
                        the field's — see the comment there. */}
                    <animateTransform
                      // React's SVG typings give this intrinsic a plain
                      // `SVGElement` ref, not the animateTransform subtype
                      // that actually has beginElement()/endElement().
                      ref={(el) => {
                        spinAnimRefs.current[index] = el as SVGAnimateTransformElement | null;
                      }}
                      attributeName="transform"
                      type="rotate"
                      from="0 0 0"
                      to="-360 0 0"
                      dur="13s"
                      begin="indefinite"
                      repeatCount="indefinite"
                    />
                    {/* Pins the bounding box of this group — and so, through
                        it, of the node above — to a static square centred on
                        the badge. Both groups position themselves with
                        `transform-box: fill-box`, and a bounding box includes
                        its descendants' *animated* transforms: without this
                        anchor the drift below shifts the box a few units every
                        frame, which moves the transform origin, which at
                        scale(0.02) is almost the whole of where the badge ends
                        up. The badges then tuck to a wandering point beside the
                        hub instead of underneath it. ±36 clears the badge at
                        its most displaced (rotated and drifted, ~32.4). */}
                    <rect x={-36} y={-36} width={72} height={72} fill="transparent" />
                    <g
                      className={styles.orbitDrift}
                      style={
                        {
                          "--drift-dur": `${node.drift.dur}ms`,
                          "--drift-delay": `${node.drift.delay}ms`,
                        } as React.CSSProperties
                      }
                    >
                      <g transform="translate(-24 -24)">
                        <node.Badge />
                      </g>
                    </g>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Drawn after the badges so it covers them as they slide in behind
              it — the tuck is done by occlusion, not by fading them out. */}
          <circle className={styles.orbitPulseRing} cx={CENTER.x} cy={CENTER.y} r={46} />
          <circle
            className={`${styles.orbitPulseRing} ${styles.orbitPulseRingLate}`}
            cx={CENTER.x}
            cy={CENTER.y}
            r={46}
          />
          <g className={styles.orbitHub}>
            <g transform={`translate(${CENTER.x} ${CENTER.y}) scale(1.72) translate(-24 -24)`}>
              <DiscordBadge />
            </g>
          </g>
        </svg>
      </div>

      {captions.length > 0 &&
        (captions.length === 1 ? (
          <figcaption className={styles.caption}>{captions[0]}</figcaption>
        ) : (
          <figcaption className={`${styles.caption} ${styles.orbitCaption}`}>
            {BEATS.map((entry, index) => (
              <span
                key={entry.phase}
                className={
                  entry.phase === phase ? styles.orbitFadeIn : styles.orbitFadeOut
                }
              >
                {/* Fewer captions than beats: the last one supplied carries the rest. */}
                {captions[Math.min(index, captions.length - 1)]}
              </span>
            ))}
          </figcaption>
        ))}
    </figure>
  );
}
