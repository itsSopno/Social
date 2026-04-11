"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import { Trash2, AlertTriangle, Loader2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="flex flex-col items-center justify-center py-20 bg-background text-indigo-500 font-jetbrains-mono uppercase italic tracking-[0.3em]">
            <Loader2 className="animate-spin mb-4" size={32} />
            Syncing_Data_Stream...
        </div>
    );

    return (
        <div className="bg-background py-8 px-4 md:px-0 border-t border-border/40">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 px-4">
                    <p className="text-foreground/40 font-jetbrains-mono text-[10px] tracking-[0.5em] mt-2 uppercase italic leading-none">
                        Node Archive: {emailToFetch}
                    </p>
                </header>

                {posts.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-[32px] mx-4 bg-muted/5">
                        <p className="text-foreground/40 font-jetbrains-mono italic uppercase tracking-widest text-sm font-bold">No data nodes found.</p>
                    </div>
                ) : (
                    <div className="space-y-10 px-4">
                        {posts.map((post: any) => (
                            <div key={post._id} className="bg-card/20 border border-border rounded-[32px] p-8 shadow-sm relative group overflow-hidden backdrop-blur-sm">
                                 {/* Scanline Effect */}
                                <div className="absolute inset-x-0 top-0 h-[1px] bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-border relative">
                                            <Image
                                                src={post.author?.userImage || `https://ui-avatars.com/api/?name=${post.author?.username}&background=111&color=fff`}
                                                alt="Profile" fill className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-foreground font-bebas tracking-[2px] text-xl md:text-2xl italic">
                                                    {post.author?.username || "Admin"}
                                                </h3>
                                                <span className="bg-indigo-500/10 text-indigo-500 text-[8px] px-2 py-0.5 rounded-md border border-indigo-500/20 font-bold tracking-widest uppercase">
                                                    UPLINK_NODE
                                                </span>
                                            </div>
                                            <p className="text-foreground/40 font-jetbrains-mono text-[9px] uppercase tracking-widest mt-1.5 font-bold">
                                                {new Date(post.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {isOwner && (
                                        <button
                                            onClick={() => { setSelectedPostId(post._id); setIsModalOpen(true); }}
                                            className="text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all p-3 border border-transparent hover:border-red-500/20"
                                            title="Terminate Post"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="mb-8">
                                    <p className="text-foreground/80 text-sm md:text-base font-light leading-relaxed prose prose-neutral dark:prose-invert italic">
                                        "{post.content}"
                                    </p>
                                </div>

                                {/* Post Image */}
                                {post.images && post.images.length > 0 && (
                                    <div className="relative aspect-[16/9] w-full rounded-[24px] overflow-hidden border border-border bg-muted/20">
                                        <Image
                                            src={post.images[0]}
                                            alt="Archive Data" fill className="object-cover dark:opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 hover:scale-102"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-card border border-red-500/30 p-10 rounded-[40px] max-w-md w-full shadow-2xl relative overflow-hidden"
                    >
                         <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600/50 shadow-[0_0_15px_#ef4444]" />
                        
                        <div className="flex items-center gap-5 text-red-500 mb-8 font-bebas">
                            <AlertTriangle size={36} />
                            <h3 className="font-bold uppercase italic text-3xl tracking-[3px]">Terminate Node?</h3>
                        </div>

                        <p className="text-foreground/60 text-[10px] mb-12 leading-relaxed uppercase tracking-[3px] font-jetbrains-mono font-medium">
                            Confirmation required for data destruction. This action is <span className="text-red-500 font-bold underline">irreversible</span>.
                        </p>

                        <div className="flex gap-4 font-jetbrains-mono">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-6 py-5 border border-border text-muted-foreground uppercase text-[10px] tracking-[0.3em] hover:bg-muted/10 transition-all rounded-3xl"
                            >
                                Abort
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-6 py-5 bg-red-600 text-white font-bold uppercase text-[10px] tracking-[0.3em] shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all rounded-3xl disabled:opacity-50"
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