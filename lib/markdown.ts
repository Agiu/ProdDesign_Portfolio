/**
 * A small, purpose-built parser for the case-study markdown in
 * `public/case studies/*.md`. It is deliberately not a general CommonMark
 * engine — it understands only the constructs those files actually use, plus
 * this project's bespoke additions:
 *
 *   - `## Heading | lead sentence`  → a section heading whose text after the
 *     pipe becomes a lead paragraph (and drives the "Navigation" TOC).
 *   - `### Subheading`
 *   - `![alt](src)`                → figure with the alt text as its caption.
 *   - `==highlight==`, `**bold**`, `[text](url)`, `*italic*` inline.
 *   - `> ...` blockquotes and `* ` / `- ` lists.
 *   - ```` ```type ```` fenced blocks (stats, insights, quotes, button, …).
 *     These carry rich custom syntax that renders as a labelled placeholder
 *     for now — the real block renderers come later.
 *
 * The parser returns plain data (strings and inline-token arrays); turning
 * that into JSX is the page's job, so this file stays free of React.
 */

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "highlight"; value: string }
  | { type: "link"; value: string; href: string };

export type Block =
  | { kind: "heading"; id: string; title: string; lead: InlineToken[] | null }
  | { kind: "subheading"; text: InlineToken[] }
  | { kind: "paragraph"; text: InlineToken[] }
  | { kind: "image"; src: string; alt: string }
  | { kind: "list"; items: InlineToken[][] }
  | { kind: "quote"; lines: InlineToken[][] }
  | { kind: "custom"; name: string; content: string };

export type TocEntry = { id: string; title: string };

export type ParsedCaseStudy = { toc: TocEntry[]; blocks: Block[] };

/** The fenced-block languages that are this project's custom widgets rather
 *  than real source code. Everything else in a fence is treated as code. */
const CUSTOM_BLOCKS = new Set([
  "stats",
  "insights",
  "hmw",
  "quotes",
  "button",
  "youtube",
  "carousel",
  "rules",
  "questions",
  "recruiter",
  "masters",
  "ide",
  "3d-model",
]);

/** Kebab-case slug for heading anchors / TOC targets. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Split a run of text into inline tokens. Order matters: links are matched
 * first (they contain other punctuation), then the paired-delimiter marks.
 * Unclosed delimiters fall through as literal text.
 */
export function parseInline(input: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // One alternation over every inline form; each has its own capture group.
  const pattern =
    /\[([^\]]+)\]\(([^)]+)\)|==([^=]+)==|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: input.slice(last, match.index) });
    }
    if (match[1] !== undefined) {
      tokens.push({ type: "link", value: match[1], href: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: "highlight", value: match[3] });
    } else if (match[4] !== undefined) {
      tokens.push({ type: "bold", value: match[4] });
    } else if (match[5] !== undefined) {
      tokens.push({ type: "italic", value: match[5] });
    } else if (match[6] !== undefined) {
      tokens.push({ type: "italic", value: match[6] });
    }
    last = pattern.lastIndex;
  }
  if (last < input.length) {
    tokens.push({ type: "text", value: input.slice(last) });
  }
  return tokens;
}

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;

export function parseCaseStudy(markdown: string): ParsedCaseStudy {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const toc: TocEntry[] = [];

  let i = 0;
  // Buffer of consecutive plain-text lines forming one paragraph.
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: parseInline(paragraph.join(" ")) });
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced block: consume until the closing fence.
    const fence = trimmed.match(/^```([a-z0-9-]*)$/i);
    if (fence) {
      flushParagraph();
      const name = fence[1] || "code";
      const body: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "```") {
        body.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ kind: "custom", name, content: body.join("\n").trim() });
      continue;
    }

    if (trimmed === "") {
      flushParagraph();
      i++;
      continue;
    }

    // Standalone image.
    const img = trimmed.match(IMAGE_RE);
    if (img) {
      flushParagraph();
      blocks.push({ kind: "image", alt: img[1], src: img[2] });
      i++;
      continue;
    }

    // Headings. `##` is a section (with optional ` | lead`); `###` a subhead.
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push({ kind: "subheading", text: parseInline(trimmed.slice(4)) });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      const rest = trimmed.slice(3);
      const pipe = rest.indexOf("|");
      const title = (pipe === -1 ? rest : rest.slice(0, pipe)).trim();
      const leadText = pipe === -1 ? "" : rest.slice(pipe + 1).trim();
      const id = slugify(title);
      toc.push({ id, title });
      blocks.push({
        kind: "heading",
        id,
        title,
        lead: leadText ? parseInline(leadText) : null,
      });
      i++;
      continue;
    }

    // Blockquote: gather the run of `>` lines.
    if (trimmed.startsWith(">")) {
      flushParagraph();
      const quoteLines: InlineToken[][] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        const content = lines[i].trim().replace(/^>\s?/, "");
        if (content) quoteLines.push(parseInline(content));
        i++;
      }
      blocks.push({ kind: "quote", lines: quoteLines });
      continue;
    }

    // Unordered list: gather the run of `*`/`-` items.
    if (/^[*-]\s+/.test(trimmed)) {
      flushParagraph();
      const items: InlineToken[][] = [];
      while (i < lines.length && /^[*-]\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^[*-]\s+/, "")));
        i++;
      }
      blocks.push({ kind: "list", items });
      continue;
    }

    // Otherwise it's paragraph text.
    paragraph.push(trimmed);
    i++;
  }
  flushParagraph();

  return { toc, blocks };
}
