"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Mail,
    MessageSquare,
    ArrowLeft,
    Terminal,
    UserPlus,
    UserCheck,
    Loader2,
    Calendar,
    Hash,
    ShieldCheck,
    LayoutGrid,
    Search,
    Globe
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGlobalContext, IUserData } from "@/context/globalContext";
import MyArchive from "@/components/Community/UserPost/post";
import axios from "axios";

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const email = params.email as string;
    const decodedEmail = decodeURIComponent(email);
    const { data: session } = useSession();
    const { 
        userData, 
        allUsers,
        sendFriendRequest, 
        setActiveChat 
    } = useGlobalContext();

    const [profileData, setProfileData] = useState<IUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [postCount, setPostCount] = useState(0);

    const isSelf = session?.user?.email === decodedEmail;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001"}/api/user/get/${decodedEmail}`);
                if (res.data.success) {
                    setProfileData(res.data.user);
                    
                    // Fetch post count specifically
                    const postsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001"}/api/post/get/${decodedEmail}`);
                    if (postsRes.data.success) {
                        setPostCount(postsRes.data.posts.length);
                    }
                }
            } catch (error) {
                console.error("PROFILE_FETCH_ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        if (decodedEmail) fetchProfile();
    }, [decodedEmail]);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin" />
                <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[6px]">Syncing_Node...</p>
            </div>
        </div>
    );

    if (!profileData) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
             <div className="max-w-md w-full text-center space-y-8">
                <h2 className="font-bebas text-6xl text-foreground tracking-widest italic">Node_Lost</h2>
                <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[4px]">Target identity untraceable. Sequence halted.</p>
                <button onClick={() => router.back()} className="block w-full py-5 bg-foreground text-background font-bebas text-2xl tracking-widest hover:opacity-90 transition-all">
                    Return to Directory
                </button>
             </div>
        </div>
    );

    const isFriend = userData?.friends?.includes(decodedEmail);
    return (
        <main className="pt-2">
                {/* --- CINEMATIC HEADER SECTION --- */}
                <div className="relative w-full h-[40vh] overflow-hidden group rounded-[48px] border border-border/40">
                    {/* High-End Cover Transition */}
                    {profileData.coverImage ? (
                        <div className="absolute inset-0">
                            <img 
                                src={profileData.coverImage} 
                                alt="Cover" 
                                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_rgba(99,102,241,0.05)_0%,_transparent_50%,_rgba(99,102,241,0.05)_100%)] flex items-center justify-center">
                            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                        </div>
                    )}

                    {/* Technical Metadata Overlays */}
                    <div className="absolute inset-0 pointer-events-none px-8 py-10 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <p className="font-jetbrains-mono text-[8px] text-foreground/40 uppercase tracking-[6px] font-bold">REMOTE_ID_STREAM</p>
                                <p className="font-jetbrains-mono text-[10px] text-indigo-500/60 font-bold italic uppercase tracking-widest">SIGNAL_SOURCE_{profileData._id?.slice(-8).toUpperCase() || "EXTERNAL_NODE"}</p>
                             </div>
                             <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl">
                                <p className="font-jetbrains-mono text-[8px] text-foreground/30 uppercase tracking-widest font-bold">PROTOCOL_VERSION: 1.0.4</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* --- EXTERNAL DOSSIER CONTENT --- */}
                <div className="relative -mt-32 z-10 px-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                        
                        {/* LEFT COLUMN: Dossier Identity (4 cols) */}
                        <div className="md:col-span-12 lg:col-span-4 space-y-8">
                             {/* Primary Identity Card */}
                             <div className="bg-card/30 border border-border/40 rounded-[48px] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group/id">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none group-hover/id:bg-indigo-500/10 transition-colors duration-700" />
                                
                                <div className="flex flex-col items-center text-center space-y-8">
                                    {/* Elevated Avatar */}
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full opacity-0 group-hover/id:opacity-100 transition-opacity duration-1000" />
                                        <div className="h-48 w-48 rounded-[40px] overflow-hidden border-2 border-indigo-500/20 bg-background p-2 shadow-inner relative z-10 transition-transform duration-700 group-hover/id:scale-105">
                                            <img
                                                src={profileData.image || `https://ui-avatars.com/api/?name=${profileData.name}&background=111&color=fff`}
                                                alt={profileData.name}
                                                className="w-full h-full object-cover rounded-[32px] dark:opacity-80 group-hover/id:opacity-100 transition-all duration-700"
                                            />
                                        </div>
                                        <div className={cn("absolute -bottom-2 -right-2 p-3 rounded-2xl shadow-2xl z-20 border-4 border-background transition-colors", isFriend ? "bg-indigo-500 text-black" : "bg-muted text-foreground/20")}>
                                            <Hash size={20} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h1 className="font-bebas text-5xl tracking-widest leading-none italic">
                                            {profileData.name} <span className="text-foreground/40">{profileData.lastName}</span>
                                        </h1>
                                        <div className="flex items-center justify-center gap-4">
                                            {profileData.isVerified && <span className="font-jetbrains-mono text-[9px] text-indigo-500 uppercase tracking-widest font-bold">VERIFIED_NODE</span>}
                                            {profileData.isVerified && <span className="w-1 h-1 bg-border rounded-full" />}
                                            <span className="font-jetbrains-mono text-[9px] text-foreground/30 uppercase tracking-widest font-bold italic">TARGET_NODE_EXT</span>
                                        </div>
                                    </div>

                                    <div className="w-full h-[1px] bg-border/20" />

                                    <div className="w-full grid grid-cols-2 gap-4">
                                        <div className="bg-muted/5 border border-border/40 p-5 rounded-3xl text-center group/stat cursor-pointer hover:bg-muted/10 transition-all">
                                            <p className="font-bebas text-4xl text-foreground group-hover/stat:text-indigo-500 transition-colors leading-none">{postCount}</p>
                                            <p className="font-jetbrains-mono text-[8px] text-foreground/30 uppercase tracking-widest mt-1 font-bold italic">EXPOSURES</p>
                                        </div>
                                        <div className="bg-muted/5 border border-border/40 p-5 rounded-3xl text-center group/stat cursor-pointer hover:bg-muted/10 transition-all">
                                            <p className="font-bebas text-4xl text-foreground group-hover/stat:text-indigo-500 transition-colors leading-none">{profileData.friends?.length || 0}</p>
                                            <p className="font-jetbrains-mono text-[8px] text-foreground/30 uppercase tracking-widest mt-1 font-bold italic">K_LINKS</p>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        {!isSelf && (
                                            <>
                                                {isFriend ? (
                                                    <div className="w-full py-5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-jetbrains-mono text-[10px] uppercase tracking-[4px] font-bold rounded-3xl flex items-center justify-center gap-4">
                                                       <UserCheck size={16} /> UPLINK_SYNCHRONIZED
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => sendFriendRequest(profileData.email)}
                                                        className="w-full py-5 bg-foreground text-background font-jetbrains-mono text-[10px] uppercase tracking-[4px] font-bold rounded-3xl hover:opacity-90 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-4 group/btn"
                                                    >
                                                        <UserPlus size={16} className="group-hover/btn:translate-x-1 transition-transform" /> INITIATE_NODE_SYNC
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setActiveChat(profileData.email)}
                                                    className="w-full py-5 border border-border/40 font-jetbrains-mono text-[10px] uppercase tracking-[4px] font-bold rounded-3xl hover:bg-muted/10 transition-all flex items-center justify-center gap-4 group/btn"
                                                >
                                                    <MessageSquare size={16} className="text-foreground/20 group-hover/btn:text-indigo-500 transition-colors" /> ESTABLISH_CHANNEL
                                                </button>
                                            </>
                                        )}
                                        {isSelf && (
                                            <Link href="/CreateProfile" className="w-full py-5 bg-foreground text-background font-jetbrains-mono text-[10px] uppercase tracking-[4px] font-bold rounded-3xl flex items-center justify-center gap-4 hover:opacity-90 transition-all">
                                                ADJUST_SELF_NODE
                                            </Link>
                                        )}
                                    </div>
                                </div>
                             </div>

                             {/* Metadata Matrix */}
                             <div className="bg-card/20 border border-border/40 rounded-[48px] p-10 backdrop-blur-3xl space-y-10">
                                <div className="space-y-4">
                                    <h3 className="font-bebas text-3xl tracking-widest text-foreground/40 italic uppercase">Node_Manifesto</h3>
                                    <p className="text-foreground/70 text-sm leading-relaxed italic font-medium px-2">
                                        "{profileData.Bio || "No transmission recorded in user bio field. Signal is silent but present."}"
                                    </p>
                                </div>

                                <div className="w-full h-[1px] bg-border/10" />

                                <div className="space-y-6 px-2">
                                    {[
                                        { icon: MapPin, label: "NODE_VECTOR", value: profileData.address || "GRID_REDACTED" },
                                        { icon: Mail, label: "COMM_CHANNEL", value: profileData.email },
                                        { icon: Globe, label: "INIT_SEQUENCE", value: profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) : "UNKNOWN" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 items-center group">
                                            <div className="p-3 bg-muted/10 rounded-xl border border-border/40 text-foreground/20 group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-all duration-500">
                                                <item.icon size={16} />
                                            </div>
                                            <div>
                                                <p className="font-jetbrains-mono text-[8px] text-foreground/20 uppercase tracking-widest font-bold mb-0.5 italic">{item.label}</p>
                                                <p className="font-jetbrains-mono text-[10px] text-foreground/70 font-medium uppercase tracking-widest font-bold">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>

                        {/* RIGHT COLUMN: Systems & Archives (8 cols) */}
                        <div className="lg:col-span-8 space-y-12">
                            
                            {/* Neural Network Graph Section */}
                            <div className="bg-card/20 border border-border/40 rounded-[56px] p-12 backdrop-blur-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                    <LayoutGrid size={240} />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 relative z-10 px-2">
                                    <div className="space-y-2">
                                        <h2 className="font-bebas text-6xl tracking-widest italic leading-none text-foreground/90">UPLINK_CONNECTIONS</h2>
                                        <p className="font-jetbrains-mono text-[10px] text-foreground/30 uppercase tracking-[6px] font-bold italic">Authenticated_Mutual_Node_Network</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-8 relative z-10 px-2 min-h-[300px]">
                                    {profileData.friends?.map((email) => {
                                        const friend = allUsers.find(u => u.email === email);
                                        if (!friend) return null;
                                        return (
                                            <Link 
                                                key={email}
                                                href={`/Community/Profile/${encodeURIComponent(email)}`}
                                                className="group/node relative block aspect-[4/5] rounded-[32px] overflow-hidden border border-border/60 group-hover/node:border-indigo-500/50 transition-all duration-700 bg-background shadow-2xl"
                                            >
                                                <img 
                                                    src={friend.image || `https://ui-avatars.com/api/?name=${friend.name}&background=111&color=fff`} 
                                                    alt={friend.name}
                                                    className="w-full h-full object-cover grayscale opacity-60 group-hover/node:grayscale-0 group-hover/node:opacity-100 group-hover/node:scale-110 transition-all duration-1000"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/node:opacity-100 transition-opacity" />
                                                <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover/node:opacity-100 transition-all translate-y-2 group-hover/node:translate-y-0 duration-500 px-3">
                                                    <p className="font-jetbrains-mono text-[7px] text-white uppercase tracking-widest font-bold truncate italic">{friend.name}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    
                                    {(!profileData.friends || profileData.friends.length === 0) && (
                                        <div className="col-span-full py-24 text-center border-2 border-dashed border-border/10 rounded-[48px] bg-muted/5">
                                            <p className="font-jetbrains-mono text-[10px] text-foreground/10 uppercase tracking-[8px] italic font-bold">ZERO_PUBLIC_UPLINKS_DETECTED</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Data Archives Flow Section */}
                            <div className="space-y-12">
                                <div className="flex items-center justify-between px-6">
                                    <div className="space-y-1">
                                        <h2 className="font-bebas text-7xl tracking-widest italic leading-none text-foreground/90">REMOTE_ARCHIVES</h2>
                                        <p className="font-jetbrains-mono text-[10px] text-foreground/30 uppercase tracking-[6px] font-bold italic">Authenticated_External_Log_Transmission</p>
                                    </div>
                                    <div className="w-16 h-16 bg-muted/10 border border-border/40 rounded-3xl flex items-center justify-center text-foreground/20">
                                        <Terminal size={28} />
                                    </div>
                                </div>

                                <div className="bg-card/20 border border-border/40 rounded-[64px] p-4 backdrop-blur-3xl overflow-hidden shadow-2xl">
                                     <MyArchive userEmail={decodedEmail} />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
    );
}
