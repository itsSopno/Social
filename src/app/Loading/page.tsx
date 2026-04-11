
"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import img1 from './Sinners_ hero.png'
import img2 from './Sinners_ 2nd.png'
import img3 from './3rd.png'
import img4 from './Sinners_3rd.png'


const OchiComponentLoader = ({ onComplete }: { onComplete: () => void }) => {
    const [percent, setPercent] = useState(0);
    const loaderRef = useRef<HTMLDivElement>(null);


    const loaderImages = useMemo(() => [
        { id: 1, src: img4, alt: "Archive 01" },
        { id: 2, src: img3, alt: "Archive 02" },
        { id: 3, src: img2, alt: "Archive 03" },
        { id: 4, src: img1, alt: "Studio Sinners" },
    ], []);

    useEffect(() => {

        const style = document.createElement("style");
        style.textContent = `
            .perspective-2000 { perspective: 2000px; }
            .loader-card { 
                will-change: transform, opacity; 
                backface-visibility: hidden;
                transform: translateZ(0); 
            }
        `;
        document.head.appendChild(style);


        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "expo.inOut", force3D: true }
            });


            tl.to({}, {
                duration: 3,
                onUpdate: function () {
                    const p = Math.round(this.progress() * 100);

                    setPercent((prev) => (prev !== p ? p : prev));
                },
            });


            tl.fromTo(".loader-card",
                { y: "100vh", rotationX: 10, opacity: 0 },
                {
                    y: (i) => `${i * -5}px`,
                    rotationX: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.25,
                },
                0
            );


            tl.to(".loader-card:not(:last-child)", {
                y: "100vh",
                opacity: 0,
                duration: 0.8,
                stagger: 0.04,
            }, "+=0.2");

            tl.to(".loader-card:last-child", {
                width: "100vw",
                height: "100vh",
                borderRadius: "0px",
                duration: 1,
            }, "-=0.5");

            tl.to(loaderRef.current, {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {

                    if (loaderRef.current) {
                        loaderRef.current.style.pointerEvents = "none";
                        loaderRef.current.style.display = "none";
                    }
                    onComplete();
                },
            }, "+=0.1");

        }, loaderRef);

        return () => {
            ctx.revert();
            style.remove();
        };
    }, [onComplete]);

    return (
        <div ref={loaderRef} className="fixed inset-0 z-[99999] bg-black overflow-hidden perspective-2000 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
                {loaderImages.map((image, index) => (
                    <div
                        key={image.id}
                        className="loader-card absolute w-[80%] h-[50%] md:w-[60%] md:h-[70%] overflow-hidden rounded-[20px] md:rounded-[40px]"
                        style={{ zIndex: index + 1 }}
                    >
                        <div className="relative w-full h-full p-4 md:p-12">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                sizes="(max-width: 768px) 80vw, 60vw"
                                className="object-contain"
                                priority={index >= loaderImages.length - 2}
                                quality={60}
                            />
                        </div>

                        {index === loaderImages.length - 1 && (
                            <div className="absolute bottom-6 right-8 md:bottom-12 md:right-12 z-[100]">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-mono tracking-[4px] text-[#D9FF00] uppercase mb-1 opacity-50">
                                    </span>
                                    <div className="font-bebas text-[20vw] md:text-[10vw] leading-none text-indigo-500/20 tracking-tighter shadow-2xl">
                                        {percent}%
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OchiComponentLoader;