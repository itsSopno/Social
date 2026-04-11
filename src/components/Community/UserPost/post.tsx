"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import { Trash2, AlertTriangle, Loader2, MoreHorizontal } from "lucide-react";

interface MyArchiveProps {
    userEmail?: string;
}

const MyArchive: React.FC<MyArchiveProps> = ({ userEmail }) => {
    const { data: session } = useSession();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const emailToFetch = userEmail || session?.user?.email;
    const isOwner = !userEmail || userEmail === session?.user?.email;

    // 1. Fetch data using email as params
    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                if (!emailToFetch) return;
                setLoading(true);

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001"}/api/post/get/${emailToFetch}`);

                if (res.data.success) {
                    setPosts(res.data.posts);
                }
            } catch (error) {
                console.error("UPLINK_ERROR: Archive fetch failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPosts();
    }, [emailToFetch]);

    // 2. Delete logic
    const confirmDelete = async () => {
        if (!selectedPostId) return;
        try {
            setDeleting(true);
            const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001"}/api/post/delete/${selectedPostId}`);
            if (res.data.success) {
                setPosts(posts.filter((post: any) => post._id !== selectedPostId));
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("TERMINATION_FAILED: Node removal error", error);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 bg-[#050505] text-indigo-500 font-jetbrains-mono uppercase italic tracking-[0.3em]">
            <Loader2 className="animate-spin mb-4" size={32} />
            Syncing_Data_Stream...
        </div>
    );

    return (
        <div className="bg-[#050505] p-6 md:p-12 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <p className="text-white/20 font-jetbrains-mono text-[10px] tracking-[0.5em] mt-2 uppercase italic">
                        Node Archive: {emailToFetch}
                    </p>
                </header>

                {posts.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-[32px]">
                        <p className="text-white/20 font-jetbrains-mono italic uppercase tracking-widest text-sm">No data nodes found.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {posts.map((post: any) => (
                            <div key={post._id} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-6 shadow-2xl relative group overflow-hidden">
                                 {/* Scanline Effect */}
                                <div className="absolute inset-x-0 top-0 h-[1px] bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-500/30 relative shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                            <Image
                                                src={post.author?.userImage || "/default-avatar.png"}
                                                alt="Profile" fill className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-bebas tracking-widest text-lg md:text-xl">
                                                    {post.author?.username || "Admin"}
                                                </h3>
                                                <span className="bg-indigo-500/10 text-indigo-400 text-[8px] px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold tracking-tighter">
                                                    UPLINK_NODE
                                                </span>
                                            </div>
                                            <p className="text-white/20 font-jetbrains-mono text-[9px] uppercase tracking-widest mt-0.5">
                                                {new Date(post.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {isOwner && (
                                        <button
                                            onClick={() => { setSelectedPostId(post._id); setIsModalOpen(true); }}
                                            className="text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all p-2"
                                            title="Terminate Post"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="mb-6">
                                    <p className="text-white/70 text-sm md:text-base font-light leading-relaxed prose prose-invert italic">
                                        "{post.content}"
                                    </p>
                                </div>

                                {/* Post Image */}
                                {post.images && post.images.length > 0 && (
                                    <div className="relative aspect-[16/9] w-full rounded-[24px] overflow-hidden border border-white/10 bg-black">
                                        <Image
                                            src={post.images[0]}
                                            alt="Archive Data" fill className="object-cover opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 hover:scale-105"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- CINEMATIC DELETE MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0B0E14] border border-red-500/30 p-8 rounded-[40px] max-w-md w-full shadow-[0_0_80px_rgba(239,68,68,0.1)] relative overflow-hidden"
                    >
                         <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600/50 shadow-[0_0_15px_#ef4444]" />
                        
                        <div className="flex items-center gap-4 text-red-500 mb-6 font-bebas">
                            <AlertTriangle size={32} />
                            <h3 className="font-bold uppercase italic text-2xl tracking-[2px]">Terminate Node?</h3>
                        </div>

                        <p className="text-gray-500 text-xs mb-10 leading-relaxed uppercase tracking-[3px] font-jetbrains-mono">
                            Confirmation required for data destruction. This action is <span className="text-red-500 font-bold underline">irreversible</span>.
                        </p>

                        <div className="flex gap-4 font-jetbrains-mono">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-6 py-4 border border-white/5 text-white/40 uppercase text-[10px] tracking-[0.3em] hover:bg-white/5 transition-all rounded-2xl"
                            >
                                Abort
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-6 py-4 bg-red-600 text-white font-bold uppercase text-[10px] tracking-[0.3em] shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all rounded-2xl disabled:opacity-50"
                                disabled={deleting}
                            >
                                {deleting ? "Terminating..." : "Confirm"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MyArchive;