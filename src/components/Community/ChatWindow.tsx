"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2, Terminal, X, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSocket } from "@/hooks/useSocket";
import { useGlobalContext } from "@/context/globalContext";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

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
  const displayImage = recipientData?.image || `https://ui-avatars.com/api/?name=${recipientId.charAt(0)}&background=6366f1&color=050505`;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Fetch History
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

  // 2. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", (message: Message) => {
      // Only append if it's from the current recipient
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

  // 3. Auto-Scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  // 4. Handlers
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
      image: imageUrl
    };

    socket.emit("send-message", messageData);
    setInputValue("");
    setImageUrl("");
  };

  useEffect(() => {
    if (!socket) return;

    const handleSent = (message: Message) => {
      if (message.receiverId === recipientId) {
        setMessages(prev => [...prev, message]);
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
    <div className="flex flex-col h-full w-full bg-[#050505]/95 md:bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl overflow-hidden relative rounded-none md:rounded-[40px] shadow-2xl">

      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/[0.05] bg-[#050505]/40 backdrop-blur-md sticky top-0 z-[310]">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 -ml-1 hover:bg-white/10 rounded-full text-indigo-500 active:scale-90 transition-transform"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-indigo-500/20 bg-[#050505] overflow-hidden shrink-0">
            <img
              src={displayImage}
              alt="Recipient"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-bebas text-lg md:text-xl tracking-widest text-white lowercase italic leading-tight truncate">{recipientId}</h4>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-indigo-500 shadow-[0_0_8px_#6366f1]" : "bg-white/20"}`} />
              <p className="text-[8px] md:text-[9px] font-jetbrains-mono text-white/30 uppercase tracking-[2px]">
                {isConnected ? "UPLINK_STABLE" : "SYNCING_SIGNAL..."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white md:hidden">
            <X size={20} />
          </button>
          <Terminal size={14} className="hidden md:block opacity-40 hover:text-indigo-500 cursor-pointer transition-colors" />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full gap-3 text-white/10">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[10px] uppercase font-jetbrains-mono tracking-[4px]">Fetching_Logs...</span>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, x: msg.senderId === currentUserId ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm font-sans ${msg.senderId === currentUserId
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-white rounded-br-none"
                    : "bg-white/[0.05] border border-white/[0.05] text-white/80 rounded-bl-none"
                    }`}>
                    {msg.image && (
                      <div className="mb-3 relative aspect-video w-full max-w-[280px] rounded-lg overflow-hidden border border-white/10">
                        <Image src={msg.image} alt="Sent Image" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className="text-[8px] font-jetbrains-mono opacity-20 mt-2 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full flex gap-1.5 items-center">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-white/[0.05] bg-white/[0.01]">
        {imageUrl && (
          <div className="mb-4 relative w-20 h-20 rounded-xl overflow-hidden border border-indigo-500/40 group">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
            <button
              onClick={() => setImageUrl("")}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 md:gap-4">
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
            className="p-4 bg-white/[0.05] text-white/40 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-2xl transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
          </button>

          <div className="flex-1 relative">
            <input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="MESSAGE..."
              className="w-full bg-[#050505] border border-white/10 rounded-2xl px-6 py-4 text-sm font-jetbrains-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-white/10"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading || (!inputValue.trim() && !imageUrl)}
            className="p-4 bg-indigo-500 text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:grayscale"
          >
            <Send size={18} fill="currentColor" />
          </button>
        </form>
      </div>

    </div>
  );
}
