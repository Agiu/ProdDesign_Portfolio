import { useState, useCallback, useEffect } from 'react';
import Lenis from 'lenis';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CaseStudyPage } from './pages/CaseStudyPage';
import { Footer } from './components/Footer';

export default function App() {
  const [darkColor, setDarkColor] = useState('#020510');
  const handleDarkColorChange = useCallback((color: string) => {
    setDarkColor(color);
  }, []);

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
      <div className="w-full min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage darkColor={darkColor} onDarkColorChange={handleDarkColorChange} />} />
            <Route path="/case-study/:id" element={<CaseStudyPage darkColor={darkColor} />} />
          </Routes>
        </div>
        <Footer darkColor={darkColor} />
      </div>
    </Router>
  );
}
