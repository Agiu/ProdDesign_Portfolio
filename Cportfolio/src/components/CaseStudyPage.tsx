import { useState, useEffect } from 'react';

interface CaseStudyPageProps {
  studyId: number;
  onBack: () => void;
}

export default function CaseStudyPage({ studyId, onBack }: CaseStudyPageProps) {
  const [activeSection, setActiveSection] = useState('overview');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [studyId]);

  const sections = [
    { id: 'overview', label: 'Overview', icon: '01' },
    { id: 'challenge', label: 'Challenge', icon: '02' },
    { id: 'solution', label: 'Solution', icon: '03' },
    { id: 'design', label: 'Design Process', icon: '04' },
    { id: 'development', label: 'Development', icon: '05' },
    { id: 'results', label: 'Results', icon: '06' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Back button */}
      <div className="w-[1308px] mx-auto pt-8 px-12">
        <button
          onClick={onBack}
          className="font-mono text-[12px] text-[#4a5a6a] hover:text-[#1a1f28] transition-colors flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>BACK_TO_HOME</span>
        </button>
      </div>

      {/* Main content with side navigation */}
      <div className="w-[1308px] mx-auto py-12 px-12 relative">
        {/* Side Navigation */}
        <div className="fixed right-[calc((100vw-1308px)/2+48px)] top-1/2 -translate-y-1/2 z-30">
          <div className="bg-white border border-[#ccd3de] shadow-lg">
            {/* Navigation header */}
            <div className="bg-[#1a1f28] text-[#ecf1f8] px-4 py-3 font-mono text-[10px]">
              <div className="flex items-center justify-between">
                <span>NAVIGATION</span>
                <span className="text-[#4a5a6a]">[{String(studyId).padStart(2, '0')}]</span>
              </div>
            </div>

            {/* Navigation items */}
            <div className="py-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full px-4 py-3 text-left font-['Greycliff_CF:Regular',sans-serif] text-[14px] transition-colors flex items-center gap-3 group ${
                    activeSection === section.id
                      ? 'bg-[#f5f7fa] text-[#1a1f28] border-l-2 border-[#1a1f28]'
                      : 'text-[#4a5a6a] hover:bg-[#f5f7fa] hover:text-[#1a1f28]'
                  }`}
                >
                  <span className="font-mono text-[10px]">{section.icon}</span>
                  <span>{section.label}</span>
                  {activeSection === section.id && (
                    <span className="ml-auto font-mono text-[10px]">▸</span>
                  )}
                </button>
              ))}
            </div>

            {/* Navigation footer */}
            <div className="border-t border-[#ccd3de] px-4 py-2 font-mono text-[8px] text-[#4a5a6a]">
              SCROLL: {Math.round(window.scrollY)}px
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[900px]">
          {/* Hero section for case study */}
          <div className="mb-24 relative">
            {/* ASCII corner decoration */}
            <div className="absolute -top-6 -left-6 font-mono text-[#4a5a6a] text-[10px] leading-none">
              ┌─ CASE_STUDY_{String(studyId).padStart(2, '0')} ─┐
            </div>

            <h1 className="font-['Greycliff_CF:Bold',sans-serif] text-[72px] text-[#1a1f28] mb-4">
              Case Study {studyId}
            </h1>

            {/* Metadata */}
            <div className="flex gap-8 font-mono text-[12px] text-[#4a5a6a] mb-8">
              <div>
                <span className="text-[#1a1f28]">ROLE:</span> Lead Designer
              </div>
              <div>
                <span className="text-[#1a1f28]">YEAR:</span> 2024
              </div>
              <div>
                <span className="text-[#1a1f28]">STACK:</span> React, TypeScript
              </div>
            </div>

            {/* Divider */}
            <div className="font-mono text-[10px] text-[#4a5a6a] mb-8">
              ├─────────────────────────────────────────────────────────┤
            </div>

            <p className="font-['Greycliff_CF:Regular',sans-serif] text-[24px] text-[#1a1f28] leading-relaxed">
              An innovative design and development project that showcases cutting-edge solutions
              and creative problem-solving in digital product design.
            </p>
          </div>

          {/* Overview Section */}
          <section id="overview" className="mb-24 scroll-mt-24">
            <div className="relative">
              <div className="absolute -left-12 top-2 font-mono text-[10px] text-[#4a5a6a]">
                ▸
              </div>
              <h2 className="font-['Greycliff_CF:Bold',sans-serif] text-[48px] text-[#1a1f28] mb-6">
                Overview
              </h2>
            </div>

            {/* Terminal-style info box */}
            <div className="bg-[#1a1f28] text-[#ecf1f8] p-6 rounded font-mono text-[12px] mb-6">
              <div className="text-green-400 mb-2">$ cat project_overview.txt</div>
              <div className="text-[#ccd3de] leading-relaxed">
                Project initialized: 2024-01-15<br/>
                Status: Production<br/>
                Team size: 5 members<br/>
                Duration: 4 months
              </div>
            </div>

            <div className="space-y-6">
              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                This project represents a comprehensive approach to solving complex user experience
                challenges through innovative design and development practices. The goal was to create
                a seamless, intuitive interface that balances functionality with aesthetic appeal.
              </p>

              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                Working closely with stakeholders and end users, we developed a solution that not only
                meets business objectives but exceeds user expectations in terms of usability and
                engagement.
              </p>
            </div>
          </section>

          {/* Challenge Section */}
          <section id="challenge" className="mb-24 scroll-mt-24">
            <div className="relative">
              <div className="absolute -left-12 top-2 font-mono text-[10px] text-[#4a5a6a]">
                ▸
              </div>
              <h2 className="font-['Greycliff_CF:Bold',sans-serif] text-[48px] text-[#1a1f28] mb-6">
                Challenge
              </h2>
            </div>

            <div className="bg-[#f5f7fa] p-8 border-l-4 border-[#1a1f28] mb-6">
              <p className="font-['Greycliff_CF:Bold',sans-serif] text-[24px] text-[#1a1f28] mb-4">
                The Problem
              </p>
              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                Users were experiencing friction in their workflow due to outdated interfaces and
                inefficient processes. The existing solution lacked modern design patterns and
                failed to scale with growing user demands.
              </p>
            </div>

            <div className="space-y-6">
              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                Key challenges included:
              </p>

              <div className="space-y-4 pl-6">
                {['Complex information architecture requiring simplification',
                  'Performance bottlenecks affecting user experience',
                  'Accessibility concerns that needed addressing',
                  'Mobile responsiveness issues across devices'].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <span className="font-mono text-[12px] text-[#1a1f28] mt-1">
                      [{String(idx + 1).padStart(2, '0')}]
                    </span>
                    <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed flex-1">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Solution Section */}
          <section id="solution" className="mb-24 scroll-mt-24">
            <div className="relative">
              <div className="absolute -left-12 top-2 font-mono text-[10px] text-[#4a5a6a]">
                ▸
              </div>
              <h2 className="font-['Greycliff_CF:Bold',sans-serif] text-[48px] text-[#1a1f28] mb-6">
                Solution
              </h2>
            </div>

            <div className="space-y-6">
              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                We developed a comprehensive solution that addresses each challenge through strategic
                design decisions and technical implementation. Our approach focused on user-centered
                design principles and modern development practices.
              </p>

              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-6 my-12">
                {[
                  { title: 'Intuitive Navigation', desc: 'Simplified menu structure' },
                  { title: 'Performance Optimization', desc: 'Reduced load times by 60%' },
                  { title: 'Responsive Design', desc: 'Seamless across all devices' },
                  { title: 'Accessibility', desc: 'WCAG 2.1 AA compliant' }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white border border-[#ccd3de] p-6 relative group hover:border-[#1a1f28] transition-colors">
                    <div className="absolute -top-2 -left-2 bg-[#1a1f28] text-[#ecf1f8] font-mono text-[10px] px-2 py-1">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-['Greycliff_CF:Bold',sans-serif] text-[20px] text-[#1a1f28] mb-2 mt-2">
                      {feature.title}
                    </h3>
                    <p className="font-['Greycliff_CF:Regular',sans-serif] text-[14px] text-[#4a5a6a]">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Design Process Section */}
          <section id="design" className="mb-24 scroll-mt-24">
            <div className="relative">
              <div className="absolute -left-12 top-2 font-mono text-[10px] text-[#4a5a6a]">
                ▸
              </div>
              <h2 className="font-['Greycliff_CF:Bold',sans-serif] text-[48px] text-[#1a1f28] mb-6">
                Design Process
              </h2>
            </div>

            <div className="space-y-8">
              {[
                { phase: 'Research', desc: 'User interviews, competitive analysis, and data gathering' },
                { phase: 'Ideation', desc: 'Brainstorming sessions and concept development' },
                { phase: 'Prototyping', desc: 'Wireframes and interactive mockups' },
                { phase: 'Testing', desc: 'User testing and feedback iteration' }
              ].map((step, idx) => (
                <div key={idx} className="relative pl-8 pb-8 border-l-2 border-[#ccd3de] last:border-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 border-2 border-[#ccd3de] bg-white rounded-full"></div>
                  <div className="font-mono text-[12px] text-[#4a5a6a] mb-2">
                    PHASE_{String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-['Greycliff_CF:Bold',sans-serif] text-[28px] text-[#1a1f28] mb-3">
                    {step.phase}
                  </h3>
                  <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Development Section */}
          <section id="development" className="mb-24 scroll-mt-24">
            <div className="relative">
              <div className="absolute -left-12 top-2 font-mono text-[10px] text-[#4a5a6a]">
                ▸
              </div>
              <h2 className="font-['Greycliff_CF:Bold',sans-serif] text-[48px] text-[#1a1f28] mb-6">
                Development
              </h2>
            </div>

            {/* Tech stack */}
            <div className="bg-[#1a1f28] text-[#ecf1f8] p-6 rounded font-mono text-[12px] mb-8">
              <div className="text-green-400 mb-4">$ cat tech_stack.json</div>
              <div className="text-[#ccd3de] space-y-1">
                <div>  "frontend": ["React", "TypeScript", "Tailwind CSS"],</div>
                <div>  "backend": ["Node.js", "PostgreSQL"],</div>
                <div>  "tools": ["Figma", "Git", "Docker"],</div>
                <div>  "testing": ["Jest", "Cypress"]</div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                The development phase focused on building a scalable, maintainable codebase using
                modern technologies and best practices. We implemented a component-based architecture
                that allows for easy updates and extensions.
              </p>

              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                Key technical achievements include optimized bundle sizes, efficient state management,
                and comprehensive testing coverage to ensure reliability and performance.
              </p>
            </div>
          </section>

          {/* Results Section */}
          <section id="results" className="mb-24 scroll-mt-24">
            <div className="relative">
              <div className="absolute -left-12 top-2 font-mono text-[10px] text-[#4a5a6a]">
                ▸
              </div>
              <h2 className="font-['Greycliff_CF:Bold',sans-serif] text-[48px] text-[#1a1f28] mb-6">
                Results
              </h2>
            </div>

            <div className="space-y-8">
              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                The project achieved significant improvements across all key metrics and received
                positive feedback from both users and stakeholders.
              </p>

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-6 my-12">
                {[
                  { metric: '60%', label: 'Faster Load Time' },
                  { metric: '45%', label: 'Increased Engagement' },
                  { metric: '92%', label: 'User Satisfaction' }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center p-6 bg-[#f5f7fa] border border-[#ccd3de]">
                    <div className="font-['Greycliff_CF:Bold',sans-serif] text-[48px] text-[#1a1f28] mb-2">
                      {stat.metric}
                    </div>
                    <div className="font-mono text-[12px] text-[#4a5a6a]">
                      {stat.label.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>

              <p className="font-['Greycliff_CF:Regular',sans-serif] text-[18px] text-[#4a5a6a] leading-relaxed">
                The successful launch has set a new standard for the organization's digital products
                and serves as a blueprint for future projects.
              </p>
            </div>
          </section>

          {/* ASCII footer decoration */}
          <div className="border-t border-[#ccd3de] pt-8 mt-24">
            <div className="font-mono text-[10px] text-[#4a5a6a] flex justify-between items-center">
              <span>END_OF_CASE_STUDY_{String(studyId).padStart(2, '0')}</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                STATUS: COMPLETE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}