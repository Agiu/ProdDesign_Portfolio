import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { videoProjects } from '../data/video-projects';

interface VideoPortfolioPageProps {
  darkColor: string;
}

export function VideoPortfolioPage({ darkColor }: VideoPortfolioPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="w-full min-h-screen text-white bg-black pb-32"
      style={{ backgroundColor: darkColor, transition: 'background-color 0.6s ease' }}
    >
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

      {/* Hero Header */}
      <section
        className="w-full relative overflow-hidden"
        style={{
          backgroundColor: `color-mix(in srgb, ${darkColor}, white 4%)`,
          transition: 'background-color 0.6s ease',
        }}
      >
        <div className="pt-40 md:pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white drop-shadow-2xl uppercase"
            style={{
              fontFamily: '"Domaine Text", serif', letterSpacing: 'normal',
              fontSize: "clamp(3rem, 6vw, 6rem)",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Video & Multimedia
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/70 max-w-2xl mt-6 text-lg md:text-xl"
            style={{ fontFamily: '"American Grotesk", sans-serif' }}
          >
            A collection of videography, 3D motion, and short films exploring visual storytelling outside of traditional product design.
          </motion.p>
        </div>
      </section>

      {/* Gap between header and videos */}
      <div className="h-16 md:h-24 w-full" />

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {videoProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col gap-5"
            >
              {/* Video Player Container */}
              <div
                className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/5"
              >
                {project.isYouTube ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${project.vimeoId}?rel=0&color=white`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <iframe
                    src={`https://player.vimeo.com/video/${project.vimeoId}?title=0&byline=0&portrait=0`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Video Metadata */}
              <div className="flex flex-col gap-2 px-1">
                <div className="flex justify-between items-start gap-4">
                  <h3
                    className="text-white text-2xl font-bold"
                    style={{ fontFamily: '"Domaine Text", serif', letterSpacing: 'normal', lineHeight: 1.1 }}
                  >
                    {project.title}
                  </h3>
                  <span
                    className="text-white/40 uppercase tracking-widest text-[10px] md:text-xs shrink-0 pt-1"
                    style={{ fontFamily: '"American Grotesk", sans-serif' }}
                  >
                    {project.category}
                  </span>
                </div>
                <p
                  className="text-white/60 text-sm md:text-base leading-relaxed"
                  style={{ fontFamily: '"American Grotesk", sans-serif' }}
                >
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
