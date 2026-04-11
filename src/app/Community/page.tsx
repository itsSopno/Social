"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MagneticCard from "@/components/Community/MagneticCard";
import { MessageSquare, Heart, Share2, MoreHorizontal, Image as ImageIcon, Loader2, X, Send, UserPlus, UserCheck, ShieldCheck } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "@/components/Community/NotificationBell";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001";

interface PostAuthor {
  userID: string;
  email: string;
  username: string;
  userImage: string;
}

interface Post {
  _id: string;
  author: PostAuthor;
  content: string;
  images: string[];
  likes: string[];
  comments: {
    userID: string;
    email: string;
    username: string;
    image?: string;
    comment: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export default function CommunityPage() {
  const { data: session } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { allUsers, socket, userData, sendFriendRequest } = useGlobalContext()
  
  const currentUserData = allUsers?.find(
    (user: any) => user.email === session?.user?.email
  );

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/post/get`, {
        withCredentials: true
      });
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch {
      console.error("Failed to fetch stream");
      toast.error("CONNECTION_ERROR: Failed to sync with stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dhkdtyjsr";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!uploadPreset) {
      toast.error("Cloudinary upload preset missing");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
      if (res.data.secure_url) {
        setImages(prev => [...prev, res.data.secure_url]);
        toast.success("UPLOAD_COMPLETE: Data attached via Cloudinary");
      }
    } catch {
      toast.error("UPLOAD_FAILED: Signal lost to Cloudinary");
    } finally {
      setUploading(false);
    }
  };

  const handleTransmit = async () => {
    if (!content.trim() && images.length === 0) return;
    if (!session?.user) {
      toast.error("AUTH_REQUIRED: Identity not verified");
      return;
    }

    setIsTransmitting(true);
    const authorData = {
      userID: session.user.email || "GHOST",
      email: session.user.email || "",
      username: session.user.name || "Anonymous_Node",
      userImage: currentUserData?.image || session.user.image || ""
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/post/create`, {
        author: authorData,
        content: content,
        images: images,
      }, {
        headers: {
          Authorization: `Bearer ${(session as any)?.user?.backendToken}`
        },
        withCredentials: true
      });

      if (res.data.success) {
        toast.success("BROADCAST_SUCCESS: Node added to stream");
        setContent("");
        setImages([]);
        setPosts(prev => [res.data.post, ...prev]);
      }
    } catch {
      toast.error("TRANSMISSION_FAILED: Uplink rejected");
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!session?.user?.email) {
      toast.error("AUTH_REQUIRED: Identity not verified");
      return;
    }

    try {
      const res = await axios.patch(`${API_BASE_URL}/api/post/${postId}/like`, {
        userID: session.user.email
      }, {
        headers: {
          Authorization: `Bearer ${(session as any)?.user?.backendToken}`
        },
        withCredentials: true
      });

      if (res.data.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
        
        const post = posts.find(p => p._id === postId);
        if (post && post.author.email !== session.user.email) {
           socket?.emit("send-notification", {
              recipientId: post.author.email,
              senderId: session.user.email,
              type: "LIKE",
              title: "Signal Acknowledged",
              content: `${session.user.name || "A user"} resonated with your telemetry.`
           });
        }
      }
    } catch {
      toast.error("INTERACTION_FAILED: Pulse lost");
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !session?.user?.email) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/post/${postId}/comment`, {
        userID: session.user.email,
        email: session.user.email,
        username: session.user.name || "Anonymous",
        image: session.user.image || "",
        comment: commentText
      }, {
        headers: {
          Authorization: `Bearer ${(session as any)?.user?.backendToken}`
        },
        withCredentials: true
      });

      if (res.data.success) {
        setPosts(prev => prev.map(p => p._id === postId ? {
          ...p,
          comments: [...(p.comments || []), res.data.comment]
        } : p));
        setCommentText("");
        setCommentingId(null);
        toast.success("DATA_INJECTED: Comment added");

        const post = posts.find(p => p._id === postId);
        if (post && post.author.email !== session.user.email) {
           socket?.emit("send-notification", {
              recipientId: post.author.email,
              senderId: session.user.email,
              type: "COMMENT",
              title: "Incoming Transmission",
              content: `${session.user.name || "A user"} commented on your log.`
           });
        }
      }
    } catch {
      toast.error("TRANSMISSION_FAILED: Packet lost");
    }
  };

  return (
    <div className="space-y-12 pb-32 md:pb-12 text-left">

      {/* Feed Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-[6px] text-foreground flex items-center gap-6 italic leading-none">
            GLOBAL_STREAM <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
          </h1>
          <p className="font-jetbrains-mono text-[11px] text-foreground/40 uppercase tracking-[6px] mt-4 font-bold">
            Displaying live telemetry from active nodes...
          </p>
        </div>

        <div className="flex items-center gap-5">
          <NotificationBell />
          <button className="flex items-center gap-3 px-6 py-3 bg-muted/10 border border-border/40 rounded-2xl hover:bg-muted/20 transition-all text-[10px] font-jetbrains-mono uppercase font-bold tracking-widest">
            <span className="text-foreground/40 italic">Sort_By:</span>
            <span className="text-indigo-500">Latest</span>
          </button>
        </div>
      </div>

      {/* Post Input Card */}
      <MagneticCard delay={0.2}>
        <div className="bg-card/20 border border-border/40 p-8 rounded-[40px] backdrop-blur-3xl shadow-xl transition-all duration-500 hover:border-indigo-500/20">
          <div className="flex gap-6">
            <div className="w-14 h-14 rounded-2xl border border-indigo-500/20 overflow-hidden shrink-0 bg-background p-1 shadow-inner relative">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent opacity-40 z-10" />
              <img
                src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=6366f1&color=fff`}
                alt="Current User"
                className="w-full h-full object-cover rounded-[10px] relative z-0"
              />
            </div>
            <div className="flex-1 space-y-6">
              {!session ? (
                <div className="h-28 flex flex-col items-center justify-center border border-dashed border-border rounded-[32px] bg-muted/5 mt-2 transition-colors">
                  <p className="text-[11px] font-jetbrains-mono text-foreground/30 uppercase tracking-[4px] font-bold">Protocol_Error: Identity_Unverified</p>
                  <Link href="/login" className="text-[10px] font-jetbrains-mono text-indigo-500 hover:text-indigo-400 mt-4 uppercase tracking-[3px] flex items-center gap-2 border border-indigo-500/20 px-4 py-2 rounded-xl bg-indigo-500/5">
                    Invoke_Login_Sequence_01
                  </Link>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="BROADCAST_MESSAGE..."
                  className="w-full bg-transparent border-none outline-none resize-none font-sans text-base text-foreground placeholder:text-foreground/20 mt-2 h-24 transition-colors p-1"
                />
              )}

              {/* Image Previews */}
              {images.length > 0 && session && (
                <div className="flex flex-wrap gap-5 mb-2 px-1">
                  {images.map((img, idx) => (
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={idx} 
                        className="relative w-28 h-28 rounded-[24px] overflow-hidden border border-border shadow-md group"
                    >
                      <Image src={img} alt="Preview" fill className="object-cover" unoptimized />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-border/40 px-1">
                <div className="flex gap-6 items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleUpload}
                    accept="image/*"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !session}
                    className="flex items-center gap-3 text-[10px] font-jetbrains-mono uppercase text-foreground/40 hover:text-indigo-500 transition-all disabled:opacity-30 font-bold tracking-widest"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <ImageIcon size={18} />}
                    <span className="italic">{uploading ? "Uploading..." : "Attach_Data"}</span>
                  </button>
                </div>
                {session ? (
                  <button
                    onClick={handleTransmit}
                    disabled={isTransmitting || uploading || (!content.trim() && images.length === 0)}
                    className="px-8 py-3 bg-indigo-500 text-black font-bold shadow-lg shadow-indigo-500/20 transition-all rounded-[24px] text-[10px] font-jetbrains-mono uppercase tracking-[2px] flex items-center gap-3 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {isTransmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} fill="currentColor" />}
                    <span>{isTransmitting ? "Broadcasting..." : "Transmit_Stream"}</span>
                  </button>
                ) : (
                  <Link href="/login" className="px-8 py-3 bg-muted/10 text-foreground/20 rounded-[24px] text-[10px] font-jetbrains-mono uppercase border border-border/40 hover:bg-muted/20 transition-all cursor-pointer font-bold tracking-widest">
                    Login_Required
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </MagneticCard>

      {/* Feed Stream */}
      <div className="space-y-10">
        {loading ? (
          <div className="py-24 text-center space-y-6">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto opacity-40" />
            <p className="font-jetbrains-mono text-[11px] uppercase tracking-[6px] text-foreground/20 italic font-bold">Establishing_Satellite_Link_Secure...</p>
          </div>
        ) : posts.map((post) => (
          <MagneticCard key={post._id} delay={0.1}>
            <div className="group bg-card/20 hover:bg-card/30 border border-border/40 hover:border-indigo-500/20 p-8 md:p-10 rounded-[50px] backdrop-blur-3xl shadow-lg transition-all duration-500">

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-indigo-500/20 overflow-hidden bg-background p-1 shadow-sm transition-all duration-500 group-hover:scale-105">
                      <img
                        src={post.author?.userImage || `https://ui-avatars.com/api/?name=${post.author?.username?.charAt(0)}&background=6366f1&color=fff`}
                        alt={post.author?.username}
                        className="w-full h-full object-cover rounded-full dark:opacity-80 group-hover:opacity-100"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-[3.5px] border-background shadow-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-4">
                      <h3 className="font-bebas text-xl md:text-2xl tracking-[2px] text-foreground leading-none italic uppercase">
                        {post.author?.username || "Anonymous_Node"}
                      </h3>
                      {session?.user?.email !== post.author?.email && (
                        <button
                          onClick={() => sendFriendRequest(post.author.email)}
                          className="transition-all hover:scale-110 active:scale-95"
                          title={userData?.friends?.includes(post.author.email) ? "Synchronized" : "Request Uplink"}
                        >
                          {userData?.friends?.includes(post.author.email) ? (
                            <UserCheck size={16} className="text-indigo-500" />
                          ) : (
                            <UserPlus size={16} className="text-foreground/20 hover:text-indigo-500 transition-colors" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                       <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          <ShieldCheck size={10} className="text-indigo-500" />
                          <span className="font-jetbrains-mono text-[9px] text-indigo-500 tracking-[2px] uppercase font-bold italic">
                            {post.author?.email === 'nabailahmed303@gmail.com' ? 'CORE_SEC' : 'UPLINK_NODE'}
                          </span>
                       </div>
                       <p className="font-jetbrains-mono text-[9px] text-foreground/30 uppercase tracking-[2px] font-bold">
                         {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-foreground/20 hover:text-indigo-500 hover:bg-muted/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              <div className="mb-8 px-1">
                <p className="text-foreground/90 font-sans text-sm md:text-base leading-relaxed tracking-wide italic font-medium">
                    "{post.content}"
                </p>
              </div>

              {/* Post Images Gallery */}
              {post.images && post.images.length > 0 && (
                <div className={cn(
                    "grid gap-6 mb-10 overflow-hidden rounded-[40px] px-1",
                    post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                )}>
                  {post.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-[32px] overflow-hidden border border-border shadow-inner group/img">
                      <Image src={img} alt="Post Attachment" fill className="object-cover dark:opacity-70 group-hover/img:opacity-100 transition-all duration-700" unoptimized />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-8 mt-10 pt-6 border-t border-border/20 px-1">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-3 group/btn"
                >
                  <div className={cn(
                    "p-3 rounded-[18px] transition-all border border-transparent shadow-sm",
                    post.likes?.includes(session?.user?.email || "")
                        ? "bg-indigo-500/10 border-indigo-500/30"
                        : "bg-muted/10 group-hover/btn:bg-muted/20 group-hover/btn:border-border/40"
                  )}>
                    <Heart size={18} className={cn(
                        "transition-all",
                        post.likes?.includes(session?.user?.email || "")
                            ? "text-indigo-500 fill-indigo-500"
                            : "text-foreground/30 group-hover/btn:text-indigo-500"
                    )} />
                  </div>
                  <span className={cn(
                    "font-jetbrains-mono text-[11px] font-bold tracking-widest transition-colors",
                    post.likes?.includes(session?.user?.email || "") ? "text-indigo-500" : "text-foreground/30 group-hover/btn:text-indigo-500"
                  )}>{post.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => setCommentingId(commentingId === post._id ? null : post._id)}
                  className="flex items-center gap-3 group/btn"
                >
                  <div className={cn(
                    "p-3 rounded-[18px] transition-all border border-transparent shadow-sm",
                    commentingId === post._id
                        ? "bg-indigo-500/10 border-indigo-500/30"
                        : "bg-muted/10 group-hover/btn:bg-muted/20 group-hover/btn:border-border/40"
                  )}>
                    <MessageSquare size={18} className={cn(
                        "transition-all",
                        commentingId === post._id ? "text-indigo-500" : "text-foreground/30 group-hover/btn:text-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "font-jetbrains-mono text-[11px] font-bold tracking-widest transition-colors",
                    commentingId === post._id ? "text-indigo-500" : "text-foreground/30 group-hover/btn:text-foreground"
                  )}>{post.comments?.length || 0}</span>
                </button>

                <button className="flex items-center gap-3 group/btn ml-auto">
                  <div className="p-3 bg-muted/10 group-hover/btn:bg-muted/20 rounded-[18px] transition-all border border-transparent group-hover/btn:border-border/40 shadow-sm">
                    <Share2 size={18} className="text-foreground/30 transition-colors group-hover/btn:text-foreground" />
                  </div>
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
              {commentingId === post._id && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-8 space-y-6 overflow-hidden px-1"
                >
                  <div className="flex gap-5 pt-4">
                    <div className="w-10 h-10 rounded-xl border border-indigo-500/20 overflow-hidden shrink-0 bg-background p-1 shadow-sm">
                      <img
                        src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=6366f1&color=fff`}
                        alt="Current User"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 flex gap-3">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="ADD_TRANSMISSION..."
                        className="flex-1 bg-muted/10 border border-border/40 rounded-2xl px-6 py-3 text-xs text-foreground placeholder:text-foreground/20 focus:border-indigo-500/30 outline-none transition-all uppercase tracking-widest font-bold"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        disabled={!commentText.trim()}
                        className="p-3 bg-indigo-500 text-black rounded-2xl transition-all disabled:opacity-30 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/10"
                      >
                        <Send size={18} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-6 mt-10 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                      {post.comments.map((comment, idx) => (
                        <div key={idx} className="flex gap-4 group/comment text-left">
                          <img
                            src={comment.image || `https://ui-avatars.com/api/?name=${comment.username?.charAt(0)}&background=111&color=fff`}
                            className="w-8 h-8 rounded-xl border border-border/40 object-cover shadow-sm"
                            alt=""
                          />
                          <div className="flex-1">
                            <div className="bg-card/40 rounded-[24px] rounded-tl-none p-4 border border-border/40 shadow-sm backdrop-blur-sm group-hover/comment:border-indigo-500/10 transition-colors">
                              <p className="font-jetbrains-mono text-[9px] text-indigo-500 uppercase tracking-widest mb-2 font-bold italic">{comment.username}</p>
                              <p className="text-foreground/70 text-xs leading-relaxed font-medium italic">"{comment.comment}"</p>
                            </div>
                            <p className="font-jetbrains-mono text-[8px] text-foreground/20 uppercase mt-2 px-2 tracking-widest font-bold">
                              {new Date(comment.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              </AnimatePresence>

            </div>
          </MagneticCard>
        ))}
      </div>

    </div>
  );
}
