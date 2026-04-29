import { useState } from 'react';

interface AboutProps {
    darkColor?: string;
}

export function About({ darkColor = '#020510' }: AboutProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <section
            className="relative w-full"
            style={{
                backgroundColor: darkColor,
                transition: 'background-color 0.6s ease',
            }}
        >
            <div className="relative w-full h-full px-6 md:pl-10 md:pr-4 lg:px-12 py-20 pb-0 md:py-28 md:pb-0">
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
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center text-white text-sm uppercase tracking-wider hover:text-white/70 transition-colors"
                                    style={{ fontFamily: '"American Grotesk", sans-serif' }}
                                >
                                    <span className="border-b border-white/30 pb-1">View Video Portfolio</span>
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#0f0f0f] border border-white/10 p-8 max-w-sm w-full relative" style={{ borderRadius: 20 }}>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="text-xl text-white mb-3" style={{ fontFamily: '"Domaine Display", serif' }}>Under Construction</h3>
                        <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: '"American Grotesk", sans-serif' }}>
                            Oops, this link is still being built. Come back next time!
                        </p>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-6 w-full py-2.5 bg-white text-black text-sm uppercase tracking-wider font-semibold hover:bg-white/90 transition-colors"
                            style={{ fontFamily: '"American Grotesk", sans-serif', borderRadius: 10 }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
