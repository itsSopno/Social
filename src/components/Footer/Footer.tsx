import React from "react";
import Link from "next/link";
import './footer.css'
const LandoHero = () => {
  return (
    <>
      <section className="footer">
        <section className="body relative min-h-screen bg-indigo-500/20 text-indigo-500 flex flex-col items-center justify-between py-10 md:py-16 px-4 md:px-12 overflow-hidden rounded-[30px] md:rounded-[50px] mx-2 md:mx-4 my-4">

          {/* Background Contour Lines Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-5 md:opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 200 Q 250 100 500 200 T 1000 200" fill="none" stroke="white" strokeWidth="1" />
              <path d="M0 400 Q 250 300 500 400 T 1000 400" fill="none" stroke="white" strokeWidth="1" />
              <path d="M0 600 Q 250 500 500 600 T 1000 600" fill="none" stroke="white" strokeWidth="1" />
            </svg>
          </div>

          {/* Main Content Area */}
          <div className="relative w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 items-center z-10 my-auto">

            {/* Left Links - Navigation */}
            <div className="flex flex-col gap-3 text-center md:text-left order-2 md:order-1 items-center md:items-start">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Navigation</span>
              <div className="flex flex-row md:flex-col flex-wrap justify-center gap-x-6 gap-y-2">
                <Link href="/" className="text-xl md:text-3xl font-bold uppercase hover:italic transition-all text-white hover:text-indigo-500">Home</Link>
                <Link href="/Contact" className="text-xl md:text-3xl font-bold uppercase hover:italic transition-all text-white hover:text-indigo-500">Contact</Link>
                <Link href="/Payment" className="text-xl md:text-3xl font-bold uppercase hover:italic transition-all text-white hover:text-indigo-500">Payments</Link>
                <Link href="/Story" className="text-xl md:text-3xl font-bold uppercase hover:italic transition-all text-white hover:text-indigo-500">Story</Link>
                <Link href="/Caps" className="text-xl md:text-3xl font-bold uppercase hover:italic transition-all text-white hover:text-indigo-500">Caps</Link>
                <Link href="/store" className="text-xl md:text-3xl font-bold uppercase text-indigo-500 md:mt-4">Store</Link>
              </div>
            </div>

            {/* Center Visual - The Hero Part */}
            <div className="relative flex flex-col items-center order-1 md:order-2">
              {/* Signature Background Text */}
              <div className="absolute -top-10 md:-top-20 text-5xl md:text-8xl font-black opacity-10 tracking-tighter text-white select-none font-line">
                SINNERS
              </div>

              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-center leading-[0.85] uppercase z-20 font-crenzo">
                <span className="text-indigo-500 font-milky italic">Always</span> <br />
                <span className="text-white italic">Ready</span><br />
                <span className="text-white italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl">For Customers.</span>
              </h2>

              {/* Helmet Image Placeholder */}
              <div className="w-56 h-72 sm:w-64 sm:h-80 md:w-[380px] md:h-[480px] lg:w-[420px] lg:h-[520px] mt-8 md:mt-4 relative group">
                <img
                  src="https://i.postimg.cc/Sx3H5zkH/Chat-GPT-Image-Mar-24-2026-10-49-52-PM.png"
                  alt="Lando Helmet"
                  className="object-contain w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right Links - Socials */}
            <div className="flex flex-col gap-3 text-center md:text-right order-3 items-center md:items-end">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Follow On</span>
              <div className="flex flex-row md:flex-col flex-wrap justify-center gap-x-6 gap-y-2">
                <a href="#" className="text-lg md:text-2xl font-bold uppercase text-white hover:text-indigo-500 transition-colors">TikTok</a>
                <a href="#" className="text-lg md:text-2xl font-bold uppercase text-white hover:text-indigo-500 transition-colors">Instagram</a>
                <a href="#" className="text-lg md:text-2xl font-bold uppercase text-white hover:text-indigo-500 transition-colors">YouTube</a>
                <a href="#" className="text-lg md:text-2xl font-bold uppercase text-white hover:text-indigo-500 transition-colors">Twitch</a>
              </div>
            </div>
          </div>

          {/* Bottom Logos / Sponsors */}
          <div className="pb-[20px] w-full mt-16 flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500 pb-4">
            {["ASUS", "AJAZZ", "REDDRAGON", "HYPERX", "LOGITECH"].map((brand) => (
              <span key={brand} className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white">
                {brand}
              </span>
            ))}
          </div>

        </section>
      </section>
    </>
  );
};

export default LandoHero;