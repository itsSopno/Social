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
    Hash
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

    const isSelf = session?.user?.email === decodedEmail;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001"}/api/user/get/${decodedEmail}`);
                if (res.data.success) {
                    setProfileData(res.data.user);
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
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background pb-20">
            {/* Minimal Header */}
            <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-4 group transition-opacity hover:opacity-70">
                        <ArrowLeft size={18} className="text-muted-foreground" />
                        <span className="font-jetbrains-mono text-[11px] uppercase tracking-[4px]">Return</span>
                    </button>
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                </div>
            </nav>

            <main className="pt-32 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: Fixed Bio & Info */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="sticky top-32">
                            <div className="space-y-8">
                                <div className="relative inline-block">
                                    <div className="h-48 w-48 rounded-[2rem] overflow-hidden border border-border bg-muted/10">
                                        <img
                                            src={profileData.image || `https://ui-avatars.com/api/?name=${profileData.name}&background=111&color=fff`}
                                            alt={profileData.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={cn("absolute -bottom-2 -right-2 p-2 rounded-xl shadow-2xl", isFriend ? "bg-indigo-500 text-black" : "bg-muted/30 text-muted-foreground")}>
                                        <Hash size={16} />
                                    </div>
                                </div>

                                <div>
                                    <h1 className="font-bebas text-7xl uppercase italic leading-none tracking-tight">
                                        {profileData.name} <br/>
                                        <span className="text-muted-foreground/30">{profileData.lastName}</span>
                                    </h1>
                                    <p className="mt-4 font-jetbrains-mono text-[10px] text-indigo-500 uppercase tracking-[4px] opacity-70">Remote_Node_Detected</p>
                                </div>

                                <div className="space-y-6 pt-8 border-t border-border/40">
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                                        {profileData.Bio || "No transmission recorded in user bio field."}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 pt-4">
                                        {!isSelf && (
                                            <>
                                                {isFriend ? (
                                                    <div className="px-6 py-3 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-jetbrains-mono text-[10px] uppercase tracking-[2px]">
                                                        Uplink_Established
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => sendFriendRequest(profileData.email)}
                                                        className="px-6 py-3 bg-foreground text-background font-jetbrains-mono text-[10px] uppercase tracking-[2px] hover:opacity-80 transition-all flex items-center gap-2"
                                                    >
                                                        <UserPlus size={14} /> Request_Sync
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setActiveChat(profileData.email)}
                                                    className="px-6 py-3 border border-border font-jetbrains-mono text-[10px] uppercase tracking-[2px] hover:bg-muted/10 transition-all flex items-center gap-2"
                                                >
                                                    <MessageSquare size={14} /> Send_Message
                                                </button>
                                            </>
                                        )}
                                        {isSelf && (
                                            <Link href="/CreateProfile" className="px-6 py-3 bg-foreground text-background font-jetbrains-mono text-[10px] uppercase tracking-[2px] hover:opacity-80 transition-all">
                                                Self_Calibration
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 space-y-8">
                                {[
                                    { icon: MapPin, label: "Vector_Location", value: profileData.address || "Undisclosed" },
                                    { icon: Mail, label: "Comm_Protocol", value: profileData.email },
                                    { icon: Calendar, label: "First_Contact", value: profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "N/A" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 items-start">
                                        <item.icon size={16} className="text-muted-foreground/30 mt-1 shrink-0" />
                                        <div>
                                            <p className="font-jetbrains-mono text-[9px] text-muted-foreground/40 uppercase tracking-[2px] mb-1">{item.label}</p>
                                            <p className="text-sm text-foreground/80">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Content & Friends */}
                    <div className="lg:col-span-8 flex flex-col gap-20">
                        
                        {/* Friends Module */}
                        <div className="bg-card/20 border border-border/40 rounded-[3rem] p-10 backdrop-blur-3xl overflow-hidden">
                            <div className="mb-12">
                                <h2 className="font-bebas text-5xl italic tracking-widest text-foreground/90">Connections</h2>
                                <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[4px]">Establishied_Neural_Links</p>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                                {profileData.friends?.map((email) => {
                                    const friend = allUsers.find(u => u.email === email);
                                    if (!friend) return null;
                                    return (
                                        <Link 
                                            key={email}
                                            href={`/Community/Profile/${encodeURIComponent(email)}`}
                                            className="group relative block aspect-square rounded-2xl overflow-hidden border border-border group-hover:border-indigo-500/50 transition-all dark:grayscale dark:group-hover:grayscale-0"
                                        >
                                            <img 
                                                src={friend.image || `https://ui-avatars.com/api/?name=${friend.name}&background=111&color=fff`} 
                                                alt={friend.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    );
                                })}
                                
                                {(!profileData.friends || profileData.friends.length === 0) && (
                                    <div className="col-span-full py-16 text-center border border-dashed border-border rounded-[2rem]">
                                        <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[4px]">Node_Isolated: No_Uplinks</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Posts Module */}
                        <div className="space-y-12">
                            <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                    <h2 className="font-bebas text-5xl italic tracking-widest leading-none">Archives</h2>
                                    <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[4px]">System_Exposure_Logs</p>
                                </div>
                                <Terminal size={20} className="text-muted-foreground/30" />
                            </div>
                            <div className="border border-border rounded-[3rem] p-2 bg-card/10">
                                <MyArchive userEmail={decodedEmail} />
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
