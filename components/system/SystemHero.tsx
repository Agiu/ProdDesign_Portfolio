import Image from "next/image";
import type { CSSProperties } from "react";
import { system } from "@/content/system";
import { RegMarks } from "./RegMarks";
import sys from "./System.module.css";
import styles from "./SystemHero.module.css";

/*
 * The still's stepped edge, after the Nucleus logomark: the plate is cut into
 * horizontal bars that all hang from its right edge, each one starting a
 * little further in than the bar above it. One polygon traces every bar; the
 * stretches between bars run along the right edge itself, so they have zero
 * width and the gaps stay open.
 *
 * Each bar's left edge is written against --reveal (0 to 1, animated in
 * SystemHero.module.css), with a per-bar offset, so the bars extend one after
 * another from a single animated number. --reveal defaults to 1, so without
 * the animation (reduced motion, no @property support) the plate simply sits
 * at its finished shape.
 */
const BARS = 14;
const GAP = 0.7; // % of the plate's height between bars
const STEP = 2.1; // % of the plate's width each bar starts further in

function steppedEdge() {
  const height = (100 - GAP * (BARS - 1)) / BARS;
  const points: string[] = [];

  for (let i = 0; i < BARS; i++) {
    const top = (i * (height + GAP)).toFixed(3);
    const bottom = (i * (height + GAP) + height).toFixed(3);
    const travel = 100 - i * STEP;
    const lag = (i * 0.04).toFixed(2);
    const x = `calc(100% - ${travel}% * clamp(0, var(--reveal, 1) * 1.6 - ${lag}, 1))`;

    points.push(`100% ${top}%`, `${x} ${top}%`, `${x} ${bottom}%`, `100% ${bottom}%`);
  }

  return `polygon(${points.join(", ")})`;
}

const CLIP: CSSProperties = { clipPath: steppedEdge() };

export function SystemHero() {
  const { hero } = system;

  return (
    <section id="top" className={styles.hero} aria-label="Introduction">
      <div className={`${sys.container} ${styles.shell}`}>
        <div className={styles.frame}>
          <RegMarks />

          <div className={`${sys.readout} ${styles.edge} ${styles.edgeTop}`} aria-hidden>
            {hero.frameTop.map((lines) => (
              <p key={lines[0]} className={styles.cell}>
                {lines.map((line) => (
                  <span key={line} className={styles.line}>
                    {line}
                  </span>
                ))}
              </p>
            ))}
          </div>

          <div className={styles.body}>
            <div className={styles.copy}>
              <h1 className={styles.name}>
                {hero.name.map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </h1>
              <p className={styles.statement}>{hero.statement}</p>
              <a href={hero.cta.href} className={styles.cta}>
                {hero.cta.label}
                <span aria-hidden>↓</span>
              </a>
            </div>

            <figure className={styles.plate}>
              <div className={`${sys.duotone} ${styles.still}`} style={CLIP}>
                <Image
                  src={hero.still.src}
                  alt={hero.still.alt}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 900px) 100vw, 42vw"
                  className={styles.image}
                />
              </div>
              <figcaption className={`${sys.readout} ${sys.label} ${styles.caption}`}>
                {hero.still.caption}
              </figcaption>
            </figure>
          </div>

          <dl className={`${sys.readout} ${styles.edge} ${styles.edgeBottom}`}>
            {hero.frameBottom.map(({ label, value }) => (
              <div key={label} className={styles.cell}>
                <dt className={sys.label}>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
