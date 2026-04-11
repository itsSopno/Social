"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, User, Circle } from "lucide-react";
import { motion } from "framer-motion";
import MagneticCard from "./MagneticCard";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

interface Chat {
  _id: string;
  lastMessage: string;
  timestamp: string;
  isRead: boolean;
  user: {
    name: string;
    image: string;
    email: string;
  };
}

export default function ChatSidebar({ onSelectChat }: { onSelectChat: (userId: string) => void }) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = session?.user?.email; // Using email as ID based on previous backend logic

  useEffect(() => {
    if (!currentUserId) return;

    const fetchRecentChats = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/messages/recent/${currentUserId}`);
        const data = await res.json();
        if (data.success) {
          setChats(data.chats);
        }
      } catch (err) {
        console.error("Failed to fetch recent chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentChats();
    
    // Refresh every 30 seconds as fallback to socket
    const interval = setInterval(fetchRecentChats, 30000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  if (!session) return null;

  return (
    <MagneticCard delay={0.4}>
      <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group min-h-[400px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-indigo-500" size={18} />
            <h4 className="font-bebas tracking-[2px] text-white/50 text-sm uppercase">Active_Terminals</h4>
          </div>
          <div className="flex items-center gap-2">
             <Circle size={8} className="fill-indigo-500 text-indigo-500 animate-pulse" />
             <span className="text-[10px] font-jetbrains-mono text-white/40 uppercase">Live</span>
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {loading ? (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-[#6366f1] rounded-full animate-spin mx-auto" />
              <p className="text-[9px] font-jetbrains-mono text-white/20 mt-4 uppercase tracking-widest">Scanning_Frequencies...</p>
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <motion.div
                key={chat._id}
                whileHover={{ x: 5 }}
                onClick={() => onSelectChat(chat.user.email)}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] hover:border-white/[0.1] transition-all cursor-pointer group/item"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-[#050505]">
                    {chat.user.image ? (
                      <img src={chat.user.image} alt={chat.user.name} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <User size={20} className="m-auto mt-2 text-white/20" />
                    )}
                  </div>
                  {/* Status indicator mockup */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-indigo-500/20 rounded-full border border-[#050505] flex items-center justify-center">
                     <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_5px_#6366f1]" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h5 className="font-bebas text-sm tracking-widest text-white group-hover/item:text-indigo-500 transition-colors truncate">
                      {chat.user.name || "Anonymous_User"}
                    </h5>
                    <span className="text-[8px] font-jetbrains-mono text-white/20 uppercase">
                      {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] font-jetbrains-mono text-white/40 truncate italic">
                    {`> ${chat.lastMessage}`}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 opacity-30">
              <p className="text-[9px] font-jetbrains-mono uppercase tracking-[3px]">No_Active_Signals</p>
              <button className="mt-4 px-4 py-2 border border-white/10 rounded-xl text-[8px] font-jetbrains-mono uppercase hover:bg-white/5">Start_Uplink</button>
            </div>
          )}
        </div>
      </div>
    </MagneticCard>
  );
}
