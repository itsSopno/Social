"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Package, Users, Home, Bell, MessageSquare, Plus, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbari() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        setMounted(true);
        const handleToggle = () => setIsChatOpen(prev => !prev);
        window.addEventListener('toggle-mobile-chat', handleToggle);
        return () => window.removeEventListener('toggle-mobile-chat', handleToggle);
    }, []);

    const userImage = session?.user?.image;

    const mainNav: Array<{ name: string; href: string; icon: React.ReactNode; id: string; badge?: string | number }> = [
        { name: "Feed", href: "/Community", icon: <Home size={20} />, id: "home" },
        { name: "Users", href: "/Community/discover", icon: <Users size={20} />, id: "search" },
        { name: "Market", href: "/Store", icon: <Package size={20} />, id: "market" },
        { name: "Profile", href: "/Community/Cprofile", icon: <Users size={20} />, id: "profile" },
    ];

    if (!mounted) return null;

    return (
        <>
            {/* --- DESKTOP FLOATING NAVBAR --- */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ left: "50%", x: "-50%" }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="hidden md:flex items-center justify-between fixed top-6 w-[95%] max-w-7xl h-20 bg-[#050505]/70 backdrop-blur-3xl border border-white/[0.05] rounded-[24px] z-[120] px-8 shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            >
                {/* Left: Logo */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bebas text-2xl tracking-[3px] text-white group flex items-center gap-2">
                        SINNERS<span className="text-indigo-500 group-hover:scale-110 transition-transform">_</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10 hidden lg:block" />
                    <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-widest hidden lg:block">
                        SINNERS Topluluk
                    </p>
                </div>

                {/* Center: Navigation Links */}
                <div className="flex items-center gap-1">
                    {mainNav.map((item) => {
                        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/Community');
                        return (
                            <Link key={item.id} href={item.href} className="relative group px-1">
                                <div className={`relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'text-indigo-500' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        {item.icon}
                                    </motion.div>
                                    <span className="font-jetbrains-mono text-[11px] uppercase tracking-[1px]">
                                        {item.name}
                                    </span>
                                    {item.badge && (
                                        <span className="bg-indigo-500/10 text-indigo-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-500/20">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-active-bg"
                                        className="absolute inset-0 bg-indigo-500/[0.03] border border-indigo-500/20 rounded-xl z-0"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                        <button
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    const event = new CustomEvent('toggle-mobile-chat');
                                    window.dispatchEvent(event);
                                }
                            }}
                            className="p-2 text-white/30 hover:text-indigo-500 transition-colors"
                        >
                            <MessageSquare size={18} />
                        </button>
                        <button className="p-2 text-white/30 hover:text-indigo-500 transition-colors relative">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#050505]" />
                        </button>
                    </div>

                    <Link href="/Community/Cprofile" className="flex items-center gap-3 pl-2 group">
                        <div className="text-right hidden xl:block">
                            <p className="text-[10px] font-bebas tracking-widest text-white leading-none group-hover:text-indigo-500 transition-colors">
                                {session?.user?.name || "GHOST_USER"}
                            </p>
                            <p className="text-[8px] font-jetbrains-mono text-white/30 uppercase leading-none mt-1">@uplink_active</p>
                        </div>
                        <div className="relative w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0 group-hover:border-indigo-500/40 transition-all p-[2px]">
                            <div className="w-full h-full rounded-full overflow-hidden">
                                <img
                                    src={userImage || "https://ui-avatars.com/api/?name=User&background=6366f1&color=050505"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-500 rounded-full border-[2px] border-[#050505]" />
                        </div>
                    </Link>
                </div>
            </motion.nav>

            {/* --- MOBILE TOP BAR --- */}
            <div className="md:hidden fixed top-0 left-0 w-full h-18 bg-[#020202] backdrop-blur-3xl border-b border-white/[0.1] z-[150] flex items-center justify-between px-6 py-4 shadow-xl">
                <Link href="/" className="font-bebas text-xl tracking-[2px] text-white flex items-center gap-2">
                    SINNERS<span className="text-indigo-500">_</span>
                </Link>

                <div className="flex items-center gap-5">
                    <button className="text-white/40 hover:text-indigo-500 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#050505]" />
                    </button>
                    <Link href="/Community/Cprofile" className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                        <img
                            src={userImage || "https://ui-avatars.com/api/?name=User&background=6366f1&color=050505"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </Link>
                </div>
            </div>

            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="md:hidden fixed bottom-0 left-0 z-[150] w-full"
            >
                <div className="flex items-center justify-between px-8 py-4 bg-[#020202] border-t border-white/[0.1] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative">

                    {/* Create Button (Center floating) */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-14 h-14 bg-indigo-500 text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(217,255,0,0.3)] border-[4px] border-[#020202]"
                        >
                            <Plus size={28} className="text-black" strokeWidth={3} />
                        </motion.button>
                    </div>

                    {/* Left Dock Items (2 icons) */}
                    <div className="flex items-center gap-8">
                        <DockItem href="/Community" active={pathname === '/Community' && !isChatOpen}>
                            <Home size={22} />
                        </DockItem>
                        <DockItem href="/Community/discover" active={pathname === '/Community/discover'}>
                            <Search size={22} />
                        </DockItem>
                    </div>

                    <div className="w-12" /> {/* Balanced Spacer */}

                    {/* Right Dock Items (2 icons) */}
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    const event = new CustomEvent('toggle-mobile-chat');
                                    window.dispatchEvent(event);
                                }
                            }}
                            className={`relative p-2 flex flex-col items-center justify-center transition-colors ${isChatOpen ? 'text-indigo-500' : 'text-white/40 hover:text-white'}`}
                        >
                            <MessageSquare size={22} />
                            {isChatOpen && (
                                <motion.div
                                    layoutId="mobile-dock-dot"
                                    className="absolute -bottom-1 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(217,255,0,0.8)]"
                                />
                            )}
                        </button>
                        <DockItem href="/Community/Cprofile" active={pathname === '/Community/Cprofile'}>
                            <Users size={22} />
                        </DockItem>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

// --- DOCK ITEM HELPER ---
function DockItem({ children, href, active }: { children: React.ReactNode, href: string, active: boolean }) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ scale: 1.2, y: -4 }}
                whileTap={{ scale: 0.9 }}
                className={`relative p-2 flex items-center justify-center transition-colors ${active ? 'text-indigo-500' : 'text-white/40 hover:text-white'}`}
            >
                {children}
                {active && (
                    <motion.div
                        layoutId="mobile-dock-dot"
                        className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(217,255,0,0.8)]"
                    />
                )}
            </motion.div>
        </Link>
    );
}