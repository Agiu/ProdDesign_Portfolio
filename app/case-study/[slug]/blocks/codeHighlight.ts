/**
 * A tiny, display-only tokenizer for the `ide` custom block — enough to give
 * JavaScript/TypeScript-ish source (the MakeCode sample under the minigolf
 * study) a "color coordinated" look, not a full parser. Regex-based: good
 * enough for read-only highlighting, and dependency-free like the rest of
 * this project's block tooling.
 *
 * The one bespoke token type is `color`: a `0xRRGGBB` literal (the LED colors
 * in the sample) is surfaced so the renderer can show it in its actual colour
 * with a swatch — the "color coordinated" bit.
 */

export type Token = {
  type:
    | "plain"
    | "comment"
    | "string"
    | "keyword"
    | "constant"
    | "number"
    | "color"
    | "function";
  value: string;
};

const KEYWORDS = new Set([
  "let", "const", "var", "function", "return", "if", "else", "for", "while",
  "do", "break", "continue", "new", "this", "typeof", "instanceof", "in", "of",
  "switch", "case", "default", "class", "extends", "super", "import", "export",
  "from", "as", "async", "await", "try", "catch", "finally", "throw", "yield",
  "void", "delete",
]);

const CONSTANTS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);

// One alternation: comments | strings | numbers | identifiers. Everything
// between matches (operators, punctuation, whitespace) is emitted as `plain`.
const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)|([A-Za-z_$][A-Za-z0-9_$]*)/g;

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN.exec(code)) !== null) {
    if (m.index > last) {
      tokens.push({ type: "plain", value: code.slice(last, m.index) });
    }

    if (m[1] !== undefined) {
      tokens.push({ type: "comment", value: m[1] });
    } else if (m[2] !== undefined) {
      tokens.push({ type: "string", value: m[2] });
    } else if (m[3] !== undefined) {
      const value = m[3];
      // A 6-digit hex literal is treated as a colour so it can be rendered in
      // that colour; anything else is a plain number.
      tokens.push({
        type: /^0x[0-9a-fA-F]{6}$/.test(value) ? "color" : "number",
        value,
      });
    } else if (m[4] !== undefined) {
      const value = m[4];
      if (KEYWORDS.has(value)) {
        tokens.push({ type: "keyword", value });
      } else if (CONSTANTS.has(value)) {
        tokens.push({ type: "constant", value });
      } else if (/^\s*\(/.test(code.slice(TOKEN.lastIndex))) {
        // Identifier immediately followed by "(" — a call.
        tokens.push({ type: "function", value });
      } else {
        tokens.push({ type: "plain", value });
      }
    }

    last = TOKEN.lastIndex;
  }

  if (last < code.length) {
    tokens.push({ type: "plain", value: code.slice(last) });
  }

  return tokens;
}

/** `0xrrggbb` → `#rrggbb` for use as a CSS colour. */
export function hexColor(literal: string): string {
  return `#${literal.slice(2)}`;
}
