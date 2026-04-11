"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Package, Users, Home, Bell, MessageSquare, Plus, Search, Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

    const mainNav = [
        { name: "Feed", href: "/Community", icon: <Home size={18} />, id: "home" },
        { name: "Users", href: "/Community/discover", icon: <Search size={18} />, id: "search" },
        { name: "Market", href: "/Store", icon: <Package size={18} />, id: "market" },
        { name: "Profile", href: "/Community/Cprofile", icon: <Users size={18} />, id: "profile" },
        { name: "Settings", href: "/Community/settings", icon: <Settings size={18} />, id: "settings" },
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
                className="hidden md:flex items-center justify-between fixed top-6 w-[95%] max-w-7xl h-20 bg-background/80 backdrop-blur-3xl border border-border shadow-xl rounded-[30px] z-[120] px-10"
            >
                {/* Left: Logo */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-bebas text-2xl tracking-[4px] text-foreground group flex items-center gap-2">
                        SINNERS<span className="text-indigo-500 group-hover:scale-110 transition-transform">_</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-border/40 hidden lg:block" />
                </div>

                {/* Center: Navigation Links */}
                <div className="flex items-center gap-2">
                    {mainNav.map((item) => {
                        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/Community');
                        return (
                            <Link key={item.id} href={item.href} className="relative group px-1">
                                <div className={cn(
                                    "relative z-10 flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all duration-300",
                                    isActive ? 'text-indigo-500 font-bold' : 'text-foreground/60 hover:text-foreground hover:bg-muted font-medium'
                                )}>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                        {item.icon}
                                    </motion.div>
                                    <span className="font-jetbrains-mono text-[10px] uppercase tracking-[2px]">
                                        {item.name}
                                    </span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-active-bg"
                                        className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl z-0"
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
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 pr-6 border-r border-border/40">
                        <button
                            onClick={() => {
                                const event = new CustomEvent('toggle-mobile-chat');
                                window.dispatchEvent(event);
                            }}
                            className="p-3 text-muted-foreground/40 hover:text-indigo-500 hover:bg-muted/10 rounded-xl transition-all"
                        >
                            <MessageSquare size={20} />
                        </button>
                        <button className="p-3 text-muted-foreground/40 hover:text-indigo-500 hover:bg-muted/10 rounded-xl transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-background" />
                        </button>
                    </div>

                    <Link href="/Community/Cprofile" className="flex items-center gap-4 pl-2 group">
                        <div className="text-right hidden xl:block">
                            <p className="text-[11px] font-bebas tracking-widest text-foreground leading-none group-hover:text-indigo-500 transition-colors uppercase italic font-bold">
                                {session?.user?.name || "GHOST_USER"}
                            </p>
                            <p className="text-[8px] font-jetbrains-mono text-foreground/40 uppercase leading-none mt-1.5 tracking-widest">@uplink_active</p>
                        </div>
                        <div className="relative w-12 h-12 rounded-full border border-border overflow-hidden shrink-0 group-hover:border-indigo-500/40 transition-all p-1 bg-muted/10">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                <img
                                    src={userImage || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=6366f1&color=fff`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-indigo-500 rounded-full border-[3px] border-background" />
                        </div>
                    </Link>
                </div>
            </motion.nav>

            {/* --- MOBILE TOP BAR --- */}
            <div className="md:hidden fixed top-0 left-0 w-full h-20 bg-background/80 backdrop-blur-3xl border-b border-border z-[150] flex items-center justify-between px-8 py-4 shadow-sm">
                <Link href="/" className="font-bebas text-2xl tracking-[3px] text-foreground flex items-center gap-2 italic uppercase">
                    SINNERS<span className="text-indigo-500">_</span>
                </Link>

                <div className="flex items-center gap-6">
                    <button className="text-muted-foreground/40 hover:text-indigo-500 transition-colors relative">
                        <Bell size={22} />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-background" />
                    </button>
                    <Link href="/Community/Cprofile" className="w-10 h-10 rounded-full border border-border overflow-hidden bg-muted/10 p-[2px]">
                         <div className="w-full h-full rounded-full overflow-hidden">
                            <img
                                src={userImage || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=6366f1&color=fff`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                </div>
            </div>

            {/* --- MOBILE DOCK --- */}
            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="md:hidden fixed bottom-0 left-0 z-[150] w-full"
            >
                <div className="flex items-center justify-between px-10 py-5 bg-card/80 backdrop-blur-3xl border-t border-border shadow-[0_-15px_40px_-10px_rgba(0,0,0,0.1)] relative">

                    {/* Create Button (Center floating) */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-16 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center shadow-xl border-4 border-background"
                        >
                            <Plus size={32} strokeWidth={3} />
                        </motion.button>
                    </div>

                    {/* Left Dock Items (2 icons) */}
                    <div className="flex items-center gap-10">
                        <DockItem href="/Community" active={pathname === '/Community' && !isChatOpen}>
                            <Home size={24} />
                        </DockItem>
                        <DockItem href="/Community/discover" active={pathname === '/Community/discover'}>
                            <Search size={24} />
                        </DockItem>
                    </div>

                    <div className="w-14" /> {/* Balanced Spacer */}

                    {/* Right Dock Items (2 icons) */}
                    <div className="flex items-center gap-10">
                        <button
                            onClick={() => {
                                const event = new CustomEvent('toggle-mobile-chat');
                                window.dispatchEvent(event);
                            }}
                            className={cn(
                                "relative p-2 flex flex-col items-center justify-center transition-colors",
                                isChatOpen ? 'text-indigo-500' : 'text-muted-foreground/40 hover:text-foreground'
                            )}
                        >
                            <MessageSquare size={24} />
                            {isChatOpen && (
                                <motion.div
                                    layoutId="mobile-dock-dot"
                                    className="absolute -bottom-2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                                />
                            )}
                        </button>
                        <DockItem href="/Community/Cprofile" active={pathname === '/Community/Cprofile'}>
                            <Users size={24} />
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
                className={cn(
                    "relative p-2 flex items-center justify-center transition-colors",
                    active ? 'text-indigo-500' : 'text-muted-foreground/40 hover:text-foreground'
                )}
            >
                {children}
                {active && (
                    <motion.div
                        layoutId="mobile-dock-dot"
                        className="absolute -bottom-2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    />
                )}
            </motion.div>
        </Link>
    );
}