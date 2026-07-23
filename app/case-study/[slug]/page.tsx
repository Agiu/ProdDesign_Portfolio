import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies } from "@/content/home";
import { parseCaseStudy, type Block, type InlineToken } from "@/lib/markdown";
import { Footer } from "@/components/Footer";
import { Toc } from "./Toc";
import { CaseMeta } from "./CaseMeta";
import { FadeImage } from "./FadeImage";
import { FigureImage } from "./FigureImage";
import { HeroVideo } from "./HeroVideo";
import { MarkdownButton } from "./blocks/MarkdownButton";
import { QuoteCarousel } from "./blocks/QuoteCarousel";
import { CarouselBlock } from "./blocks/CarouselBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { ModelViewer } from "./blocks/ModelViewer";
import { ListBlock } from "./blocks/ListBlock";
import { YouTubeEmbed } from "./blocks/YouTubeEmbed";
import { CodeBlock } from "./blocks/CodeBlock";
import { Callout } from "./blocks/Callout";
import { ArrowIcon } from "@/components/ArrowIcon";
import styles from "./CaseStudy.module.css";

/** Prerender one page per known study at build time. */
export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

/** Only the studies we know about — anything else 404s. */
export const dynamicParams = false;

function getStudy(slug: string) {
  return caseStudies.find((s) => s.slug === slug);
}

async function readMarkdown(slug: string): Promise<string | null> {
  // The source files live under `public/case studies/` (note the space).
  const file = path.join(process.cwd(), "public", "case studies", `${slug}.md`);
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getStudy(slug);
  if (!study) return {};
  return {
    title: `${study.title} — Caleb Aguiar`,
    description: study.summary,
  };
}

/** Render a run of inline tokens to React nodes. */
function Inline({ tokens }: { tokens: InlineToken[] }) {
  return (
    <>
      {tokens.map((t, i) => {
        switch (t.type) {
          case "bold":
            return <strong key={i}>{t.value}</strong>;
          case "italic":
            return <em key={i}>{t.value}</em>;
          case "highlight":
            return (
              <mark key={i} className={styles.highlight}>
                {t.value}
              </mark>
            );
          case "link":
            return (
              <a
                key={i}
                href={t.href}
                className={styles.link}
                target={t.href.startsWith("http") ? "_blank" : undefined}
                rel={t.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {t.value}
              </a>
            );
          default:
            return <span key={i}>{t.value}</span>;
        }
      })}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "heading":
      return (
        <>
          <h2 id={block.id} className={styles.h2}>
            {block.title}
          </h2>
          {block.lead && (
            <p className={styles.lead}>
              <Inline tokens={block.lead} />
            </p>
          )}
        </>
      );
    case "subheading":
      return (
        <h3 className={styles.h3}>
          <Inline tokens={block.text} />
        </h3>
      );
    case "paragraph":
      return (
        <p className={styles.paragraph}>
          <Inline tokens={block.text} />
        </p>
      );
    case "image":
      return (
        <figure className={styles.figure}>
          {/* Plain img on purpose: these paths land when the image folders are
              added later, and their intrinsic sizes aren't known ahead of time. */}
          <FigureImage src={block.src} alt={block.alt} className={styles.figureImg} />
          {block.alt && <figcaption className={styles.caption}>{block.alt}</figcaption>}
        </figure>
      );
    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline tokens={item} />
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className={styles.quote}>
          {block.lines.map((line, i) => (
            <p key={i}>
              <Inline tokens={line} />
            </p>
          ))}
        </blockquote>
      );
    case "custom":
      // Rich blocks translated from the Figma design system.
      if (block.name === "button") return <MarkdownButton content={block.content} />;
      if (block.name === "quotes") return <QuoteCarousel content={block.content} />;
      if (block.name === "carousel") return <CarouselBlock content={block.content} />;
      if (block.name === "stats") return <StatsBlock content={block.content} />;
      if (block.name === "3d-model") return <ModelViewer content={block.content} />;
      if (
        block.name === "insights" ||
        block.name === "hmw" ||
        block.name === "rules" ||
        block.name === "questions"
      )
        return <ListBlock content={block.content} />;
      if (block.name === "youtube") return <YouTubeEmbed content={block.content} />;
      if (block.name === "ide") return <CodeBlock content={block.content} />;
      if (block.name === "recruiter" || block.name === "masters")
        return <Callout name={block.name} content={block.content} />;
      // Everything else keeps the labelled placeholder until it's built.
      return (
        <div className={styles.customBlock} data-block={block.name}>
          <span className={styles.customBlockLabel}>{block.name}</span>
          <pre className={styles.customBlockContent}>{block.content}</pre>
        </div>
      );
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getStudy(slug);
  if (!study) notFound();

  const markdown = await readMarkdown(slug);
  if (markdown === null) notFound();

  const { toc, blocks } = parseCaseStudy(markdown);
  // Two other studies, as a light text list rather than full panels.
  const recommended = caseStudies.filter((s) => s.slug !== slug).slice(0, 2);

  return (
    <>
      <main className={styles.page}>
      <header className={styles.hero}>
        <FadeImage
          src={study.hero ?? study.cover}
          alt={study.title}
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        {study.video && <HeroVideo src={study.video} />}
        <div className={styles.heroScrim} />
        <div className={styles.heroInner}>
          <Link href="/#work" className={styles.back} aria-label="Back to case studies">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M19 12H5m0 0 6 6m-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className={styles.title}>{study.title}</h1>
          <p className={styles.summary}>{study.summary}</p>
        </div>
      </header>

      {study.meta && <CaseMeta meta={study.meta} />}

      <div className={styles.body}>
        <Toc toc={toc} />
        <article className={styles.content}>
          {blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </article>
      </div>

      {recommended.length > 0 && (
        <section className={styles.recommended}>
          <h2 className={styles.recommendedHeading}>Recommended Case Studies</h2>
          <ul className={styles.recommendedList}>
            {recommended.map((s) => (
              <li key={s.slug}>
                <Link href={`/case-study/${s.slug}`} className={styles.recItem}>
                  <span className={styles.recEyebrow}>{s.discipline}</span>
                  <h3 className={styles.recTitle}>
                    {s.title}
                    <ArrowIcon className={styles.recArrow} />
                  </h3>
                  <p className={styles.recDesc}>{s.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      </main>
      <Footer />
    </>
  );
}
