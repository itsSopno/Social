"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MagneticCard from "@/components/Community/MagneticCard";
import { MessageSquare, Heart, Share2, MoreHorizontal, Image as ImageIcon, Loader2, X, Send } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import { useGlobalContext } from "@/context/globalContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

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
  likes: string[]; // Changed to string array of user IDs
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
  const { allUsers } = useGlobalContext()
  const currentUserData = allUsers?.find(
    (user: any) => user.email === session?.user?.email
  );
  // Fetch Posts
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
        userID: session.user.email // Using email as ID for consistency
      }, {
        headers: {
          Authorization: `Bearer ${(session as any)?.user?.backendToken}`
        },
        withCredentials: true
      });

      if (res.data.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
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
      }
    } catch {
      toast.error("TRANSMISSION_FAILED: Packet lost");
    }
  };

  return (
    <div className="space-y-8 pb-32 md:pb-0">

      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bebas text-4xl md:text-5xl tracking-[4px] text-white flex items-center gap-4">
            Küresel Akış <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(217,255,0,0.8)]" />
          </h1>
          <p className="font-jetbrains-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">
            Canlı Telemetri Gösteriliyor...
          </p>
        </div>

        {/* Filter / Sort Button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all text-xs font-jetbrains-mono uppercase text-white/60 hover:text-white">
          <span>Sort By:</span>
          <span className="text-indigo-500">Latest</span>
        </button>
      </div>

      {/* Post Input Card */}
      <MagneticCard delay={0.2}>
        <div className=" p-6 backdrop-blur-3xl">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full border border-indigo-500/20 overflow-hidden shrink-0 bg-[#050505] p-0.5">
              <img
                src={session?.user?.image || "https://ui-avatars.com/api/?name=User&background=6366f1&color=050505"}
                alt="Current User"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex-1">
              {!session ? (
                <div className="h-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] mt-2">
                  <p className="text-[10px] font-jetbrains-mono text-white/30 uppercase tracking-[3px]">Protocol_Error: Identity_Unverified</p>
                  <Link href="/login" className="text-[9px] font-jetbrains-mono text-indigo-500 hover:underline mt-2 uppercase tracking-widest">Invoke_Login_Sequence</Link>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="BROADCAST_MESSAGE..."
                  className="w-full bg-transparent border-none outline-none resize-none font-sans text-sm text-white placeholder:text-white/20 mt-2 h-20"
                />
              )}

              {/* Image Previews */}
              {images.length > 0 && session && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group">
                      <Image src={img} alt="Preview" fill className="object-cover" unoptimized />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.05] mt-2">
                <div className="flex gap-4 items-center">
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
                    className="flex items-center gap-2 text-[10px] font-jetbrains-mono uppercase text-white/40 hover:text-indigo-500 transition-colors disabled:opacity-30 disabled:hover:text-white/40"
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                    {uploading ? "Uploading..." : "Attach_Data"}
                  </button>
                </div>
                {session ? (
                  <button
                    onClick={handleTransmit}
                    disabled={isTransmitting || uploading || (!content.trim() && images.length === 0)}
                    className="px-6 py-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-black hover:shadow-[0_0_20px_rgba(217,255,0,0.3)] transition-all rounded-xl text-xs font-jetbrains-mono uppercase border border-indigo-500/20 hover:border-transparent flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
                  >
                    {isTransmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {isTransmitting ? "Broadcasting..." : "Transmit"}
                  </button>
                ) : (
                  <Link href="/login" className="px-6 py-2 bg-white/5 text-white/20 rounded-xl text-xs font-jetbrains-mono uppercase border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    Login_Required
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </MagneticCard>

      {/* Feed Stream */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="font-jetbrains-mono text-[10px] uppercase tracking-[4px] text-white/20">Establishing_Satellite_Link...</p>
          </div>
        ) : posts.map((post) => (
          <MagneticCard key={post._id} delay={0.1}>
            <div className="group bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] border-white/[0.05] p-6 md:p-8 backdrop-blur-3xl transition-colors duration-500">

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-indigo-500/20 overflow-hidden bg-[#050505] p-0.5">
                      <img
                        src={post.author?.userImage || `https://ui-avatars.com/api/?name=${post.author?.username?.charAt(0)}`}
                        alt={post.author?.username}
                        className="w-full h-full object-cover rounded-full opacity-80"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-[2px] border-[#050505]" />
                  </div>
                  <div>
                    <h3 className="font-bebas text-lg md:text-xl tracking-[2px] text-white leading-none flex items-center gap-3">
                      {post.author?.username || "Anonymous_Node"}
                      <span className="font-jetbrains-mono text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 tracking-widest uppercase italic">
                        {post.author?.email === 'nabailahmed303@gmail.com' ? 'CORE_SEC' : 'UPLINK_NODE'}
                      </span>
                    </h3>
                    <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase mt-1">
                      {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed tracking-wide mb-6">
                {post.content}
              </p>

              {/* Post Images Gallery */}
              {post.images && post.images.length > 0 && (
                <div className={`grid gap-4 mb-8 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
                      <Image src={img} alt="Post Attachment" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 mt-8 pt-4 border-t border-white/[0.02]">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-2 group/btn"
                >
                  <div className={`p-2 rounded-full transition-colors border border-transparent ${post.likes?.includes(session?.user?.email || "")
                    ? "bg-indigo-500/10 border-indigo-500/20"
                    : "bg-white/[0.02] group-hover/btn:bg-white/[0.1] group-hover/btn:border-white/[0.05]"
                    }`}>
                    <Heart size={16} className={`${post.likes?.includes(session?.user?.email || "")
                      ? "text-indigo-500 fill-indigo-500"
                      : "text-white/40 group-hover/btn:text-indigo-500"
                      } transition-colors`} />
                  </div>
                  <span className={`font-jetbrains-mono text-[10px] ${post.likes?.includes(session?.user?.email || "") ? "text-indigo-500" : "text-white/40 group-hover/btn:text-indigo-500"
                    } transition-colors`}>{post.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => setCommentingId(commentingId === post._id ? null : post._id)}
                  className="flex items-center gap-2 group/btn"
                >
                  <div className={`p-2 rounded-full transition-colors border border-transparent ${commentingId === post._id
                    ? "bg-white/10 border-white/20"
                    : "bg-white/[0.02] group-hover/btn:bg-white/[0.1] group-hover/btn:border-white/[0.05]"
                    }`}>
                    <MessageSquare size={16} className="text-white/40 group-hover/btn:text-white transition-colors" />
                  </div>
                  <span className="font-jetbrains-mono text-[10px] text-white/40 group-hover/btn:text-white transition-colors">{post.comments?.length || 0}</span>
                </button>

                <button className="flex items-center gap-2 group/btn ml-auto">
                  <div className="p-2 rounded-full bg-white/[0.02] group-hover/btn:bg-white/[0.1] transition-colors border border-transparent group-hover/btn:border-white/[0.05]">
                    <Share2 size={16} className="text-white/40 group-hover/btn:text-white transition-colors" />
                  </div>
                </button>
              </div>

              {/* Comments Section */}
              {commentingId === post._id && (
                <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full border border-indigo-500/20 overflow-hidden shrink-0 bg-[#050505] p-0.5">
                      <img
                        src={session?.user?.image || "https://ui-avatars.com/api/?name=User&background=6366f1&color=050505"}
                        alt="User"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="ADD_COMMENT..."
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:border-indigo-500/30 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      />
                      <button
                        onClick={() => handleAddComment(post._id)}
                        disabled={!commentText.trim()}
                        className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-black rounded-xl transition-all disabled:opacity-30"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>

                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-4 mt-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {post.comments.map((comment, idx) => (
                        <div key={idx} className="flex gap-3 group/comment">
                          <img
                            src={comment.image || `https://ui-avatars.com/api/?name=${comment.username?.charAt(0)}`}
                            className="w-6 h-6 rounded-full border border-white/10"
                            alt=""
                          />
                          <div className="flex-1">
                            <div className="bg-white/[0.03] rounded-2xl rounded-tl-none p-3 border border-white/[0.05]">
                              <p className="font-jetbrains-mono text-[8px] text-indigo-500 uppercase tracking-widest mb-1">{comment.username}</p>
                              <p className="text-white/60 text-[11px] leading-relaxed">{comment.comment}</p>
                            </div>
                            <p className="font-jetbrains-mono text-[7px] text-white/20 uppercase mt-1 px-1">
                              {new Date(comment.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </MagneticCard>
        ))}
      </div>

    </div>
  );
}
