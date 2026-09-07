import { Icon } from "./Icon";
import styles from "../CaseStudy.module.css";

/**
 * The two notice fences — `recruiter` and `masters`.
 *
 * Both render the same card: a hazard bar down the left edge, an icon, and a
 * label + sentence. The fence name picks the tone, which is the only thing
 * that differs — `recruiter` warns (hatched bar, alert glyph), `masters`
 * simply notes (solid bar, cap glyph). The site has no accent colour, so the
 * warning reads through the caution-tape hatching rather than through hue.
 *
 * Line syntax is `Title | Body | Icon`, matching the other blocks — but every
 * field is optional and falls back to the fence's preset, so an empty
 * ```masters fence renders the standard academic-work note with no arguments.
 *
 * A plain server component — static content, no client JS.
 */

type Preset = {
  tone: "warning" | "note";
  title: string;
  /** Only the presets that stand alone carry default copy; see `masters`. */
  body: string;
  icon: string;
};

const PRESETS: Record<string, Preset> = {
  recruiter: {
    tone: "warning",
    title: "Heads Up",
    body: "",
    icon: "TriangleAlert",
  },
  masters: {
    tone: "note",
    title: "Academic Work",
    body: "This is a Master's project from the MHCI + Design program at the University of Washington.",
    icon: "GraduationCap",
  },
};

export function Callout({ name, content }: { name: string; content: string }) {
  const preset = PRESETS[name] ?? PRESETS.recruiter;

  // Fences are written on one line, but a wrapped one shouldn't break — flatten
  // any newlines back into the single sentence they were meant to be.
  const [title, body, icon] = content
    .replace(/\s*\n\s*/g, " ")
    .split("|")
    .map((part) => part.trim());

  const text = body || preset.body;
  // A `recruiter` fence with no copy has nothing to say — it carries no default
  // body, so there'd be a bar and a label sitting over empty space.
  if (!text) return null;

  return (
    <aside className={styles.callout} data-tone={preset.tone}>
      <span className={styles.calloutBar} aria-hidden />
      <Icon name={icon || preset.icon} className={styles.calloutIcon} />
      <div className={styles.calloutBody}>
        <p className={styles.calloutLabel}>{title || preset.title}</p>
        <p className={styles.calloutText}>{text}</p>
      </div>
    </aside>
  );
}
