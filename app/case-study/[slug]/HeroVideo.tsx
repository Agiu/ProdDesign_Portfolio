"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CaseStudy.module.css";

/**
 * Layered over FadeImage's still in the case-study header. Starts
 * autoplaying (muted, so browsers allow it without a gesture) the moment it
 * mounts, hidden at opacity 0 until it can actually play smoothly — so
 * revealing it is a plain fade, never a playback restart — then cross-fades
 * in over the still (styles.fadeImage / .loaded, shared with FadeImage and
 * FigureImage). Reduced motion leaves the still as the resting state, same
 * as the homepage hero.
 *
 * `poster` is the same hero/cover image FadeImage is already showing
 * underneath — belt-and-suspenders for the sliver of time before this
 * component's own opacity logic takes over, and for a browser that never
 * gets `canplay` (a slow network, or the src 404ing) with JS otherwise
 * disabled, since that's the one path FadeImage's fade doesn't cover.
 */
export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
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
      poster={poster}
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
