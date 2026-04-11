"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import Navbari from "./Navbari";
import MagneticCard from "./MagneticCard";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
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
          <aside className={`${showMobileChat ? "block" : "hidden"} xl:block xl:col-span-4 space-y-8 w-full pt-10 xl:pt-0`}>
            
            {/* Mobile Header for Chat Sidebar */}
            {showMobileChat && (
              <div className="flex items-center justify-between mb-8 xl:hidden">
                <h4 className="font-bebas text-3xl tracking-widest text-indigo-500 italic uppercase">COMM_TERMINAL</h4>
                <button 
                  onClick={() => setShowMobileChat(false)}
                  className="px-6 py-3 bg-muted/10 border border-border/40 rounded-2xl text-[10px] font-jetbrains-mono uppercase tracking-widest"
                >
                  Close_Term
                </button>
              </div>
            )}
            
            {/* System Status Tracker */}
            <MagneticCard delay={0.4}>
              <div className="bg-card/20 border border-border/40 p-8 rounded-[40px] backdrop-blur-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
                
                <div className="flex items-center gap-4 mb-8">
                  <Activity className="text-indigo-500" size={20} />
                  <h4 className="font-bebas tracking-[3px] text-foreground/50 text-sm uppercase italic">Active_Nodes</h4>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 rounded-3xl hover:bg-muted/10 border border-transparent hover:border-border/40 transition-all cursor-crosshair"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-sm ${i === 1 ? 'bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.6)]' : 'bg-muted-foreground/20'}`} />
                        <span className="text-[11px] font-jetbrains-mono text-foreground/70 uppercase tracking-widest font-bold">Uplink_Relay_0{i}</span>
                      </div>
                      <span className="text-[10px] font-jetbrains-mono text-indigo-500/60 font-bold">{100 - i * 5}ms</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </MagneticCard>

            {/* Time / System Status */}
            <MagneticCard delay={0.5}>
              <div className="bg-card/20 border border-border/40 p-8 rounded-[40px] backdrop-blur-3xl flex flex-col items-center justify-center text-center">
                 <span className="text-[9px] font-jetbrains-mono text-foreground/40 tracking-[6px] uppercase italic leading-none">
                  Telemetry_Sync_Active
                </span>
                <span className="font-bebas text-3xl text-indigo-500 tracking-[5px] mt-2 italic">
                  {currentTime}
                </span>
              </div>
            </MagneticCard>

            {/* Direct Messaging / Recent Chats */}
            <div className="pt-2">
              <ChatSidebar onSelectChat={(id: string) => setActiveChat(id)} />
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