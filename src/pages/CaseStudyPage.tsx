import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { caseStudies, CaseStudyCard, getBrightAccent } from '../components/case-studies';
import { ModelViewer } from '../components/ModelViewer';

// @ts-ignore
const mdModules = import.meta.glob('../content/case-studies/*.md', { query: '?raw', import: 'default' });

interface Heading { id: string; text: string; level: number; }

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseHeadings(md: string): Heading[] {
  return md.split('\n')
    .filter(line => /^#{2}\s/.test(line))
    .map(line => {
      const level = 2;
      let text = line.replace(/^#{2}\s+/, '').trim();

      if (text.includes('|')) {
        text = text.split('|')[0].trim();
      }

      return { id: slugify(text), text, level };
    });
}

function QuoteCarousel({ lines }: { lines: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const quotes = lines.map(line => {
    const parts = line.split('|').map(s => s.trim());
    return {
      quote: parts[0],
      author: parts[1] || ''
    };
  }).filter(q => q.quote);

  if (quotes.length === 0) return null;

  const isCarousel = quotes.length > 1;
  const currentQuote = quotes[currentIndex];

  const next = () => {
    if (currentIndex < quotes.length - 1) {
      setDirection(1);
      setCurrentIndex(i => i + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
    }
  };

  const getFontSizeClass = (text: string) => {
    const len = text.length;
    if (len < 60) return 'text-2xl md:text-5xl';
    if (len < 100) return 'text-xl md:text-4xl';
    if (len < 150) return 'text-lg md:text-3xl';
    return 'text-base md:text-2xl';
  };

  return (
    <div className="my-12 not-prose flex flex-col gap-4">
      <div className="flex items-center gap-2 md:gap-4 w-full">
        {isCarousel && (
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors text-white outline-none ${currentIndex === 0 ? 'bg-white/5 opacity-30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <LucideIcons.ChevronLeft size={24} />
          </button>
        )}

        <div className="flex-1 relative p-6 md:p-12 rounded-2xl bg-white/5 backdrop-blur-sm shadow-xl overflow-hidden flex flex-col justify-center min-h-[280px] md:min-h-[320px]">
          <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: 'var(--accent)' }}></div>

          <div className="absolute -top-12 -left-4 text-[16rem] text-white/[0.03] leading-none pointer-events-none select-none" style={{ fontFamily: '"Domaine Text", serif', letterSpacing: 'normal' }}>
            "
          </div>

          <div className="relative z-10">
            <div className={`text-white leading-snug font-medium mb-6 ${getFontSizeClass(currentQuote.quote)}`} style={{ fontFamily: '"Domaine Text", serif', letterSpacing: 'normal' }}>
              "{currentQuote.quote}"
            </div>
            {currentQuote.author && (
              <div className="text-white/60 tracking-widest uppercase text-sm font-semibold" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                — {currentQuote.author}
              </div>
            )}
          </div>
        </div>

        {isCarousel && (
          <button
            onClick={next}
            disabled={currentIndex === quotes.length - 1}
            className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors text-white outline-none ${currentIndex === quotes.length - 1 ? 'bg-white/5 opacity-30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <LucideIcons.ChevronRight size={24} />
          </button>
        )}
      </div>

      {isCarousel && (
        <div className="flex justify-center w-full">
          <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
            {currentIndex + 1} / {quotes.length}
          </div>
        </div>
      )}
    </div>
  );
}

function extractText(node: any): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && node.props && node.props.children) return extractText(node.props.children);
  return '';
}

function renderSubtitle(text: string) {
  return text.split(/(==[^=]+==)/g).map((part, i) => {
    if (part.startsWith('==') && part.endsWith('==')) {
      return <span key={i} className="highlight-text" style={{ color: 'var(--accent)', fontWeight: 400 }}>{part.slice(2, -2)}</span>;
    }
    return part;
  });
}

// Custom heading renderers that inject id attributes
function makeHeadingComponents() {
  const H2 = ({ children }: { children?: React.ReactNode }) => {
    const text = extractText(children);

    if (text.includes('|')) {
      const parts = text.split('|');
      const title = parts[0].trim();
      const subtitle = parts.slice(1).join('|').trim();

      return (
        <React.Fragment>
          <h2 id={slugify(title)} className="h2-subtitle-mode">
            {title}
          </h2>
          <p className="text-xl font-light !mt-0 !mb-0" style={{ fontFamily: '"American Grotesk", sans-serif', color: 'var(--accent)' }}>
            {renderSubtitle(subtitle)}
          </p>
          <div className="w-full h-px bg-white/10 mt-6 mb-12" />
        </React.Fragment>
      );
    }

    return <h2 id={slugify(text)}>{children}</h2>;
  };
  const H3 = ({ children }: { children?: React.ReactNode }) => {
    const text = extractText(children);
    return <h3 id={slugify(text)}>{children}</h3>;
  };
  return { h2: H2, h3: H3 };
}

const headingComponents = makeHeadingComponents();

// Context so ImageRenderer can call back into the page's lightbox
import React from 'react';
const LightboxContext = React.createContext<(src: string, alt: string) => void>(() => { });

const ImageRenderer = ({ src, alt }: { src?: string; alt?: string }) => {
  const openLightbox = React.useContext(LightboxContext);
  return (
    <figure className="my-10 flex flex-col items-center gap-4">
      <img
        src={src}
        alt={alt}
        onClick={() => src && openLightbox(src, alt ?? '')}
        className="w-full max-w-2xl rounded-2xl object-cover cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
      />
      {alt && (
        <figcaption className="text-white/50 text-sm text-center max-w-2xl px-4 font-medium tracking-wide" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
          {alt}
        </figcaption>
      )}
    </figure>
  );
};


interface CaseStudyPageProps { darkColor: string; }

export function CaseStudyPage({ darkColor }: CaseStudyPageProps) {
  const brightAccent = getBrightAccent(darkColor);
  const { id } = useParams<{ id: string }>();
  const [markdown, setMarkdown] = useState<string>('');
  const [activeId, setActiveId] = useState<string>('');
  const [tocOpen, setTocOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [isPlayingShowcase, setIsPlayingShowcase] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { margin: "0px 0px 50% 0px" });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ method: isHeroInView ? 'play' : 'pause' }),
        '*'
      );
    }
  }, [isHeroInView]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  const [paddingTarget, setPaddingTarget] = useState(24);
  const [hasScrolledDown, setHasScrolledDown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20 && !hasScrolledDown) {
        setHasScrolledDown(true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasScrolledDown]);

  useEffect(() => {
    const handleResize = () => {
      // Ensure horizontal padding perfectly aligns with max-w-7xl (1280px) and px-6 (24px)
      setPaddingTarget(Math.max(24, (window.innerWidth - 1280) / 2));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use pure numbers for reliable pixel interpolation in Framer Motion
  const paddingTop = useTransform(scrollYProgress, [0, 1], [0, 128]); // 128px = 8rem
  const paddingX = useTransform(scrollYProgress, [0, 1], [0, paddingTarget]);
  const height = useTransform(scrollYProgress, [0, 1], ["100vh", "60vh"]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 24]);

  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 32]); // 32px = 2rem
  const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 0.2]);

  const openLightbox = useCallback((src: string, alt: string) => setLightbox({ src, alt }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeLightbox]);

  const currentStudy = caseStudies.find(study => study.id.toString() === id);
  const headings = parseHeadings(markdown);

  useEffect(() => {
    const fetchMarkdown = async () => {
      const path = `../content/case-studies/${id}.md`;
      if (mdModules[path]) {
        try {
          const text = await mdModules[path]() as unknown as string;
          setMarkdown(text);
        } catch (e) {
          setMarkdown('# Error loading markdown');
        }
      } else {
        setMarkdown('# Case study not found');
      }
    };
    fetchMarkdown();
    setIsPlayingShowcase(false);
    window.scrollTo(0, 0);
  }, [id]);

  // Scroll-spy
  const handleScroll = useCallback(() => {
    const els = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    let current = '';
    for (const el of els) {
      if (el.getBoundingClientRect().top <= 120) current = el.id;
    }
    setActiveId(current);
  }, [headings]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTocOpen(false);
  };

  const otherStudies = caseStudies.filter(study => study.id.toString() !== id).slice(0, 2);

  const TocLinks = () => (
    <nav style={{ fontFamily: '"American Grotesk", sans-serif' }} className="flex flex-col gap-1">
      {headings.map(h => {
        const isActive = activeId === h.id;
        return (
          <button
            key={h.id}
            onClick={() => scrollTo(h.id)}
            className={`relative block w-full text-left transition-all duration-300 py-2 pr-3 rounded-lg
              ${h.level === 3 ? 'pl-8 text-[13.5px] text-white/60' : 'pl-3 text-[15px] font-medium'}
              ${isActive
                ? 'text-white bg-white/10 shadow-sm'
                : 'hover:text-white/90 hover:bg-white/5'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeToc"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white rounded-r-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="flex items-center gap-2.5">
              {h.level === 3 && <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-white' : 'bg-white/20'}`} />}
              <span className="truncate">{h.text}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="w-full min-h-screen text-white bg-black" style={{ backgroundColor: darkColor, transition: 'background-color 0.6s ease', '--accent': brightAccent } as React.CSSProperties}>

        {/* Navigation / Header */}
        <nav className="fixed top-8 left-6 md:left-12 z-50 mix-blend-difference">
          <Link
            to="/"
            className="inline-flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200 rounded-full p-2 hover:bg-white/10"
            aria-label="Back home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </nav>

        {/* HERO ANIMATION SECTION */}
        {currentStudy && (
          <div ref={heroRef} className="h-[150vh] w-full relative z-20">
            <motion.div
              className="sticky top-0 w-full h-screen flex flex-col justify-start items-center overflow-hidden"
              style={{ paddingTop, paddingLeft: paddingX, paddingRight: paddingX }}
            >
              <motion.div
                className="w-full relative overflow-hidden flex items-center justify-center mx-auto bg-black"
                style={{
                  height,
                  borderRadius,
                }}
              >
                {'bannerVideo' in currentStudy && currentStudy.bannerVideo ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <iframe
                      ref={iframeRef}
                      src={`https://player.vimeo.com/video/${currentStudy.bannerVideo}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: '100vw',
                        height: '56.25vw',
                        minHeight: '100vh',
                        minWidth: '177.77vh'
                      }}
                    ></iframe>
                  </div>
                ) : (
                  <img
                    src={'bannerImage' in currentStudy && currentStudy.bannerImage ? currentStudy.bannerImage : currentStudy.image}
                    alt={currentStudy.title}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                )}
                <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-black pointer-events-none" />

                <motion.div
                  style={{ scale: textScale, y: textY, opacity: textOpacity }}
                  className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl w-full"
                >
                  <h1 style={{ fontFamily: '"Domaine Text", serif', letterSpacing: 'normal', fontWeight: 700, lineHeight: 1.1 }} className="text-4xl md:text-6xl lg:text-7xl mb-6 text-white drop-shadow-2xl">
                    {currentStudy.title}
                  </h1>
                  <p className="text-white/90 text-xl md:text-2xl drop-shadow-lg font-light" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                    {currentStudy.description}
                  </p>

                  {/* Persuasive Line Group */}
                  <motion.div
                    animate={{ opacity: hasScrolledDown ? 0 : 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute top-full left-0 w-full mt-10 flex flex-col items-center pointer-events-none text-white/90"
                  >
                    {/* Vertical Line */}
                    <motion.div className="w-[2.5px] bg-current relative z-10"
                      initial={{ height: '0vh' }}
                      animate={{ height: '20vh' }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                    />

                    {/* Asterisk Cross */}
                    <div className="relative w-full flex justify-center mt-[-22px]">
                      <motion.svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2.5"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 1.2 }}
                      >
                        <line x1="6" y1="6" x2="38" y2="38"></line>
                        <line x1="38" y1="6" x2="6" y2="38"></line>
                      </motion.svg>
                    </div>

                    {/* Scroll to view text */}
                    <motion.div
                      className="mt-4 text-[11px] uppercase tracking-widest font-bold"
                      style={{ fontFamily: '"American Grotesk", sans-serif' }}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 1.4 }}
                    >
                      Scroll to read
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* MAIN CONTENT SECTION */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 -mt-[calc(40vh-14rem)] pb-32">

          {currentStudy && (
            <div className="mb-16">

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg p-6 bg-white/5 backdrop-blur-sm">
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Role</p>
                    <p className="text-white font-medium">{currentStudy.role}</p>
                  </div>
                  <div className="rounded-lg p-6 bg-white/5 backdrop-blur-sm flex-1">
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Team</p>
                    {currentStudy.team && currentStudy.team.length > 0 ? (
                      <ul className="text-white font-medium list-disc list-outside pl-4">
                        {currentStudy.team.map((member, idx) => (
                          <li key={idx}>{member}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-white font-medium">—</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className={`rounded-lg p-6 backdrop-blur-sm flex flex-col ${currentStudy.id === 2 ? 'bg-white/10' : 'bg-white/5'}`}>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-bold">
                      {currentStudy.id === 2 ? "My contributions" : "Advisors"}
                    </p>
                    {'contributions' in currentStudy && currentStudy.contributions ? (
                      <ul className="text-white font-medium list-disc list-outside pl-4">
                        {(currentStudy.contributions as string[]).map((contrib, i) => (
                          <li key={i}>{contrib}</li>
                        ))}
                      </ul>
                    ) : currentStudy.advisors && currentStudy.advisors.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {currentStudy.advisors.map((advisor, i) => (
                          <div key={i}>
                            <p className="text-white font-medium">{advisor.name}</p>
                            <p className="text-white/50 text-sm mt-0.5">{advisor.title}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white font-medium">—</p>
                    )}
                  </div>
                  {currentStudy && 'timeline' in currentStudy && currentStudy.timeline && (
                    <div className="rounded-lg p-6 bg-white/5 backdrop-blur-sm flex-1 flex flex-col">
                      <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-bold">Timeline</p>
                      <p className="text-white text-3xl font-bold tracking-tight" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                        {currentStudy.timeline as string}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile TOC dropdown */}
          {headings.length > 0 && (
            <div className="xl:hidden mb-10 rounded-lg bg-white/5 backdrop-blur-sm overflow-hidden" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
              <button
                onClick={() => setTocOpen(o => !o)}
                className="w-full flex justify-between items-center px-5 py-4 text-white/60 hover:text-white text-sm uppercase tracking-widest transition-colors"
              >
                <span>On this page</span>
                <span className={`transition-transform duration-200 ${tocOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {tocOpen && (
                <div className="px-5 pb-5 border-t border-white/10 pt-4">
                  <TocLinks />
                </div>
              )}
            </div>
          )}

          {/* Main layout: sticky left TOC + content */}
          <div className="flex gap-12 items-start" ref={contentRef}>

            {/* Sticky desktop TOC — left side */}
            {headings.length > 0 && (
              <aside className="hidden xl:block w-72 shrink-0 sticky top-32 self-start">
                <p
                  className="text-white/40 text-xs uppercase tracking-widest mb-4 pl-2 font-bold"
                  style={{ fontFamily: '"American Grotesk", sans-serif' }}
                >
                  On this page
                </p>
                <div className="rounded-2xl p-6 bg-white/5 backdrop-blur-sm shadow-2xl">
                  <TocLinks />
                </div>
              </aside>
            )}

            {/* Article */}
            <div
              className="flex-1 min-w-0 prose prose-invert prose-lg max-w-none prose-a:text-white prose-a:underline hover:prose-a:text-white/80"
              style={{ fontFamily: '"American Grotesk", sans-serif', fontWeight: 300 }}
            >
              <style>{`
              .prose h1, .prose h2, .prose h3, .prose h4 { 
                font-family: "Domaine Text", serif !important; 
                font-weight: 700 !important;
                letter-spacing: normal !important;
                line-height: 1.1 !important;
                color: white !important;
              }
              
              /* Section Headers (H2) */
              .prose h2 { 
                font-size: 2.75rem !important; 
                margin-top: 10rem !important; 
                margin-bottom: 1.75rem !important; 
                padding-bottom: 1rem !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              }

              /* First Section Header */
              .prose h2:first-of-type {
                margin-top: 2rem !important; /* You can adjust this value for the first header */
              }
              
              .prose h2.h2-subtitle-mode {
                border-bottom: none !important;
                padding-bottom: 0 !important;
                margin-bottom: 0.5rem !important;
              }
              
              /* Sub-headers (H3) */
              .prose h3 { 
                font-size: 2rem !important; 
                margin-top: 3.5rem !important; 
                margin-bottom: 1.5rem !important; 
                color: var(--accent) !important;
              }
              
              /* Standard paragraph styling */
              .prose p { 
                text-align: left !important;
                color: rgba(255, 255, 255, 0.7) !important; 
                font-size: clamp(16px, 2vw, 20px) !important;
                line-height: 1.9 !important; 
                font-family: "American Grotesk", sans-serif !important; 
                font-weight: 300 !important; 
                margin-bottom: 2rem !important;
              }

              /* Lists */
              .prose ul, .prose ol {
                color: rgba(255, 255, 255, 0.7) !important; 
                font-size: clamp(16px, 2vw, 20px) !important;
                line-height: 1.9 !important; 
                font-family: "American Grotesk", sans-serif !important; 
                font-weight: 300 !important; 
                margin-bottom: 2.5rem !important;
              }
              .prose li {
                margin-bottom: 0.75rem !important;
              }
              .prose li::marker {
                color: rgba(255, 255, 255, 0.4) !important;
              }

              /* Bold text */
              .prose strong {
                color: white !important;
                font-weight: 500 !important;
              }

              /* Blockquotes */
              .prose blockquote {
                border-left: none !important;
                padding-left: 0 !important;
                margin-top: 3.5rem !important;
                margin-bottom: 3.5rem !important;
              }
              .prose blockquote p {
                border-left: 3px solid var(--accent) !important;
                padding-left: 1.5rem !important;
                font-size: 1.125rem !important;
                line-height: 1.6 !important;
                font-style: italic !important;
                color: var(--accent) !important;
                margin-bottom: 0 !important;
              }
              
              /* Style the author attribution if it's separated by a blank line */
              .prose blockquote p:last-of-type:not(:first-of-type) {
                border-left: none !important;
                padding-left: 0 !important;
                font-style: normal !important;
                font-family: "American Grotesk", sans-serif !important;
                margin-top: 1rem !important;
                text-align: right !important;
              }

              /* Disable Tailwind Typography's default auto-quotes */
              .prose blockquote p::before,
              .prose blockquote p::after {
                content: none !important;
              }

              /* Center standalone captions */
              .prose p:has(> em:only-child) {
                text-align: center !important;
                font-size: 0.875rem !important;
                color: rgba(255, 255, 255, 0.4) !important;
                margin-top: -2rem !important;
                margin-bottom: 2.5rem !important;
              }

              /* Center images and stack inline captions vertically */
              .prose p:has(figure) {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                width: 100% !important;
                margin-bottom: 0 !important;
              }

              /* Style inline captions that share a paragraph with an image */
              .prose p:has(figure) > em {
                text-align: center !important;
                font-size: 0.875rem !important;
                color: rgba(255, 255, 255, 0.4) !important;
                margin-top: -1.5rem !important; /* Overlap the figure's bottom margin */
                margin-bottom: 2.5rem !important;
                font-style: italic !important;
              }
            `}</style>
              <LightboxContext.Provider value={openLightbox}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ...headingComponents,
                    img: ImageRenderer as never,
                    pre: ({ children, ...props }: any) => {
                      const childArray = Array.isArray(children) ? children : [children];
                      if (childArray.some((c: any) => {
                        const cls = c?.props?.className || '';
                        return cls.includes('language-stats') || cls.includes('language-insights') || cls.includes('language-quotes') || cls.includes('language-button') || cls.includes('language-hmw') || cls.includes('language-recruiter') || cls.includes('language-3d-model');
                      })) {
                        return <>{children}</>;
                      }
                      return <pre {...props}>{children}</pre>;
                    },
                    code: ({ node, className, children, ...props }: any) => {
                      const match = /language-([\w-]+)/.exec(className || '');

                      if (match && match[1] === 'hmw') {
                        const lines = String(children).trim().split('\n').filter(Boolean);
                        return (
                          <div className="flex flex-wrap justify-center gap-6 my-12 not-prose">
                            {lines.map((line, i) => (
                              <div key={i} className="flex flex-col p-8 rounded-2xl bg-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden w-full md:w-[calc(50%-0.75rem)] max-w-md">
                                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: 'var(--accent)' }}></div>
                                <div className="text-[var(--accent)] font-bold text-xl mb-4 tracking-widest" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                                  0{i + 1}
                                </div>
                                <div className="text-white/90 text-[20px] leading-relaxed font-light" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                                  {line}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      if (match && match[1] === 'button') {
                        const text = String(children).trim();
                        const parts = text.split('|').map(s => s.trim());
                        const [label, url, iconName] = parts;
                        // @ts-ignore
                        const IconComponent = (iconName && LucideIcons[iconName]) ? LucideIcons[iconName] : LucideIcons.ExternalLink;

                        return (
                          <div className="not-prose flex w-full justify-center my-8">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-transform duration-300 no-underline w-fit group shadow-xl hover:scale-105"
                              style={{ backgroundColor: 'var(--accent)' }}
                            >
                              <span className="text-black font-semibold tracking-wide text-lg" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                                {label}
                              </span>
                              <IconComponent size={20} className="text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                          </div>
                        );
                      }

                      if (match && match[1] === 'stats') {
                        const lines = String(children).trim().split('\n').filter(Boolean);
                        return (
                          <div className="flex flex-wrap justify-center gap-6 my-12 not-prose">
                            {lines.map((line, i) => {
                              const parts = line.split('|').map(s => s.trim());
                              if (parts.length < 2) return null;
                              const [number, label, iconName] = parts;

                              // @ts-ignore - Dynamic icon lookup
                              const IconComponent = (iconName && LucideIcons[iconName]) ? LucideIcons[iconName] : LucideIcons.Activity;

                              return (
                                <div key={i} className="flex flex-col p-8 rounded-2xl bg-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden w-full sm:w-auto max-w-full" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                    <IconComponent size={120} strokeWidth={1} style={{ color: 'var(--accent)', transform: 'translate(20%, -20%)' }} />
                                  </div>
                                  <div className="mb-8 text-white/80 relative z-10" style={{ color: 'var(--accent)' }}>
                                    <IconComponent size={32} strokeWidth={1.5} />
                                  </div>
                                  <div className="mt-auto relative z-10">
                                    <div style={{ fontFamily: '"Domaine Text", serif', letterSpacing: 'normal', fontWeight: 700, lineHeight: 1 }} className="text-7xl text-white mb-3">
                                      {number}
                                    </div>
                                    <div className="text-white/60 text-sm font-medium tracking-wide leading-snug">
                                      {label}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      if (match && match[1] === 'quotes') {
                        const lines = String(children).trim().split('\n').filter(Boolean);
                        return <QuoteCarousel lines={lines} />;
                      }

                      if (match && match[1] === 'insights') {
                        const lines = String(children).trim().split('\n').filter(Boolean);
                        return (
                          <div className="flex flex-col gap-4 my-12 not-prose">
                            {lines.map((line, i) => {
                              const parts = line.split('|').map(s => s.trim());
                              if (parts.length < 2) return null;

                              let title, description, iconName;
                              if (parts.length >= 3) {
                                title = parts[0];
                                description = parts[1];
                                iconName = parts[2];
                              } else {
                                description = parts[0];
                                iconName = parts[1];
                              }

                              // @ts-ignore
                              const IconComponent = (iconName && LucideIcons[iconName]) ? LucideIcons[iconName] : LucideIcons.Lightbulb;

                              return (
                                <div key={i} className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-sm shadow-xl items-start sm:items-center" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                                  <div className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-white/10" style={{ color: 'var(--accent)' }}>
                                    <IconComponent size={28} strokeWidth={1.5} />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {title && (
                                      <div style={{ fontFamily: '"Domaine Text", serif', letterSpacing: 'normal', fontWeight: 700 }} className="text-2xl text-white leading-tight">
                                        {title}
                                      </div>
                                    )}
                                    <div className="text-white/70 text-lg leading-relaxed font-light">
                                      {description}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      if (match && match[1] === 'recruiter') {
                        const lines = String(children).trim().split('\n').filter(Boolean);
                        return (
                          <div className="flex flex-col gap-6 my-16 not-prose items-center text-center">
                            {lines.map((line, i) => {
                              const parts = line.split('|').map(s => s.trim());
                              if (parts.length < 2) return null;

                              let title, description, iconName;
                              if (parts.length >= 3) {
                                title = parts[0];
                                description = parts[1];
                                iconName = parts[2];
                              } else {
                                description = parts[0];
                                iconName = parts[1];
                              }

                              // @ts-ignore
                              const IconComponent = (iconName && LucideIcons[iconName]) ? LucideIcons[iconName] : LucideIcons.Lightbulb;

                              return (
                                <div key={i} className="flex flex-col items-center gap-6 max-w-3xl mx-auto" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                                  <div className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-white/5" style={{ color: 'var(--accent)' }}>
                                    <IconComponent size={32} strokeWidth={1.5} />
                                  </div>
                                  <div className="flex flex-col gap-4">
                                    {title && (
                                      <div style={{ fontFamily: '"Domaine Text", serif', letterSpacing: 'normal', fontWeight: 700 }} className="text-3xl text-white leading-tight">
                                        {title}
                                      </div>
                                    )}
                                    <div className="text-white/70 text-xl leading-relaxed font-light">
                                      {description}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      if (match && match[1] === '3d-model') {
                        const url = String(children).trim();
                        return <ModelViewer url={url} darkColor={darkColor} />;
                      }

                      const text = String(children);
                      if (!match && text.startsWith('==') && text.endsWith('==')) {
                        return <span className="highlight-text" style={{ color: 'var(--accent)', fontWeight: 400 }}>{text.slice(2, -2)}</span>;
                      }
                      return <code className={className} {...props}>{children}</code>;
                    }
                  }}
                >
                  {markdown.replace(/==([^=]+)==/g, '`==$1==`')}
                </ReactMarkdown>
              </LightboxContext.Provider>
            </div>

          </div>

          {/* Showcase Video */}
          {currentStudy && 'showcaseVideo' in currentStudy && currentStudy.showcaseVideo && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mb-20 mt-20 relative group"
            >
              <div className="absolute -inset-4 bg-white/10 blur-2xl rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
                {!isPlayingShowcase ? (
                  <div
                    className="absolute inset-0 w-full h-full cursor-pointer group/play"
                    onClick={() => setIsPlayingShowcase(true)}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${currentStudy.showcaseVideo}/maxresdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover opacity-80 group-hover/play:opacity-100 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover/play:scale-110 group-hover/play:bg-white/20 transition-all duration-300">
                        <svg className="w-8 h-8 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={`https://www.youtube.com/embed/${currentStudy.showcaseVideo as string}?rel=0&color=white&autoplay=1`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* More Case Studies */}
          <div className="mt-32 pt-16 border-t border-white/10">
            <h2 style={{ fontFamily: '"Domaine Text", serif', letterSpacing: 'normal', fontWeight: 700 }} className="text-4xl mb-12">
              More Case Studies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherStudies.map((study) => (
                <Link to={`/case-study/${study.id}`} key={study.id} className="block">
                  <CaseStudyCard study={study} darkColor={darkColor} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-8 text-white/50 hover:text-white text-3xl leading-none transition-colors"
            style={{ fontFamily: 'monospace' }}
          >
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}
          />
          {lightbox.alt && (
            <p
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/40 italic text-center"
              style={{ fontFamily: '"American Grotesk", sans-serif' }}
            >
              {lightbox.alt}
            </p>
          )}
        </div>
      )}
    </>
  );
}
