"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MagneticCard from "@/components/Community/MagneticCard";
import { MessageSquare, Heart, Share2, MoreHorizontal, Image as ImageIcon, Loader2, X, Send, UserPlus, UserCheck, ShieldCheck, Settings, LayoutGrid } from "lucide-react";
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
      {/* Global Stream Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
            <div>
              <h1 className="font-bebas text-6xl md:text-7xl tracking-[8px] text-foreground flex items-center gap-6 italic leading-none">
                GLOBAL_STREAM <span className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
              </h1>
              <p className="font-jetbrains-mono text-[11px] text-foreground/40 uppercase tracking-[6px] mt-6 font-bold flex items-center gap-3">
                <span className="w-2 h-[1px] bg-indigo-500/40" /> Displaying live telemetry from active nodes...
              </p>
            </div>
          </div>


          {/* Command Center: High-End Post Input */}
          <MagneticCard delay={0.2}>
            <div className="bg-card/20 border border-border/40 p-10 rounded-[48px] backdrop-blur-3xl shadow-2xl relative overflow-hidden group/console">
              {/* Decorative Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
              
              <div className="flex gap-8 relative z-10">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] border-2 border-indigo-500/20 overflow-hidden shrink-0 bg-background p-1.5 shadow-2xl transition-transform group-hover/console:scale-105 duration-500">
                    <img
                      src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=6366f1&color=fff`}
                      alt="Current User"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div className="w-0.5 h-full bg-border/20 rounded-full" />
                </div>

                <div className="flex-1 space-y-8">
                  <div className="flex items-center justify-between">
                    <p className="font-jetbrains-mono text-[10px] text-indigo-500 uppercase tracking-[4px] font-bold">Sequence_Initiator_v4.0</p>
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/5 rounded-full border border-indigo-500/10">
                       <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                       <span className="text-[8px] font-jetbrains-mono text-foreground/40 uppercase tracking-widest font-bold">Channel_Active</span>
                    </div>
                  </div>

                  {!session ? (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-border/60 rounded-[32px] bg-muted/5 group-hover/console:border-indigo-500/30 transition-all">
                      <p className="text-[11px] font-jetbrains-mono text-foreground/30 uppercase tracking-[4px] font-bold">Identity_Mismatch: Link_Encrypted</p>
                      <Link href="/login" className="px-8 py-3 bg-foreground text-background font-jetbrains-mono text-[10px] uppercase tracking-[3px] mt-6 rounded-2xl hover:opacity-80 transition-all font-bold">
                        Decrypt_Access_Key
                      </Link>
                    </div>
                  ) : (
                    <div className="relative">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="INPUT_TRANSMISSION_CONTENT_HERE..."
                        className="w-full bg-transparent border-none outline-none resize-none font-sans text-lg text-foreground placeholder:text-foreground/10 h-32 transition-all p-1 italic leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Attachment Matrix */}
                  {images.length > 0 && session && (
                    <div className="flex flex-wrap gap-6 px-1">
                      <AnimatePresence>
                        {images.map((img, idx) => (
                          <motion.div 
                              initial={{ scale: 0.8, opacity: 0, y: 10 }}
                              animate={{ scale: 1, opacity: 1, y: 0 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              key={idx} 
                              className="relative w-32 h-32 rounded-[32px] overflow-hidden border-2 border-border/40 shadow-2xl group/img"
                          >
                            <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform group-hover/img:scale-110 duration-700" />
                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                            <button
                              onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-3 right-3 p-2 bg-black/80 text-white rounded-xl opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500 shadow-xl"
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-8 border-t border-border/20">
                    <div className="flex gap-8 items-center">
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
                        className="flex items-center gap-4 text-[10px] font-jetbrains-mono uppercase text-foreground/40 hover:text-indigo-500 transition-all disabled:opacity-30 font-bold tracking-[3px] group/btn"
                      >
                        <div className="p-3 bg-muted/10 rounded-xl group-hover/btn:bg-indigo-500/10 transition-colors">
                          {uploading ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <ImageIcon size={18} />}
                        </div>
                        <span className="italic">{uploading ? "Analyzing_Data..." : "Attachment_Protocol"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {session ? (
                        <button
                          onClick={handleTransmit}
                          disabled={isTransmitting || uploading || (!content.trim() && images.length === 0)}
                          className="px-10 py-4 bg-foreground text-background font-bold shadow-2xl transition-all rounded-[24px] text-[10px] font-jetbrains-mono uppercase tracking-[3px] flex items-center gap-4 hover:scale-105 active:scale-95 disabled:opacity-50 group/transmit"
                        >
                          {isTransmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                          <span>{isTransmitting ? "Broadcasting..." : "Execute_Broadcast"}</span>
                        </button>
                      ) : (
                        <div className="font-jetbrains-mono text-[9px] text-foreground/20 uppercase tracking-widest italic font-bold">Auth_Sequence_Pending</div>
                      )}
                    </div>
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
            ) : (
              posts.map((post) => (
                <MagneticCard key={post._id} delay={0.1}>
                  <div className="group/card bg-card/20 hover:bg-card/30 border border-border/40 hover:border-indigo-500/20 p-10 md:p-12 rounded-[56px] backdrop-blur-3xl shadow-lg transition-all duration-700 relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="relative group/avatar">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-indigo-500/20 overflow-hidden bg-background p-1.5 shadow-2xl transition-all duration-700 group-hover/card:scale-110 group-hover/card:border-indigo-500/40">
                            <img
                              src={post.author?.userImage || `https://ui-avatars.com/api/?name=${post.author?.username?.charAt(0)}&background=6366f1&color=fff`}
                              alt={post.author?.username}
                              className="w-full h-full object-cover rounded-full dark:opacity-80 group-hover/card:opacity-100 transition-all duration-700"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-[4px] border-background shadow-xl" />
                        </div>
                        <div>
                          <div className="flex items-center gap-5">
                            <Link href={`/Community/Profile/${encodeURIComponent(post.author?.email)}`} className="font-bebas text-3xl md:text-4xl tracking-[2px] text-foreground leading-none italic uppercase hover:text-indigo-500 transition-colors">
                              {post.author?.username || "Anonymous_Node"}
                            </Link>
                            {session?.user?.email !== post.author?.email && (
                              <button
                                onClick={() => sendFriendRequest(post.author.email)}
                                className="p-2 bg-muted/10 rounded-xl transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-border/40"
                                title={userData?.friends?.includes(post.author.email) ? "Synchronized" : "Request Uplink"}
                              >
                                {userData?.friends?.includes(post.author.email) ? (
                                  <UserCheck size={14} className="text-indigo-500" />
                                ) : (
                                  <UserPlus size={14} className="text-foreground/20 hover:text-indigo-500 transition-colors" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                             <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                                <ShieldCheck size={10} className="text-indigo-500" />
                                <span className="font-jetbrains-mono text-[8px] text-indigo-500 tracking-[2px] uppercase font-bold italic">
                                  {post.author?.email === 'nabailahmed303@gmail.com' ? 'CORE_SEC' : 'UPLINK_NODE'}
                                </span>
                             </div>
                             <p className="font-jetbrains-mono text-[9px] text-foreground/20 uppercase tracking-[3px] font-bold">
                               {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                             </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="p-3.5 text-foreground/20 hover:text-indigo-400 hover:bg-muted/10 rounded-2xl transition-all opacity-0 group-hover/card:opacity-100 border border-transparent hover:border-border/40">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-10 px-2 relative z-10">
                      <p className="text-foreground/80 font-sans text-base md:text-lg leading-[1.8] tracking-wide italic font-medium max-w-3xl">
                          "{post.content}"
                      </p>
                    </div>

                    {/* Post Images Gallery */}
                    {post.images && post.images.length > 0 && (
                      <div className={cn(
                          "grid gap-8 mb-12 overflow-hidden rounded-[48px] px-1 relative z-10",
                          post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                      )}>
                        {post.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-video rounded-[36px] overflow-hidden border border-border/40 shadow-inner group/img">
                            <img src={img} alt="Post Attachment" className="w-full h-full object-cover dark:opacity-60 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-10 mt-12 pt-8 border-t border-border/10 px-2 relative z-10">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center gap-4 group/btn"
                      >
                        <div className={cn(
                          "p-4 rounded-[22px] transition-all border border-transparent shadow-2xl",
                          post.likes?.includes(session?.user?.email || "")
                              ? "bg-indigo-500/20 border-indigo-500/30"
                              : "bg-muted/5 group-hover/btn:bg-muted/10 group-hover/btn:border-border/40"
                        )}>
                          <Heart size={20} className={cn(
                              "transition-all",
                              post.likes?.includes(session?.user?.email || "")
                                  ? "text-indigo-500 fill-indigo-500"
                                  : "text-foreground/20 group-hover/btn:text-indigo-500"
                          )} />
                        </div>
                        <span className={cn(
                          "font-jetbrains-mono text-xs font-bold tracking-[3px] transition-colors",
                          post.likes?.includes(session?.user?.email || "") ? "text-indigo-500" : "text-foreground/20 group-hover/btn:text-indigo-500"
                        )}>{post.likes?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => setCommentingId(commentingId === post._id ? null : post._id)}
                        className="flex items-center gap-4 group/btn"
                      >
                        <div className={cn(
                          "p-4 rounded-[22px] transition-all border border-transparent shadow-2xl",
                          commentingId === post._id
                              ? "bg-indigo-500/20 border-indigo-500/30"
                              : "bg-muted/5 group-hover/btn:bg-muted/10 group-hover/btn:border-border/40"
                        )}>
                          <MessageSquare size={20} className={cn(
                              "transition-all",
                              commentingId === post._id ? "text-indigo-500" : "text-foreground/20 group-hover/btn:text-foreground"
                          )} />
                        </div>
                        <span className={cn(
                          "font-jetbrains-mono text-xs font-bold tracking-[3px] transition-colors",
                          commentingId === post._id ? "text-indigo-500" : "text-foreground/20 group-hover/btn:text-foreground"
                        )}>{post.comments?.length || 0}</span>
                      </button>

                      <button className="flex items-center gap-4 group/btn ml-auto">
                        <div className="p-4 bg-muted/5 group-hover/btn:bg-muted/10 rounded-[22px] transition-all border border-transparent group-hover/btn:border-border/40 shadow-2xl">
                          <Share2 size={20} className="text-foreground/20 transition-colors group-hover/btn:text-foreground" />
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
                          className="mt-10 space-y-8 overflow-hidden px-2 border-t border-border/10 pt-10"
                      >
                        <div className="flex gap-6">
                          <div className="w-12 h-12 rounded-xl border border-indigo-500/20 overflow-hidden shrink-0 bg-background p-1 shadow-2xl">
                            <img
                              src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=6366f1&color=fff`}
                              alt="Current User"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 flex gap-4">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="ADD_TRANSMISSION..."
                              className="flex-1 bg-muted/5 border border-border/40 rounded-2xl px-8 py-4 text-xs text-foreground placeholder:text-foreground/10 focus:border-indigo-500/30 outline-none transition-all uppercase tracking-widest font-bold italic"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                            />
                            <button
                              onClick={() => handleAddComment(post._id)}
                              disabled={!commentText.trim()}
                              className="px-6 bg-foreground text-background rounded-2xl transition-all disabled:opacity-30 hover:scale-105 active:scale-95 shadow-2xl"
                            >
                              <Send size={18} fill="currentColor" />
                            </button>
                          </div>
                        </div>

                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-8 max-h-96 overflow-y-auto pr-6 custom-scrollbar">
                            {post.comments.map((comment, idx) => (
                              <div key={idx} className="flex gap-6 group/comment text-left">
                                <img
                                  src={comment.image || `https://ui-avatars.com/api/?name=${comment.username?.charAt(0)}&background=111&color=fff`}
                                  className="w-10 h-10 rounded-2xl border border-border/40 object-cover shadow-2xl"
                                  alt=""
                                />
                                <div className="flex-1 space-y-3">
                                  <div className="bg-card/40 rounded-[32px] rounded-tl-none p-6 border border-border/20 shadow-xl backdrop-blur-3xl group-hover/comment:border-indigo-500/20 transition-all">
                                    <p className="font-jetbrains-mono text-[9px] text-indigo-500 uppercase tracking-[4px] mb-3 font-bold italic">{comment.username}</p>
                                    <p className="text-foreground/80 text-sm leading-relaxed font-medium italic">"{comment.comment}"</p>
                                  </div>
                                  <p className="font-jetbrains-mono text-[8px] text-foreground/20 uppercase px-4 tracking-[4px] font-bold">
                                    {new Date(comment.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit', month: 'short' })}
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
              ))
            )}
            </div>
        </div>
    );
}

