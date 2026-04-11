"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, User, Circle } from "lucide-react";
import { motion } from "framer-motion";
import MagneticCard from "./MagneticCard";
import { cn } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001";

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

  const currentUserId = session?.user?.email;

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
    
    const interval = setInterval(fetchRecentChats, 30000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  if (!session) return null;

  return (
    <MagneticCard delay={0.4}>
      <div className="bg-card/20 border border-border/40 p-8 rounded-[40px] backdrop-blur-3xl relative overflow-hidden group min-h-[450px]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <MessageSquare className="text-indigo-500" size={20} />
            <h4 className="font-bebas tracking-[3px] text-foreground/50 text-sm uppercase italic">Active_Terminals</h4>
          </div>
          <div className="flex items-center gap-2.5">
             <Circle size={10} className="fill-indigo-500 text-indigo-500 animate-pulse" />
             <span className="text-[10px] font-jetbrains-mono text-foreground/40 uppercase tracking-widest font-bold">Live</span>
          </div>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-jetbrains-mono text-muted-foreground/40 mt-6 uppercase tracking-[4px] italic">Scanning_Frequencies...</p>
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <motion.div
                key={chat._id}
                whileHover={{ x: 8 }}
                onClick={() => onSelectChat(chat.user.email)}
                className="flex items-center gap-5 p-4 rounded-3xl bg-muted/5 hover:bg-muted/10 border border-transparent hover:border-border/40 transition-all cursor-pointer group/item text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full border border-border overflow-hidden bg-background">
                    {chat.user.image ? (
                      <img src={chat.user.image} alt={chat.user.name} className="w-full h-full object-cover dark:opacity-80 group-hover/item:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/20">
                         <User size={22} className="text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  {/* Status indicator mockup */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full border border-border flex items-center justify-center">
                     <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bebas text-lg tracking-widest text-foreground group-hover/item:text-indigo-500 transition-colors truncate italic">
                      {chat.user.name || "Anonymous_User"}
                    </h5>
                    <span className="text-[8px] font-jetbrains-mono text-foreground/40 uppercase font-bold tracking-tighter">
                      {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] font-jetbrains-mono text-foreground/60 truncate italic tracking-tight">
                    {`> ${chat.lastMessage}`}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 opacity-40 border border-dashed border-border rounded-[32px] bg-muted/5">
              <p className="text-[9px] font-jetbrains-mono uppercase tracking-[6px] text-muted-foreground leading-relaxed">No_Active_Signals<br/>Detected_In_Sector</p>
              <button className="mt-6 px-6 py-3 border border-border rounded-2xl text-[9px] font-jetbrains-mono uppercase tracking-[2px] transition-all hover:bg-foreground hover:text-background font-bold">Start_Initial_Uplink</button>
            </div>
          )}
        </div>
      </div>
    </MagneticCard>
  );
}
