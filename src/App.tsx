import { useState, useCallback, useEffect } from 'react';
import Lenis from 'lenis';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HomePage } from './pages/HomePage';
import { CaseStudyPage } from './pages/CaseStudyPage';
import { Footer } from './components/Footer';

function AnimatedRoutes({ darkColor, handleDarkColorChange }: { darkColor: string, handleDarkColorChange: (color: string) => void }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <HomePage darkColor={darkColor} onDarkColorChange={handleDarkColorChange} />
            </motion.div>
          }
        />
        <Route
          path="/case-study/:id"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CaseStudyPage darkColor={darkColor} />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [darkColor, setDarkColor] = useState('#020510');
  const handleDarkColorChange = useCallback((color: string) => {
    setDarkColor(color);
  }, []);

  // Sync darkColor to <html> so Safari's overscroll area stays immersive
  useEffect(() => {
    document.documentElement.style.backgroundColor = darkColor;
    document.body.style.backgroundColor = darkColor;
  }, [darkColor]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: .6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <div
        className="w-full min-h-screen flex flex-col"
        style={{ backgroundColor: darkColor, transition: 'background-color 0.6s ease' }}
      >
        <div className="flex-1">
          <AnimatedRoutes darkColor={darkColor} handleDarkColorChange={handleDarkColorChange} />
        </div>
        <Footer darkColor={darkColor} />
      </div>
    </Router>
  );
}
