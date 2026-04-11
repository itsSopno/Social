"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

const KineticHero = () => {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

            // Initial Entrance
            tl.from(".hero-title span", {
                y: 200,
                skewY: 10,
                stagger: 0.1,
                duration: 1.5,
            })
                .from(".portal-frame", {
                    scale: 0,
                    duration: 1.5,
                    ease: "elastic.out(1, 0.75)"
                }, "-=1")
                .from(".ui-element", {
                    opacity: 0,
                    y: 20,
                    stagger: 0.1
                }, "-=0.5");

            // Floating Keycaps Animation (Continuous)
            gsap.to(".floating-item", {
                y: "random(-20, 20)",
                x: "random(-10, 10)",
                rotation: "random(-10, 10)",
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.5
            });

            // Mouse Follow Parallax for the Portal
            const handleMouseMove = (e: MouseEvent) => {
                const { clientX, clientY } = e;
                const xPos = (clientX / window.innerWidth - 0.5) * 40;
                const yPos = (clientY / window.innerHeight - 0.5) * 40;

                gsap.to(".portal-inner", {
                    x: xPos,
                    y: yPos,
                    duration: 1,
                    ease: "power2.out"
                });
            };

            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full min-h-[100vh] bg-[#FDFDFD] flex flex-col items-center justify-center overflow-hidden px-6"
        >
            {/* ── BACKGROUND OVERLAY TEXT ── */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none z-0">
                <h2 className="font-bebas text-[20vw] leading-none text-black/[0.03] uppercase select-none italic">
                    Artisan // 2026
                </h2>
            </div>

            <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* ── LEFT: DYNAMIC TYPOGRAPHY ── */}
                <div className="w-full lg:w-1/2">
                    <div className="ui-element flex items-center gap-3 mb-6">
                        <span className="h-[1px] w-12 bg-black"></span>
                        <span className="tracking-[0.3em] text-sm text-gray-400">Sinners Studio Original</span>
                    </div>

                    <h1 className="hero-title font-bebas text-[clamp(60px,10vw,140px)] leading-[0.85] text-black uppercase italic mb-8">
                        <div className="overflow-hidden h-[1.1em]"><span className="block">Ultimate</span></div>
                        <div className="overflow-hidden h-[1.1em] text-transparent [-webkit-text-stroke:1px_#000]">
                            <span className="block">Custom</span>
                        </div>
                        <div className="overflow-hidden h-[1.1em]"><span className="block">Collection</span></div>
                    </h1>

                    <div className="ui-element flex flex-wrap gap-4">
                        <button className="group relative bg-black text-[#CCFF00] px-10 py-5 font-bebas text-2xl uppercase italic transition-transform hover:scale-105 active:scale-95 overflow-hidden shadow-2xl">
                            <span className="relative z-10">Shop the Drop</span>
                            <div className="absolute inset-0 bg-[#CCFF00] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                        <button className="px-10 py-5 border border-black/10 font-bebas text-2xl uppercase italic hover:bg-black/5 transition-colors">
                            Archive
                        </button>
                    </div>
                </div>

                {/* ── RIGHT: THE PORTAL (Responsive Centerpiece) ── */}
                <div className="relative w-full lg:w-1/2 h-[450px] sm:h-[600px] flex items-center justify-center">
                    {/* Main Portal Frame */}
                    <div className="portal-frame relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full border-[1.5px] border-black/5 p-4 flex items-center justify-center">
                        <div className="portal-inner relative w-full h-full rounded-full overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                            <Image
                                src="https://i.pinimg.com/736x/b8/70/55/b870553a9cfde3ad5aa6600f236b5c8a.jpg"
                                alt="Main" fill className="object-cover scale-110" priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                        </div>

                        {/* Floating Artisan Elements (Macro Shots) */}
                        <div className="floating-item absolute top-0 -left-10 w-24 h-24 sm:w-40 sm:h-40 rounded-2xl border-4 border-white shadow-2xl overflow-hidden z-20">
                            <Image src="https://i.pinimg.com/1200x/ad/f8/2d/adf82db538dda3b52c788333f043fe54.jpg" alt="Artisan 1" fill className="object-cover" />
                        </div>

                        <div className="floating-item absolute bottom-10 -right-8 w-20 h-20 sm:w-36 sm:h-36 rounded-2xl border-4 border-white shadow-2xl overflow-hidden z-20">
                            <Image src="https://i.pinimg.com/1200x/23/b1/2d/23b12da7f92b8d7cab9514e485b700be.jpg" alt="Artisan 2" fill className="object-cover" />
                        </div>

                        <div className="floating-item absolute -top-4 -right-2 w-16 h-16 sm:w-28 sm:h-28 rounded-full border-4 border-[#CCFF00] shadow-2xl overflow-hidden z-20 bg-white p-1">
                            <div className="relative w-full h-full rounded-full overflow-hidden">
                                <Image src="https://i.pinimg.com/736x/29/5a/8e/295a8eb95f74ac12010e83fc399e1557.jpg" alt="Artisan 3" fill className="object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Liquid Badge */}
                    <div className="ui-element absolute bottom-0 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full font-bebas text-lg tracking-widest -rotate-3 border-2 border-[#CCFF00]">
                        LIMIT: 1/100
                    </div>
                </div>
            </div>

            {/* ── BOTTOM NAV/SOCIALS ── */}
            <div className="ui-element absolute bottom-10 left-6 lg:left-12 flex gap-8">
                {['Instagram', 'Twitter', 'Discord'].map((social) => (
                    <a key={social} href="#" className="font-bebas text-sm tracking-widest text-gray-400 hover:text-black transition-colors">
                        {social}
                    </a>
                ))}
            </div>
        </section>
    );
};

export default KineticHero;