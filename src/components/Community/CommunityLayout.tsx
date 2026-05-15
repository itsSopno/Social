"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Settings, LayoutGrid } from "lucide-react";
import Link from "next/link";
import Navbari from "./Navbari";
import MagneticCard from "./MagneticCard";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { NotificationBell } from "./NotificationBell";
import { useGlobalContext } from "@/context/globalContext";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const { activeChat, setActiveChat } = useGlobalContext();
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileLayout(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleToggle = () => setShowMobileChat(prev => !prev);
    window.addEventListener('toggle-mobile-chat', handleToggle);
    
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('toggle-mobile-chat', handleToggle);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toISOString().split('T')[1].split('.')[0] + "_UTC";
      setCurrentTime(timeStr);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans flex flex-col items-center transition-colors duration-300">
      
      {/* --- 1. TOP: FLOATING NAVBAR --- */}
      <Navbari />

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="w-full flex-1 flex flex-col items-center pt-32 pb-24 md:pb-0 transition-all duration-500 ease-in-out">
        
        {/* --- 2. THREE-COLUMN CONTENT GRID (Centered) --- */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10 grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
          
          {/* CENTER CORE: Main Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
            className={`xl:col-span-8 space-y-8 ${showMobileChat ? "hidden" : "block"}`}
          >
            {children}
          </motion.div>

          {/* RIGHT SIDE: Activity Panel & Messaging */}
          <aside className={`${showMobileChat ? "block" : "hidden"} xl:block xl:col-span-4 space-y-12 w-full pt-10 xl:pt-0 sticky top-32 h-fit`}>
            
            {/* System Control Panel */}
            <div className="bg-card/20 border border-border/40 rounded-[48px] p-10 backdrop-blur-3xl shadow-xl relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
              <div className="flex items-center justify-between mb-10">
                 <h3 className="font-bebas text-3xl tracking-widest text-foreground/60 italic uppercase">System_Control</h3>
                 <Link href="/Community/settings" className="p-3 bg-muted/10 rounded-xl hover:text-indigo-500 transition-colors border border-border/40">
                    <Settings size={20} />
                 </Link>
              </div>
              
              <div className="space-y-6">
                 <NotificationBell />
                 <div className="w-full h-[1px] bg-border/20" />
                 <button className="w-full flex items-center justify-between px-6 py-4 bg-muted/5 border border-border/40 rounded-2xl hover:bg-muted/10 transition-all group/btn">
                    <span className="font-jetbrains-mono text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Node_Filter</span>
                    <span className="text-indigo-500 text-[10px] font-jetbrains-mono font-bold tracking-widest">LATEST</span>
                 </button>
              </div>
            </div>

            {/* Global Intelligence Section */}
            <div className="bg-card/20 border border-border/40 rounded-[48px] p-10 backdrop-blur-3xl shadow-xl relative group">
               <div className="flex items-center gap-4 mb-10">
                  <LayoutGrid className="text-indigo-500" size={24} />
                  <h3 className="font-bebas text-3xl tracking-widest text-foreground/90 italic uppercase">Global_Intelligence</h3>
               </div>
               <div className="space-y-8">
                  {[
                    { tag: "SINNERS_TECH", posts: "12.4k", trend: "+244%" },
                    { tag: "UPLINK_STABLE", posts: "8.1k", trend: "+12%" },
                    { tag: "QUANTUM_SYNC", posts: "5.5k", trend: "+89%" }
                  ].map((item, i) => (
                    <div key={i} className="group cursor-pointer">
                       <p className="font-jetbrains-mono text-[9px] text-indigo-500/60 uppercase tracking-widest font-bold mb-1 italic">T_NODE_STREAM</p>
                       <h5 className="font-bebas text-2xl tracking-widest group-hover:text-indigo-500 transition-colors">#{item.tag}</h5>
                       <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-jetbrains-mono text-foreground/30 uppercase tracking-widest">{item.posts} Nodes</span>
                          <span className="text-[9px] font-jetbrains-mono text-green-500 font-bold">{item.trend}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Messaging Section */}
            <div className="space-y-6">
              <div className="px-6 flex items-center justify-between">
                 <h3 className="font-bebas text-2xl tracking-widest text-foreground/40 italic uppercase">Comm_Terminal</h3>
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              </div>
              <ChatSidebar onSelectChat={(id: string) => setActiveChat(id)} />
            </div>

            {/* Decorative Technical Footer */}
            <div className="pt-10 opacity-20 pb-10">
               <p className="font-jetbrains-mono text-[8px] uppercase tracking-[8px] leading-loose text-center">
                  GLOBAL_NETWORK_SYNC_STABLE<br/>
                  SINNERS_SYSTEMS_v1.0.4<br/>
                  &copy; 2026_OFFICIAL_CORP
               </p>
            </div>

          </aside>
        </main>
      </div>

      {/* --- 3. FLOATING CHAT TERMINAL --- */}
      <AnimatePresence>
        {activeChat && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed z-[300] shadow-2xl ${isMobileLayout ? "top-[72px] inset-x-0 h-[calc(100dvh-72px)] w-full rounded-none" : "bottom-10 right-10 w-[420px] h-[650px] rounded-[50px] overflow-hidden border border-border/40 backdrop-blur-3xl"}`}
          >
            <ChatWindow 
              recipientId={activeChat} 
              onClose={() => setActiveChat(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}