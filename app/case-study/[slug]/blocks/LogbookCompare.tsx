import { LogbookPicker } from "./LogbookPicker";
import { LogbookPickerBefore } from "./LogbookPickerBefore";
import styles from "../CaseStudy.module.css";

/**
 * The `logbook-compare` custom block — the same `logbook` fence content,
 * rendered twice: once by LogbookPickerBefore.tsx (the first pass, kept as a
 * preserved snapshot) and once by LogbookPicker.tsx (today's). Both take
 * `bare`, so this owns the one dimmed stage both modals sit on rather than
 * each drawing its own — the point is one shared surface with two cards on
 * it, not two separate dialogs.
 *
 * A server component, unlike the two it renders: neither modal's own state
 * needs to reach up here, so there's nothing for this wrapper itself to do
 * in the browser.
 */
export function LogbookCompare({ content }: { content: string }) {
  return (
    <div className={styles.logbookCompareStage}>
      <div className={styles.logbookCompareGrid}>
        <div className={styles.logbookCompareCol}>
          <p className={styles.logbookCompareLabel} data-side="before">
            Before
          </p>
          <LogbookPickerBefore content={content} bare />
        </div>
        <div className={styles.logbookCompareCol}>
          <p className={styles.logbookCompareLabel} data-side="after">
            After
          </p>
          <LogbookPicker content={content} bare />
        </div>
      </div>
    </div>
  );
}
