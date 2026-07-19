"use client";

import { useState } from "react";
import styles from "../CaseStudy.module.css";

/**
 * The `youtube` custom block — a single video ID on its own line.
 *
 * "Just a video frame" per the Figma legend: a dark 16:9 frame in the design
 * system. It's a click-to-load facade — the thumbnail plus a play button
 * (styled like the quote nav arrows: bordered square, diagonal white fill +
 * invert on hover) — and only swaps in the real iframe on click. That keeps
 * pages with several videos (minigolf has six) from loading a stack of heavy
 * players up front. Uses youtube-nocookie for the embed.
 */
export function YouTubeEmbed({ content }: { content: string }) {
  const id =
    content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)[0] ?? "";
  const [playing, setPlaying] = useState(false);

  if (!id) return null;

  return (
    <div className={styles.video}>
      <div className={styles.videoStage}>
        {playing ? (
          <iframe
            className={styles.videoFrame}
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.videoButton}
            onClick={() => setPlaying(true)}
            aria-label="Play video"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external
                YouTube thumbnail; intrinsic size is fixed and known. */}
            <img
              className={styles.videoThumb}
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
            />
            <span className={styles.videoScrim} aria-hidden />
            <span className={styles.videoPlay} aria-hidden>
              {/* Triangle drawn so its centroid sits at the viewBox centre
                  (9,6)-(9,18)-(18,12) → centroid (12,12), so it optically
                  centres in the square without any nudge. */}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 6v12l9-6z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
