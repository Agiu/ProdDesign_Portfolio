"use client";

import Image from "next/image";
import { filmmaker } from "@/content/home";
import { useReveal } from "./useReveal";
import { useParallax } from "./useParallax";
import { ArrowIcon } from "./ArrowIcon";
import styles from "./Filmmaker.module.css";

export function Filmmaker() {
  const reveal = useReveal<HTMLDivElement>();
  // Unlike the Hero (pinned to the top of the page), this section scrolls
  // into view from below as well as out above — "transit" drifts it the
  // whole time it's on screen, in both directions.
  const media = useParallax<HTMLDivElement>("transit");

  return (
    <section className={styles.section} id="films">
      <div className={styles.media} ref={media}>
        <Image
          src={filmmaker.image}
          alt={filmmaker.imageAlt}
          fill
          sizes="100vw"
          className={styles.image}
        />
      </div>
      <div className={styles.scrim} aria-hidden />

      <div ref={reveal} className={`${styles.inner} reveal`}>
        <h2 className={styles.heading}>{filmmaker.heading}</h2>
        <p className={styles.body}>{filmmaker.body}</p>
        <a href={filmmaker.href} className={styles.cta}>
          <span>See the films</span>
          <ArrowIcon className={styles.arrow} />
        </a>
      </div>
    </section>
  );
}
