"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  if (pathname.startsWith("/Community") || pathname.startsWith("/dashboard")) return null;
  const isAdmin = session?.user?.email === "admin@user";

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-[60px] py-6 md:py-8 flex items-center justify-between pointer-events-none w-full">

      {/* Left Side: Store Button (Moved to Left for Mobile Design Match) */}
      <div className="flex items-center pointer-events-auto">
        <Link
          href="/Store"
          className="text-white h-[48px] md:h-[62px] px-4 md:px-12 flex bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/50 hover:bg-indigo-500 items-center gap-2 hover:text-black transition-all duration-300 shadow-sm active:scale-95"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-0.5"
          >
            <path d="M6 2L3 6V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="font-bebas text-xl md:text-2xl font-bold uppercase tracking-wider mt-1">
            Store
          </span>
        </Link>
        {/* {isAdmin && (
          <Link
            href="/dashboard"
            className="bg-neon-lime text-[#161e00] h-[48px] md:h-[62px] px-4 md:px-8 flex items-center gap-2 hover:bg-white hover:text-black transition-all duration-300 shadow-sm active:scale-95 ml-3"
          >
            <span className="font-bebas text-xl md:text-2xl font-bold uppercase tracking-wider mt-1">
              Dashboard
            </span>
          </Link>
        )} */}
      </div>

      {/* Center: Stylized LN Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
        <Link href="/" className="flex items-center justify-center group" aria-label="Home">
          <svg width="34" height="34" viewBox="0 0 100 100" fill="none" className="transform skew-x-[-15deg]">
            {/* Stylized LN4 Logo Representation - Two Parallel Slanted Shapes */}
            <path
              d="M20 80 L45 20 L55 20 L30 80 Z"
              fill="currentColor"
              className="group-hover:fill-neon-lime transition-colors duration-300"
            />
            <path
              d="M50 80 L75 20 L85 20 L60 80 Z"
              fill="currentColor"
              className="group-hover:fill-neon-lime transition-colors duration-300"
            />
          </svg>
        </Link>
      </div>

      {/* Right Side: Menu Toggle Button */}
      <div className="flex items-center pointer-events-auto">
        <button
          className="group h-[52px] w-[52px] md:h-[62px] md:w-[62px] flex flex-col items-center justify-center gap-[5px] transition-all duration-300 bg-transparent"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="w-6 h-[2.5px] bg-silver group-hover:bg-indigo-500/20 transition-all ml-auto mr-3"></div>
          <div className="w-6 h-[2.5px] bg-silver group-hover:bg-indigo-500/20 transition-all ml-auto mr-5"></div>
        </button>
      </div>

      {/* Fullscreen Menu Overlay (Matches New Reference Image) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-obsidian z-[200] overflow-y-auto overflow-x-hidden flex flex-col pointer-events-auto animate-in fade-in duration-500">

          {/* Topographic Background Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='800' viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 200 50 400 100 T 800 100 M0 250 Q 200 200 400 250 T 800 250 M0 400 Q 200 350 400 400 T 800 400 M0 550 Q 200 500 400 550 T 800 550 M0 700 Q 200 650 400 700 T 800 700' stroke='%23D9FF00' fill='none' stroke-width='2'/%3E%3C/svg%3E")`, backgroundSize: 'cover' }}></div>

          {/* Top Bar inside Menu - Updated Layout (Store Left, Close Right) */}
          <div className="flex items-center justify-between px-6 py-8 w-full relative z-[210]">
            <div className="flex items-center gap-3">
              <Link
                href="/Store"
                className="text-white h-12 px-6 flex bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/50 hover:bg-indigo-500 items-center gap-2 hover:text-black transition-all duration-300 shadow-sm active:scale-95 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-bebas text-xl font-bold uppercase tracking-wider mt-1">Store</span>
              </Link>

              {/* {isAdmin && (
                <Link
                  href="/dashboard"
                  className="bg-neon-lime text-[#161e00] h-12 px-6 flex items-center gap-2 hover:bg-white transition-all duration-300 shadow-sm active:scale-95 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="font-bebas text-xl font-bold uppercase tracking-wider mt-1">Dashboard</span>
                </Link>
              )} */}
            </div>

            <button
              className="h-[52px] w-[52px] flex items-center justify-center bg-white hover:bg-neon-lime transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Menu Content - Centered for Mobile */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-[210] px-6">

            {/* Large Bold Links & Dynamic Auth */}
            <div className="flex flex-col items-center gap-2 mb-12">
              {[
                { name: "HOME", href: "/" },
                { name: "KEYCAPS", href: "/#keycaps" },
                { name: "STORY", href: "/Story" },
                { name: "ARCHIVE", href: "/Caps" },
                { name: "PROFILE", href: "/Profile" },
                ...(isAdmin ? [{ name: "DASHBOARD", href: "/dashboard" }] : []),
                ...(session
                  ? [{ name: "LOGOUT", isLogout: true }, { name: "PAYMENT", href: "/Payment" }]
                  : [
                    { name: "REGISTER", href: "/register" },
                    { name: "LOGIN", href: "/login" }
                  ]
                )
              ].map((item, idx) => (
                <div key={item.name} className="relative group text-center">
                  {item.isLogout ? (
                    <button
                      className={`font-bebas text-[54px] sm:text-[70px] leading-[0.85] uppercase transition-all duration-300 hover:text-white ${idx === 0 ? 'text-white' : 'text-white/40'}`}
                      onClick={async () => {
                        try {
                          await Promise.allSettled([
                            fetch("https://t-mark-4.vercel.app/api/logout", { method: "GET", credentials: "include" }),
                            fetch("https://t-mark-4.vercel.app/api/google/logout", { method: "GET", credentials: "include" })
                          ]);
                        } catch (e) {
                          console.error("Backend logout error", e);
                        }
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`font-bebas text-[54px] sm:text-[70px] leading-[0.85] uppercase transition-all duration-300 hover:text-white ${idx === 0 ? 'text-white' : 'text-white/40'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                  {idx === 0 && (
                    <div className="absolute top-1/2 left-[-10%] w-[120%] h-[4px] bg-neon-lime pointer-events-none shadow-[0_0_15px_rgba(195,244,0,0.5)]"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Middle Section Detail */}
            <div className="flex flex-col items-center mb-16">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-white/80">
                  <path d="M50 0 L100 100 L50 80 L0 100 Z" /> {/* Stylized Badge Shape */}
                </svg>
              </div>
              <span className="font-bebas text-sm tracking-[0.4em] text-white/50 uppercase">MCLAREN F1 SINCE 2019</span>
            </div>

            {/* Footer Section */}
            <div className="w-full flex flex-col items-center gap-8 mt-auto pb-12">
              <span className="font-bebas text-base text-white/80 tracking-[0.3em] uppercase font-bold">Business Enquiries</span>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                {['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITCH'].map(social => (
                  <Link key={social} href="#" className="font-bebas text-sm text-white/40 hover:text-[#D9FF00] transition-colors tracking-[0.2em]">{social}</Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;