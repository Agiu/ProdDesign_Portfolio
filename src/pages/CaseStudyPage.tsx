import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { caseStudies, CaseStudyCard } from '../components/case-studies';

// @ts-ignore
const mdModules = import.meta.glob('../content/case-studies/*.md', { query: '?raw', import: 'default' });

interface Heading { id: string; text: string; level: number; }

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseHeadings(md: string): Heading[] {
  return md.split('\n')
    .filter(line => /^#{2,3}\s/.test(line))
    .map(line => {
      const level = line.match(/^(#{2,3})/)?.[1].length ?? 2;
      const text = line.replace(/^#{2,3}\s+/, '').trim();
      return { id: slugify(text), text, level };
    });
}

// Custom heading renderers that inject id attributes
function makeHeadingComponents() {
  const H2 = ({ children }: { children?: React.ReactNode }) => {
    const text = String(children);
    return <h2 id={slugify(text)}>{children}</h2>;
  };
  const H3 = ({ children }: { children?: React.ReactNode }) => {
    const text = String(children);
    return <h3 id={slugify(text)}>{children}</h3>;
  };
  return { h2: H2, h3: H3 };
}

const headingComponents = makeHeadingComponents();

interface CaseStudyPageProps { darkColor: string; }

export function CaseStudyPage({ darkColor }: CaseStudyPageProps) {
  const { id } = useParams<{ id: string }>();
  const [markdown, setMarkdown] = useState<string>('');
  const [activeId, setActiveId] = useState<string>('');
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
    <nav style={{ fontFamily: '"American Grotesk", sans-serif' }}>
      {headings.map(h => (
        <button
          key={h.id}
          onClick={() => scrollTo(h.id)}
          className={`block w-full text-left text-sm transition-colors duration-150 py-1 hover:text-white
            ${h.level === 3 ? 'pl-3' : ''}
            ${activeId === h.id ? 'text-white' : 'text-white/35'}
          `}
        >
          {h.text}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="w-full min-h-screen text-white pt-24 pb-32" style={{ backgroundColor: darkColor, transition: 'background-color 0.6s ease' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link to="/" className="inline-block text-white/50 hover:text-white mb-12 transition-colors uppercase text-sm tracking-widest" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
          ← Back Home
        </Link>

        {currentStudy && (
          <div className="mb-16">
            <h1 style={{ fontFamily: '"Domaine Display", serif', fontWeight: 700, lineHeight: 1.1 }} className="text-5xl md:text-7xl mb-6 text-center">
              {currentStudy.title}
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 text-center" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
              {currentStudy.description}
            </p>

            {/* Header Image */}
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-12">
              <img src={currentStudy.image} alt={currentStudy.title} className="w-full h-full object-cover" />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
              <div className="flex flex-col gap-4">
                <div className="rounded-lg p-6 bg-white/5 backdrop-blur-sm">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Role</p>
                  <p className="text-white font-medium">{currentStudy.role}</p>
                </div>
                <div className="rounded-lg p-6 bg-white/5 backdrop-blur-sm">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-bold">Team</p>
                  <p className="text-white font-medium">{currentStudy.team?.join(", ")}</p>
                </div>
              </div>
              <div className="rounded-lg p-6 bg-white/5 backdrop-blur-sm flex flex-col">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-bold">Advisors</p>
                {currentStudy.advisors && currentStudy.advisors.length > 0 ? (
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
            <aside className="hidden xl:block w-48 shrink-0 sticky top-28 self-start pt-12">
              <p
                className="text-white/30 text-xs uppercase tracking-widest mb-3"
                style={{ fontFamily: '"American Grotesk", sans-serif' }}
              >
                On this page
              </p>
              <TocLinks />
            </aside>
          )}

          {/* Article */}
          <div
            className="flex-1 min-w-0 prose prose-invert prose-lg max-w-none prose-a:text-white prose-a:underline hover:prose-a:text-white/80"
            style={{ fontFamily: '"American Grotesk", sans-serif', fontWeight: 300 }}
          >
            <style>{`
              .prose h1, .prose h2, .prose h3, .prose h4 { 
                font-family: "Domaine Display", serif !important; 
                font-weight: 700 !important;
                letter-spacing: normal !important;
                line-height: 1.1 !important;
                color: white !important;
              }
              .prose h2 { font-size: 2.5rem !important; margin-top: 3rem !important; margin-bottom: 1.5rem !important; }
              .prose h3 { font-size: 2rem !important; margin-top: 2.5rem !important; margin-bottom: 1.25rem !important; }
              .prose p { color: rgba(255, 255, 255, 0.7) !important; line-height: 1.8 !important; font-family: "American Grotesk", sans-serif !important; font-weight: 300 !important; }
            `}</style>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={headingComponents as never}>
              {markdown}
            </ReactMarkdown>
          </div>

        </div>

        {/* More Case Studies */}
        <div className="mt-32 pt-16 border-t border-white/10">
          <h2 style={{ fontFamily: '"Domaine Display", serif', fontWeight: 700 }} className="text-4xl mb-12">
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
  );
}
