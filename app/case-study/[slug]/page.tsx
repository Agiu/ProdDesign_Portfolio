import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseStudies, listedCaseStudies } from "@/content/home";
import { parseCaseStudy, type Block, type InlineToken } from "@/lib/markdown";
import { cookieNameFor, isUnlocked } from "@/lib/caseStudyAuth";
import { Footer } from "@/components/Footer";
import { Toc } from "./Toc";
import { PasswordGate } from "./PasswordGate";
import { CaseHeroVitals, CaseMeta } from "./CaseMeta";
import { FadeImage } from "./FadeImage";
import { FigureImage } from "./FigureImage";
import { HeroVideo } from "./HeroVideo";
import { BackLink } from "./BackLink";
import { MarkdownButton } from "./blocks/MarkdownButton";
import { QuoteCarousel } from "./blocks/QuoteCarousel";
import { CarouselBlock } from "./blocks/CarouselBlock";
import { ImageCarousel } from "./blocks/ImageCarousel";
import { StatsBlock } from "./blocks/StatsBlock";
import { ModelViewer } from "./blocks/ModelViewer";
import { ListBlock } from "./blocks/ListBlock";
import { InsightToggle } from "./blocks/InsightToggle";
import { YouTubeEmbed } from "./blocks/YouTubeEmbed";
import { VideoBlock } from "./blocks/VideoBlock";
import { LogoOrbit } from "./blocks/LogoOrbit";
import { PersonaCarousel } from "./blocks/PersonaCarousel";
import { ImageCompare } from "./blocks/ImageCompare";
import { BoardCanvas } from "./blocks/BoardCanvas";
import { ChangeChart } from "./blocks/ChangeChart";
import { TrackStream } from "./blocks/TrackStream";
import { LinkFlow } from "./blocks/LinkFlow";
import { VariantCarousel } from "./blocks/VariantCarousel";
import { LinkSubmenu } from "./blocks/LinkSubmenu";
import { LogbookPicker } from "./blocks/LogbookPicker";
import { LogbookCompare } from "./blocks/LogbookCompare";
import { CodeBlock } from "./blocks/CodeBlock";
import { Callout } from "./blocks/Callout";
import { RecommendedCard } from "./RecommendedCard";
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
      if (block.name === "image-carousel") return <ImageCarousel content={block.content} />;
      if (block.name === "stats") return <StatsBlock content={block.content} />;
      if (block.name === "3d-model") return <ModelViewer content={block.content} />;
      if (
        block.name === "insights" ||
        block.name === "hmw" ||
        block.name === "rules" ||
        block.name === "questions"
      )
        return <ListBlock content={block.content} />;
      if (block.name === "insight-toggle") return <InsightToggle content={block.content} />;
      if (block.name === "youtube") return <YouTubeEmbed content={block.content} />;
      if (block.name === "video") return <VideoBlock content={block.content} />;
      if (block.name === "logo-orbit") return <LogoOrbit content={block.content} />;
      if (block.name === "personas") return <PersonaCarousel content={block.content} />;
      if (block.name === "compare") return <ImageCompare content={block.content} />;
      if (block.name === "board") return <BoardCanvas content={block.content} />;
      if (block.name === "chart") return <ChangeChart content={block.content} />;
      if (block.name === "stream") return <TrackStream content={block.content} />;
      if (block.name === "flow") return <LinkFlow content={block.content} />;
      if (block.name === "variants")
        return <VariantCarousel content={block.content} />;
      if (block.name === "submenu") return <LinkSubmenu content={block.content} />;
      if (block.name === "logbook") return <LogbookPicker content={block.content} />;
      if (block.name === "logbook-compare")
        return <LogbookCompare content={block.content} />;
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

  // Reading a cookie is a Request-time API — it opts *this* rendered page out
  // of static generation, not the other studies' pages, since none of them
  // reach this branch (see the `protected` field on CaseStudy for why).
  let locked = false;
  if (study.protected) {
    const store = await cookies();
    locked = !isUnlocked(slug, store.get(cookieNameFor(slug))?.value);
  }

  const { toc, blocks } = parseCaseStudy(markdown);
  // Two other studies, as a light text list rather than full panels. Archived
  // studies are left out — a page of one still reads, it just doesn't send
  // anyone onward to another.
  //
  // The next two studies after this one, wrapping around the list, rather
  // than a fixed pair — a static "first two" meant most studies never got
  // recommended from anywhere at all. An archived study (not in the list)
  // falls back to the first two overall, same as before.
  const idx = listedCaseStudies.findIndex((s) => s.slug === slug);
  const n = listedCaseStudies.length;
  const recommended =
    idx === -1
      ? listedCaseStudies.slice(0, 2)
      : Array.from(
          { length: Math.min(2, n - 1) },
          (_, i) => listedCaseStudies[(idx + 1 + i) % n],
        );

  return (
    <>
      {/* The resting states on this page a script has to clear: without JS
          the `stream` block's rows, and the `flow` block's whole filled
          entry, would stay hidden forever. Named here rather than in
          layout.tsx for the same reason the recruiter page keeps its own —
          they're this page's blocks, not the site's. Everything below is
          addressed by data attribute because a CSS-module class name is
          hashed and can't be written by hand. */}
      <noscript>
        <style>{`
          [data-anim="pending"] [data-row] {
            opacity: 1 !important;
            transform: none !important;
          }
          [data-anim="pending"] [data-spine] { transform: none !important; }
          [data-anim="pending"] [data-value] {
            opacity: 1 !important;
            transform: none !important;
          }
          [data-anim="pending"] [data-field-row] { opacity: 1 !important; }
          [data-anim="pending"] [data-empty],
          [data-anim="pending"] [data-ghost] { opacity: 0 !important; }
          [data-anim="pending"] [data-chip],
          [data-anim="pending"] [data-cursor],
          [data-anim="pending"] [data-menu] { display: none !important; }
          [data-flow-replay] { display: none !important; }
        `}</style>
      </noscript>

      <main className={styles.page}>
      <BackLink />
      {/* The dark run BackLink.tsx tracks to know when to flip its own tone —
          always just the hero now that the vitals row below it (CaseMeta.tsx)
          sits on paper rather than on a dark card of its own. */}
      <header className={styles.hero} data-dark-run="">
        <FadeImage
          src={study.hero ?? study.cover}
          alt={study.title}
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        {study.video && (
          <HeroVideo src={study.video} poster={study.hero ?? study.cover} />
        )}
        <div
          className={[styles.heroScrim, study.video && styles.heroScrimVideo]
            .filter(Boolean)
            .join(" ")}
        />
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>{study.title}</h1>
            <p className={styles.summary}>{study.summary}</p>
          </div>

          {study.meta && !locked && <CaseHeroVitals meta={study.meta} />}
        </div>
      </header>

      {study.meta && !locked && <CaseMeta meta={study.meta} />}

      <div className={styles.body}>
        {locked ? (
          <PasswordGate slug={slug} title={study.title} />
        ) : (
          <>
            <Toc toc={toc} />
            <article className={styles.content}>
              {blocks.map((block, i) => (
                <BlockView key={i} block={block} />
              ))}
            </article>
          </>
        )}
      </div>

      {recommended.length > 0 && (
        <section className={styles.recommended}>
          <h2 className={styles.recommendedHeading}>Recommended Case Studies</h2>
          <ul className={styles.recommendedList}>
            {recommended.map((s) => (
              <li key={s.slug}>
                <RecommendedCard study={s} />
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
