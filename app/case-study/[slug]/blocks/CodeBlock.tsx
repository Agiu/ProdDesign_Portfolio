import { tokenize, hexColor, type Token } from "./codeHighlight";
import styles from "../CaseStudy.module.css";

/**
 * The `ide` custom block — a fenced code sample.
 *
 * Renders a dark editor-style card: a title bar carrying the pixel-square
 * motif (as window "controls"), then the syntax-highlighted source. Colours
 * are coordinated with the design system (cool keyword blue matching the 3D
 * rim light, muted string/number tones), and any `0xRRGGBB` colour literal is
 * shown in its own colour with a swatch — the "color coordinated" idea.
 *
 * A plain server component: the highlighting is a pure function over static
 * content, so no client JS is needed.
 */

const TOKEN_CLASS: Partial<Record<Token["type"], string>> = {
  comment: styles.tokComment,
  string: styles.tokString,
  keyword: styles.tokKeyword,
  constant: styles.tokConstant,
  number: styles.tokNumber,
  function: styles.tokFunction,
};

export function CodeBlock({ content }: { content: string }) {
  if (!content.trim()) return null;
  const tokens = tokenize(content);

  return (
    <div className={styles.code}>
      <div className={styles.codeBar}>
        <span className={styles.codeDots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </div>
      <pre className={styles.codePre}>
        <code>
          {tokens.map((token, i) => {
            if (token.type === "color") {
              const color = hexColor(token.value);
              return (
                <span key={i} className={styles.tokColor} style={{ color }}>
                  <span
                    className={styles.codeSwatch}
                    style={{ background: color }}
                    aria-hidden
                  />
                  {token.value}
                </span>
              );
            }
            const className = TOKEN_CLASS[token.type];
            return className ? (
              <span key={i} className={className}>
                {token.value}
              </span>
            ) : (
              token.value
            );
          })}
        </code>
      </pre>
    </div>
  );
}
