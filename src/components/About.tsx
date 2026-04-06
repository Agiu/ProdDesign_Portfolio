
interface AboutProps {
    darkColor?: string;
}

export function About({ darkColor = '#020510' }: AboutProps) {

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
                                I am Kaelub (Caleb Aguiar), a Product Designer specializing in "0 to 1" product design. Currently, I'm pursuing my Master of Human-Computer Interaction + Design (MHCI+D) at the University of Washington in Seattle.
                            </p>
                            <p
                                className="text-white/60 max-w-3xl leading-relaxed mt-8"
                                style={{ fontFamily: '"American Grotesk", sans-serif', fontSize: 'clamp(16px, 2vw, 20px)' }}
                            >
                                My work explores the intersection of creative brand identity, deep interaction design, and technical prototyping. I love bringing speculative ideas to life through robust, aesthetic, and highly-functional modern applications. I'm currently looking for work and open to freelance opportunities!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
