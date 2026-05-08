import { Link } from 'react-router-dom';
import { getBrightAccent } from './case-studies';

interface AboutProps {
    darkColor?: string;
}

export function About({ darkColor = '#020510' }: AboutProps) {
    const brightAccent = getBrightAccent(darkColor);

    return (
        <section
            className="relative w-full"
            style={{
                backgroundColor: darkColor,
                transition: 'background-color 0.6s ease',
            }}
        >
            <div className="relative w-full h-full px-6 md:pl-10 md:pr-4 lg:px-12 py-20 md:py-28">
                <div className="w-full">
                    {/* Two-column layout similar to Case Studies */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        {/* Left column: Title */}
                        <div className="lg:col-span-4 self-start">
                            <div>
                                <h2
                                    className="text-white"
                                    style={{
                                        fontFamily: '"Domaine Display", serif',
                                        fontSize: "clamp(2.8rem, 4vw, 8rem)",
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                    }}
                                >
                                    ABOUT
                                </h2>
                            </div>
                        </div>

                        {/* Right column: Content */}
                        <div className="lg:col-span-8 flex flex-col justify-center">
                            <p
                                className="text-white/90 max-w-3xl leading-relaxed"
                                style={{ fontFamily: '"American Grotesk", sans-serif', fontSize: 'clamp(18px, 2.5vw, 24px)' }}
                            >
                                My name is Caleb Aguiar (Kaelub) and I'm a UX Designer / Software Engineer with a love for aesthetic world-building. I am passionate about designing community-centric products and conveniently I'm pursuing my Masters in HCI at the University of Washington in Seattle, one of the largest video game hubs in the world.
                            </p>
                            <p
                                className="text-white/60 max-w-3xl leading-relaxed mt-8"
                                style={{ fontFamily: '"American Grotesk", sans-serif', fontSize: 'clamp(16px, 2vw, 20px)' }}
                            >
                                My work explores the intersection of creative brand identity, deep interaction design, and technical prototyping. I love bringing speculative ideas to life through robust, aesthetic, and highly-functional modern applications. I'm currently looking for work and open to freelance opportunities.
                            </p>

                            <div className="mt-12 pt-8 border-t border-white/10 max-w-3xl">
                                <h3
                                    className="text-white/80 uppercase tracking-widest text-sm mb-4"
                                    style={{ fontFamily: '"American Grotesk", sans-serif' }}
                                >
                                    Experimental Work
                                </h3>
                                <p
                                    className="text-white/60 leading-relaxed mb-6"
                                    style={{ fontFamily: '"American Grotesk", sans-serif', fontSize: 'clamp(15px, 1.8vw, 18px)' }}
                                >
                                    Beyond product design, I spend time exploring videography, 3D motion, and short films to tell compelling visual stories.
                                </p>
                                <Link
                                    to="/video-portfolio"
                                    className="inline-flex items-center text-sm uppercase tracking-wider transition-colors group text-[color:var(--accent)] hover:text-white"
                                    style={{ 
                                      fontFamily: '"American Grotesk", sans-serif',
                                      '--accent': brightAccent
                                    } as React.CSSProperties}
                                >
                                    <span className="border-b border-current pb-1 transition-colors">Video Portfolio</span>
                                    <svg className="w-4 h-4 ml-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
