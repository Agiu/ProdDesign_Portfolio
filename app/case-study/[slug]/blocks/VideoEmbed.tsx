import styles from "../CaseStudy.module.css";

/**
 * The `video` custom block — a single directly-hosted video file URL (mp4,
 * etc.) on its own line. Same dark 16:9 frame as YouTubeEmbed, but no
 * click-to-load facade: a self-hosted clip has no oEmbed thumbnail to show,
 * and there's no shared-player weight to defer here, so it just renders the
 * native <video> element with its own controls.
 */
export function VideoEmbed({ content }: { content: string }) {
  const src =
    content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)[0] ?? "";

  if (!src) return null;

  return (
    <div className={styles.video}>
      <div className={styles.videoStage}>
        <video
          className={styles.videoFrame}
          src={src}
          controls
          playsInline
          preload="metadata"
        />
      </div>
    </div>
  );
}
