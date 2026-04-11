"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2, Terminal, X, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSocket } from "@/hooks/useSocket";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  image?: string;
  createdAt: string;
}

interface ChatWindowProps {
  recipientId: string;
  recipientImage?: string;
  onClose?: () => void;
}

export default function ChatWindow({ recipientId, onClose }: ChatWindowProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.email;
  const { socket, isConnected } = useSocket(currentUserId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { allUsers } = useGlobalContext();
  const recipientData = allUsers.find(u => u.email === recipientId);
  const displayImage = recipientData?.image || `https://ui-avatars.com/api/?name=${recipientId.charAt(0)}&background=6366f1&color=fff`;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!currentUserId || !recipientId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/messages/history/${currentUserId}/${recipientId}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUserId, recipientId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", (message: Message) => {
      if (message.senderId === recipientId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("user-typing", (userId: string) => {
      if (userId === recipientId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socket.off("new-message");
      socket.off("user-typing");
    };
  }, [socket, recipientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dhkdtyjsr";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!uploadPreset) {
      console.error("Cloudinary upload preset missing");
      setIsUploading(false);
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
    } finally {
      setIsUploading(false);
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToCloudinary(file);
    if (url) {
      setImageUrl(url);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !imageUrl) || !socket || !currentUserId) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: recipientId,
      message: inputValue,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      _id: `temp-${Date.now()}`
    };

    setMessages(prev => [...prev, messageData]);

    socket.emit("send-message", messageData);
    setInputValue("");
    setImageUrl("");
  };

  useEffect(() => {
    if (!socket) return;

    const handleSent = (message: Message) => {
      if (message.receiverId === recipientId) {
        setMessages(prev => {
          const filtered = prev.filter(m => !m._id.toString().startsWith("temp-"));
          if (prev.find(m => m._id === message._id)) return prev;
          return [...filtered, message];
        });
      }
    };

    socket.on("message-sent", handleSent);
    return () => { socket.off("message-sent", handleSent); };
  }, [socket, recipientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (socket && currentUserId) {
      socket.emit("typing", { senderId: currentUserId, receiverId: recipientId });
    }
  };

  if (!recipientId) return null;

  return (
    <div className="flex flex-col h-full w-full bg-background/95 border border-border/40 backdrop-blur-3xl overflow-hidden relative rounded-none md:rounded-[50px] shadow-2xl transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between p-5 md:p-8 border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-[310]">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-indigo-500 hover:bg-muted/10 rounded-full active:scale-90 transition-all font-bold"
            >
              <ArrowLeft size={28} />
            </button>
          )}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-indigo-500/20 bg-muted/10 overflow-hidden shrink-0 shadow-sm transition-all duration-500 hover:scale-105">
            <img
              src={displayImage}
              alt="Recipient"
              className="w-full h-full object-cover dark:opacity-80"
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-bebas text-xl md:text-2xl tracking-widest text-foreground lowercase italic leading-none truncate mb-1">
              {recipientData?.name || recipientId.split('@')[0]}
            </h4>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]" : "bg-foreground/20"
              )} />
              <p className="text-[9px] font-jetbrains-mono text-foreground/40 uppercase tracking-[3px] font-bold">
                {isConnected ? "UPLINK_STABLE" : "SYNCING_NODE..."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isMobile && (
             <button onClick={onClose} className="p-2.5 hover:bg-muted/20 rounded-xl transition-all text-muted-foreground/40 hover:text-foreground">
                <X size={20} />
             </button>
          )}
          <Terminal size={16} className="hidden md:block opacity-20 hover:text-indigo-500 cursor-pointer transition-all" />
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar scroll-smooth"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-indigo-500">
            <Loader2 size={24} className="animate-spin opacity-40" />
            <span className="text-[10px] uppercase font-jetbrains-mono tracking-[6px] italic">Accessing_Logs...</span>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col",
                    msg.senderId === currentUserId ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[85%] md:max-w-[75%] rounded-[28px] p-5 text-sm font-sans shadow-sm",
                    msg.senderId === currentUserId
                      ? "bg-indigo-500 text-white rounded-tr-none shadow-lg shadow-indigo-500/10"
                      : "bg-card/40 border border-border/40 text-foreground rounded-tl-none backdrop-blur-sm"
                  )}>
                    {msg.image && (
                      <div className="mb-4 relative aspect-video w-full min-w-[200px] md:min-w-[300px] rounded-2xl overflow-hidden border border-border/20 bg-muted/20">
                        <Image src={msg.image} alt="Sent Image" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <p className="leading-relaxed font-medium">{msg.message}</p>
                    <div className={cn(
                        "text-[8px] font-jetbrains-mono mt-3 opacity-60 flex items-center gap-2 font-bold",
                        msg.senderId === currentUserId ? "justify-end text-white/80" : "justify-start text-foreground/60"
                    )}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted/10 border border-border/40 px-6 py-3 rounded-full flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-10 border-t border-border/40 bg-card/10">
        {imageUrl && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/40 group shadow-xl"
          >
            <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
            <button
              onClick={() => setImageUrl("")}
              className="absolute top-1.5 right-1.5 bg-black/80 rounded-full p-1.5 text-white hover:bg-red-500 transition-colors z-20"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-5 bg-muted/10 text-muted-foreground/40 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-[20px] transition-all disabled:opacity-50 shadow-sm"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
          </button>

          <div className="flex-1 relative">
            <input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="TRANSMIT_DATA..."
              className="w-full bg-background/50 border border-border/60 rounded-[20px] px-8 py-5 text-sm font-jetbrains-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-muted-foreground/20 shadow-inner uppercase tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading || (!inputValue.trim() && !imageUrl)}
            className="p-5 bg-indigo-500 text-black rounded-[20px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale font-bold"
          >
            <Send size={20} fill="currentColor" />
          </button>
        </form>
      </div>

    </div>
  );
}
