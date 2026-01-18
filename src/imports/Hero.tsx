'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Pause, Play } from 'lucide-react';

export default function Hero() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const { scrollY } = useScroll();

  // Parallax effects
  const textY = useTransform(scrollY, [0, 500], [0, 200]);
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const indicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(true);
    }, 3000); // 3 second delay
    return () => clearTimeout(timer);
  }, []);

  const togglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    if (videoRef.current?.contentWindow) {
      videoRef.current.contentWindow.postMessage(
        JSON.stringify({ method: newPausedState ? 'pause' : 'play' }),
        '*'
      );
    }
  };

  const handleScrollClick = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full max-w-[1308px] h-screen min-h-[600px] mx-auto overflow-hidden bg-[#1a1f28]" data-name="Hero">

      {/* Video Background Container */}
      <div className="absolute inset-0 z-[1] opacity-60 pointer-events-none overflow-hidden">
        <iframe
          ref={videoRef}
          src="https://player.vimeo.com/video/1146938977?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&controls=0&api=1"
          className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1]"
          style={{
            width: '100vw',
            height: '56.25vw',
            minHeight: '100vh',
            minWidth: '177.77vh',
            filter: ' brightness(0.7) contrast(1.1) '
          }}
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Hero Background Video"
        />

        <div className={`absolute inset-0 z-[20] pointer-events-none transition-opacity duration-[2000ms] bg-[#1a1f28] ${showScrollIndicator ? 'opacity-0' : 'opacity-100'}`} />
      </div>


      {/* Text Overlay */}
      <motion.div
        className="absolute top-[40px] md:top-[48px] left-6 md:left-[48px] z-[15] pointer-events-none"
        style={{ y: textY, opacity: textOpacity }}
      >
        <motion.p
          className="font-['Greycliff_CF:Light',sans-serif] leading-[1.32] not-italic text-[#ecf1f8] text-3xl md:text-[48px] whitespace-pre"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <span>{`Hey! `}</span>
          <span className="font-['Greycliff_CF:Regular',sans-serif]">I'm</span>
          <span className="font-['Greycliff_CF:Extra_Bold',sans-serif]">{` Caleb Aguiar`}</span>
        </motion.p>

        <motion.div
          className="mt-4 md:mt-0 font-['Greycliff_CF:Regular',sans-serif] leading-[1.32] not-italic text-[#ecf1f8] text-lg md:text-[24px] text-left whitespace-nowrap whitespace-pre"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5, ease: 'easeOut' }}
        >
          <p className="mb-0">{`Most people design tools. `}</p>
          <p>I design experiences that inspire.</p>
        </motion.div>
      </motion.div>

      {/* Animation Control Button */}
      <button
        onClick={togglePause}
        className="absolute bottom-6 right-6 z-[20] p-2 rounded-full border border-[#4a5a6a] text-[#4a5a6a] hover:text-[#ecf1f8] hover:border-[#ecf1f8] hover:bg-[#1a1f28]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#ecf1f8]/50"
        aria-label={isPaused ? "Resume animation" : "Pause animation"}
      >
        {isPaused ? <Play size={16} /> : <Pause size={16} />}
      </button>

      {/* Tech/ASCII Scroll Indicator */}
      <motion.div
        className="fixed left-1/2 -translate-x-1/2 bottom-[40px] flex flex-col items-center gap-1 z-[15] cursor-pointer w-full text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollIndicator ? 1 : 0 }}
        style={{ opacity: indicatorOpacity }}
        transition={{ duration: 1, ease: 'easeOut' }}
        onClick={handleScrollClick}
      >
        <div className="font-mono text-[#ecf1f8] text-[12px] opacity-60 tracking-widest uppercase">
          {`[ scroll_to_explore ]`}
        </div>
        <motion.div
          className="font-mono text-[#ecf1f8] text-[14px] leading-tight"
          animate={{ y: [0, 4, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="opacity-60">\/</div>
        </motion.div>
      </motion.div>
    </div>
  );
}