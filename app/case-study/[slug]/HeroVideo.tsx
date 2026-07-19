"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CaseStudy.module.css";

/**
 * Layered over FadeImage's still in the case-study header. Starts
 * autoplaying (muted, so browsers allow it without a gesture) the moment it
 * mounts, hidden at opacity 0 until it can actually play smoothly — so
 * revealing it is a plain fade, never a playback restart — then cross-fades
 * in over the poster (styles.fadeImage / .loaded, shared with FadeImage and
 * FigureImage). Reduced motion leaves the poster as the resting state, same
 * as the homepage hero.
 */
export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      setReady(true);
      return;
    }
    const onCanPlay = () => setReady(true);
    el.addEventListener("canplay", onCanPlay, { once: true });
    return () => el.removeEventListener("canplay", onCanPlay);
  }, []);

  return (
    <video
      ref={ref}
      className={[styles.heroVideo, styles.fadeImage, ready && styles.loaded]
        .filter(Boolean)
        .join(" ")}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      disablePictureInPicture
      aria-hidden
    />
  );
}
