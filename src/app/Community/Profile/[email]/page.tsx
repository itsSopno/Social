"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    ArrowLeft,
    Terminal,
    ShieldCheck,
    Calendar,
    UserPlus,
    UserCheck,
    Loader2
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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="font-jetbrains-mono text-[10px] text-indigo-500 uppercase tracking-[4px] animate-pulse">Establishing_Uplink...</p>
            </div>
        </div>
    );

    if (!profileData) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505]">
            <div className="max-w-md w-full bg-white/[0.02] border border-white/[0.05] rounded-[40px] p-10 text-center backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
                <h2 className="font-bebas text-4xl tracking-widest text-white mb-2 italic">Node_Not_Found</h2>
                <p className="font-jetbrains-mono text-[10px] text-white/40 uppercase tracking-[4px] mb-8 leading-relaxed">Identity sequence corrupted.<br />Return to base.</p>
                <Link href="/Community" className="flex items-center justify-center w-full py-4 bg-indigo-500 text-black font-bebas text-xl tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/10">
                    Return to Stream
                </Link>
            </div>
        </div>
    );

    // Friend relationship logic
    const isFriend = userData?.friends?.includes(decodedEmail);
    const hasSentRequest = userData?.friendRequests?.some(r => r.from === decodedEmail && r.status === "pending");
    // (In a real app we'd also check outgoing requests from another array, for now we simplify)

    return (
        <div className="min-h-screen bg-[#050505] pb-24 selection:bg-indigo-500 selection:text-black">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-3 text-white/40 hover:text-indigo-500 transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-jetbrains-mono text-[10px] uppercase tracking-[3px]">Back_To_Directory</span>
                </button>
                <div className="flex gap-2">
                    <Terminal size={14} className="text-indigo-500/50" />
                </div>
            </div>

            {/* Profile Header/Cover */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden bg-[#0A0A0A] border-b border-white/[0.05]">
                <div className="absolute inset-0 bg-indigo-500/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50"></div>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
                <div className="relative -mt-24 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative group/avatar">
                            <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full border-4 border-[#050505] bg-[#0A0A0A] shadow-2xl overflow-hidden flex items-center justify-center p-1">
                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                    <img
                                        src={profileData.image || `https://ui-avatars.com/api/?name=${profileData.name}&background=6366f1&color=050505`}
                                        alt="Profile Image"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                            <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full border-4 border-[#050505] bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse" />
                        </div>

                        {/* Name & ID */}
                        <div className="pb-4 space-y-2">
                            <h1 className="font-bebas text-5xl md:text-7xl tracking-widest text-white uppercase italic leading-none">
                                {profileData.name} <span className="text-indigo-500">{profileData.lastName}</span>
                            </h1>
                            <p className="font-jetbrains-mono text-[9px] text-white/40 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                                <Mail className="h-3 w-3" /> {profileData.email}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full md:w-auto pb-4 justify-center md:justify-end">
                        {!isSelf && (
                            <>
                                {isFriend ? (
                                    <div className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl font-jetbrains-mono text-[10px] uppercase tracking-[2px]">
                                        <UserCheck className="h-4 w-4" /> Established
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => sendFriendRequest(profileData.email)}
                                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-black border border-indigo-500/20 rounded-2xl font-jetbrains-mono text-[10px] uppercase tracking-[2px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                    >
                                        <UserPlus className="h-4 w-4" /> Uplink_Request
                                    </button>
                                )}
                                <button
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-jetbrains-mono text-[10px] uppercase tracking-[2px] transition-all"
                                    onClick={() => setActiveChat(profileData.email)}
                                >
                                    <MessageSquare className="h-4 w-4" /> Message
                                </button>
                            </>
                        )}
                        {isSelf && (
                            <Link href="/CreateProfile" className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-black border border-indigo-500/20 rounded-2xl font-jetbrains-mono text-[10px] uppercase tracking-[2px] transition-all">
                                Edit_Profile
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bio & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 md:p-10 backdrop-blur-md"
                        >
                            <h2 className="font-bebas text-3xl text-white tracking-widest uppercase mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> User_Bio
                            </h2>
                            <p className="font-sans text-white/60 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                {profileData.Bio || "System log empty. No bio data recorded for this node."}
                            </p>
                        </motion.div>

                        {/* Dynamic Posts */}
                        <div className="mt-8">
                             <h2 className="font-bebas text-3xl text-white tracking-widest uppercase mb-6 flex items-center gap-3 ml-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Archive_History
                            </h2>
                            <MyArchive userEmail={decodedEmail} />
                        </div>
                    </div>

                    {/* Metadata Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 md:p-10 backdrop-blur-md h-fit space-y-8"
                    >
                        <h2 className="font-bebas text-3xl text-white tracking-widest uppercase flex items-center gap-3">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>Details
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start group">
                                <div className="mt-1 p-2 bg-indigo-500/5 text-indigo-500 rounded-lg">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-[2px] mb-1">Location</p>
                                    <p className="font-sans text-sm text-white/80">{profileData.address || "Undisclosed"}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start group">
                                <div className="mt-1 p-2 bg-indigo-500/5 text-indigo-500 rounded-lg">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-[2px] mb-1">Node_Created</p>
                                    <p className="font-sans text-sm text-white/80">
                                        {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "Unknown"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Friends List Addition */}
                        <div className="pt-8 border-t border-white/5">
                            <h3 className="font-bebas text-2xl text-white tracking-widest uppercase mb-6 flex items-center justify-between">
                                Uplinked_Nodes 
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md font-jetbrains-mono">
                                    {profileData.friends?.length || 0}
                                </span>
                            </h3>
                            
                            <div className="grid grid-cols-4 gap-3">
                                {profileData.friends?.map((friendEmail) => {
                                    const friendObj = allUsers.find(u => u.email === friendEmail);
                                    if (!friendObj) return null;
                                    return (
                                        <Link 
                                            key={friendEmail} 
                                            href={`/Community/Profile/${encodeURIComponent(friendEmail)}`}
                                            className="group/friend relative"
                                            title={friendObj.name}
                                        >
                                            <div className="aspect-square rounded-xl overflow-hidden border border-white/10 group-hover/friend:border-indigo-500/50 transition-all">
                                                <img 
                                                    src={friendObj.image || `https://ui-avatars.com/api/?name=${friendObj.name}&background=6366f1&color=050505`} 
                                                    alt={friendObj.name}
                                                    className="w-full h-full object-cover grayscale group-hover/friend:grayscale-0 transition-all"
                                                />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#050505] opacity-0 group-hover/friend:opacity-100 transition-opacity" />
                                        </Link>
                                    );
                                })}
                                {(!profileData.friends || profileData.friends.length === 0) && (
                                    <p className="col-span-full font-jetbrains-mono text-[8px] text-white/20 uppercase tracking-[2px] text-center py-4 border border-dashed border-white/5 rounded-2xl">
                                        No active uplinks found.
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
