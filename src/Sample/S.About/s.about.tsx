"use client"
import React from "react";
import styles from "./partner.module.scss";
const TechPartners = () => {
    const techBrands = [
        { name: "Keychron", logo: "KEYCHRON" },
        { name: "Razer", logo: "RAZER" },
        { name: "Logitech G", logo: "LOGITECH G" },
        { name: "SteelSeries", logo: "STEELSERIES" },
        { name: "Asus ROG", logo: "ASUS ROG" },
        { name: "Nvidia", logo: "NVIDIA" },
        { name: "Corsair", logo: "CORSAIR" },
        { name: "HyperX", logo: "HYPERX" },
        { name: "Ducky", logo: "DUCKY" },
        { name: "Glorious", logo: "GLORIOUS" },
        { name: "Fnatic", logo: "FNATIC" },
        { name: "G2 Esports", logo: "G2 ESPORTS" },
        { name: "Team Liquid", logo: "TEAM LIQUID" },
        { name: "FaZe Clan", logo: "FAZE CLAN" },
        { name: "Cloud9", logo: "CLOUD9" },
        { name: "T1", logo: "T1" },
        { name: "Gen.G", logo: "GEN.G" },
        { name: "DRX", logo: "DRX" },
        { name: "JD Gaming", logo: "JD GAMING" },
    ];

    return (
        <section className="relative w-full min-h-[600px]  overflow-hidden flex flex-col justify-center px-6 md:px-16 py-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            {/* Background Huge Text (The "Collabs" Style) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-creme">
                <h1 className="text-[20vw] text-[#d9ff00] opacity-90 leading-none transform -rotate-12 translate-y-10 font-creme">
                    Studio<span className="ml-[-2vw] font-creme">Sinners</span>
                </h1>
            </div>

            <div className="container mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                {/* Left Side: Main Heading */}
                <div className="max-w-xl">
                    <h2 className="text-6xl md:text-8xl font-black text-[#1a1a1a] leading-[0.9] uppercase tracking-tighter">
                        Partners <br />
                        <span className="italic font-serif font-light">& Campaigns</span>
                    </h2>
                </div>

                {/* Right Side: Description */}
                <div className="md:max-w-sm">
                    <p className="text-lg text-gray-800 font-medium leading-relaxed">
                        Collaborating with the world's leading tech pioneers to push the boundaries of performance, speed, and precision in every keystroke.
                    </p>
                </div>
            </div>

            {/* Bottom Row: Logos */}
            <div className="container mx-auto relative z-10 mt-24 border-t border-black/10 pt-12">
                <div className="flex flex-wrap justify-between items-center gap-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {techBrands.map((brand, index) => (
                        <div key={index} className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">
                            {brand.logo}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechPartners;