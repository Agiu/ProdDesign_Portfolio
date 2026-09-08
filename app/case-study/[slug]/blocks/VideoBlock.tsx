import styles from "../CaseStudy.module.css";

/**
 * The `video` custom block — a single hosted video URL (mp4, etc.) on its
 * own line. Same dark 16:9 frame as YouTubeEmbed, but a native <video>
 * element since there's no thumbnail/click-to-load facade to build for a
 * self-hosted file — the browser already defers loading via
 * preload="metadata".
 */
export function VideoBlock({ content }: { content: string }) {
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
