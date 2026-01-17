import { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Hero from './imports/Hero';
import Header from './imports/Header';
import Footer from './components/Footer';
import WIPSection from './components/WIPSection';

export default function App() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:8',message:'App component mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const [activePage, setActivePage] = useState('Home');
  const isManualScroll = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:16',message:'Initializing Lenis',data:{lenisAvailable:typeof Lenis!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      const lenis = new Lenis({
      duration: .5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:25',message:'Lenis initialized successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c151f05b-a538-424c-9049-a1574483a577',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:35',message:'Lenis initialization failed',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'setup',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('Failed to initialize Lenis:', error);
    }
  }, []);

  // Scroll Spy to update activePage based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Skip updating active state if a manual scroll transition is happening
      if (isManualScroll.current) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      if (scrollPosition < windowHeight * 0.5) {
        setActivePage('Home');
      } else {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          const rect = aboutSection.getBoundingClientRect();
          if (rect.top < windowHeight * 0.5) {
            setActivePage('About');
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleHeaderNav = (page: string) => {
    setActivePage(page);
    isManualScroll.current = true;

    // Re-enable scroll spy after transition (approx 1.5s)
    setTimeout(() => {
      isManualScroll.current = false;
    }, 1500);

    if (page === 'Home') {
      lenisRef.current?.scrollTo(0, { duration: 1.5 });
    } else if (page === 'About') {
      lenisRef.current?.scrollTo('#about', { duration: 1.5 });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1a1f28] scroll-smooth">
      {/* 
        Main centered column with shadow and background color 
        The shadow separates this content column from the main white page background 
      */}
      <div className="relative w-full max-w-[1308px] mx-auto bg-[#ecf1f8] shadow-[0_0_80px_-10px_rgba(26,31,40,0.15)]">

        {/* Sticky Header inside the constrained container */}
        <div className="sticky top-0 z-50">
          <Header activePage={activePage} onPageChange={handleHeaderNav} />
        </div>

        <Hero />

        <WIPSection />

      </div>
      <Footer />
    </div>
  );
}