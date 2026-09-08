"use client";

import { useState } from "react";
import styles from "../CaseStudy.module.css";

/**
 * The `youtube` custom block — a video ID on its own line, optionally
 * followed by `| unmuted` to start that one video with sound.
 *
 * "Just a video frame" per the Figma legend: a dark 16:9 frame in the design
 * system. It's a click-to-load facade — the thumbnail plus a play button
 * (styled like the quote nav arrows: bordered square, diagonal white fill +
 * invert on hover) — and only swaps in the real iframe on click. That keeps
 * pages with several videos (minigolf has six) from loading a stack of heavy
 * players up front. Uses youtube-nocookie for the embed.
 *
 * Muted-by-default (see the iframe src below) is still the right call for a
 * page that stacks several of these — a reader clicking through six thumbs
 * on minigolf shouldn't get blindsided by audio on each one. `unmuted` is an
 * opt-in per embed rather than a prop this component defaults differently,
 * so flipping it for one video (xbox's pitch clip, played deliberately by a
 * click right after "The Solution") can't silently change the others.
 */
export function YouTubeEmbed({ content }: { content: string }) {
  const [idLine = ""] = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const [id = "", flag = ""] = idLine.split("|").map((part) => part.trim());
  const unmuted = flag.toLowerCase() === "unmuted";
  const [playing, setPlaying] = useState(false);

  if (!id) return null;

  return (
    <div className={styles.video}>
      <div className={styles.videoStage}>
        {playing ? (
          <iframe
            className={styles.videoFrame}
            // Muted unless this embed opted in with `| unmuted` — autoplay
            // alone doesn't guarantee sound is off, and the viewer can always
            // unmute via YouTube's own controls (still shown) either way.
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=${unmuted ? 0 : 1}`}
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
