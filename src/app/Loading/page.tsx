"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const SinnersSystemLoader = ({ onComplete }: { onComplete: () => void }) => {
    const [percent, setPercent] = useState(0);
    const loaderRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "expo.inOut", force3D: true }
            });

            // 1. Percentage Counter Logic
            tl.to({}, {
                duration: 2.5,
                onUpdate: function () {
                    const p = Math.round(this.progress() * 100);
                    setPercent(p);
                },
            });

            // 2. Kinetic Typography Entry
            tl.fromTo(".char", 
                { y: 150, skewY: 10, opacity: 0 },
                { 
                    y: 0, 
                    skewY: 0, 
                    opacity: 1, 
                    duration: 1.5, 
                    stagger: 0.05,
                    ease: "expo.out" 
                }, 
                0
            );

            tl.fromTo(".sub-text",
                { opacity: 0, y: 20 },
                { opacity: 0.4, y: 0, duration: 1, ease: "power2.out" },
                0.8
            );

            tl.fromTo(progressRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 2.5, ease: "none" },
                0
            );

            // 3. Exit Sequence
            tl.to(".char", {
                y: -150,
                skewY: -10,
                opacity: 0,
                duration: 1,
                stagger: 0.03,
                ease: "expo.in"
            }, "+=0.2");

            tl.to(".sub-text", {
                opacity: 0,
                duration: 0.5
            }, "-=0.8");

            tl.to(loaderRef.current, {
                opacity: 0,
                duration: 0.8,
                onComplete: () => {
                    if (loaderRef.current) {
                        loaderRef.current.style.display = "none";
                    }
                    onComplete();
                }
            }, "-=0.2");

        }, loaderRef);

        return () => ctx.revert();
    }, [onComplete]);

    const title = "SINNERS";

    return (
        <div 
            ref={loaderRef} 
            className="fixed inset-0 z-[99999] bg-background overflow-hidden flex flex-col items-center justify-center p-6"
        >
            {/* Background Decorative Grid (Subtle) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:40px_40px]" />
            
            <div className="relative flex flex-col items-center max-w-4xl w-full">
                {/* Main Kinetic Typography */}
                <div ref={textRef} className="overflow-hidden mb-4">
                    <h1 className="font-bebas text-[18vw] md:text-[12vw] leading-none tracking-[-0.05em] text-foreground flex italic">
                        {title.split("").map((char, index) => (
                            <span key={index} className="char inline-block min-w-[0.2em]">
                                {char === " " ? "\u00A0" : char}
                            </span>
                        ))}
                    </h1>
                </div>

                {/* Status Telemetry */}
                <div className="flex flex-col items-center w-full">
                    <p className="sub-text font-jetbrains-mono text-[10px] md:text-sm text-foreground/40 uppercase tracking-[0.5em] mb-8 font-bold text-center">
                        STAT: ESTABLISHING_ENCRYPTED_UPLINK...
                    </p>
                    
                    {/* Minimal Progress Bar */}
                    <div className="w-full h-[1px] bg-muted/20 relative overflow-hidden max-w-md">
                        <div 
                            ref={progressRef}
                            className="absolute inset-0 bg-indigo-500 origin-left"
                        />
                    </div>
                    
                    {/* Big Counter */}
                    <div className="mt-6 font-bebas text-4xl md:text-6xl text-foreground/10 tracking-widest text-center italic">
                        {percent}%
                    </div>
                </div>
            </div>

            {/* Corner Decorative Elements */}
            <div className="absolute top-10 left-10 sub-text font-jetbrains-mono text-[8px] text-foreground/20 uppercase tracking-widest hidden md:block">
                NODE_ID: 0xSF-99<br/>
                SYNC_ACTIVE
            </div>
            
            <div className="absolute bottom-10 right-10 sub-text font-jetbrains-mono text-[8px] text-foreground/20 uppercase tracking-widest hidden md:block text-right">
                STBL_V2.0.4<br/>
                SINNERS_DIGITAL_HUB
            </div>
        </div>
    );
};

export default SinnersSystemLoader;