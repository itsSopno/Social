"use client";

import { useGlobalContext, IUserData } from "@/context/globalContext";
import MagneticCard from "@/components/Community/MagneticCard";
import { User, MessageSquare, Search, ShieldCheck, Zap, UserPlus, Check, X, Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function DiscoverPage() {
    const { 
        allUsers, 
        userData, 
        sendFriendRequest, 
        acceptFriendRequest, 
        rejectFriendRequest 
    } = useGlobalContext();
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState("");

    // Categorize Users
    const friendEmails = userData?.friends || [];
    const incomingEmails = userData?.friendRequests?.filter(r => r.status === "pending").map(r => r.from) || [];

    const filteredUsers = allUsers?.filter((user: IUserData) => 
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        user.email !== session?.user?.email
    );

    const incomingRequests = filteredUsers?.filter(u => incomingEmails.includes(u.email)) || [];
    const suggestions = filteredUsers?.filter(u => !incomingEmails.includes(u.email) && !friendEmails.includes(u.email)) || [];

    const UserCard = ({ user, type, index }: { user: IUserData, type: 'request' | 'suggestion', index: number }) => {
        const isPending = userData?.friendRequests?.some(r => r.from === session?.user?.email && r.status === "pending"); 
        // Note: Real state for outgoing requests would need a separate array on userData, 
        // but since we are following the current model, we'll focus on incoming and suggestions.

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
            >
                <MagneticCard delay={0}>
                    <div className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-indigo-500/30 rounded-[32px] p-6 h-full backdrop-blur-3xl transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent h-20 w-full -translate-y-full group-hover:translate-y-full transition-all duration-[2s] ease-linear pointer-events-none" />
                        
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Link href={`/Community/Profile/${encodeURIComponent(user.email)}`} className="relative block">
                                <div className="w-20 h-20 rounded-full border-2 border-white/10 group-hover:border-indigo-500/50 overflow-hidden bg-[#050505] p-1 transition-all duration-500">
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        {user.image ? (
                                            <Image 
                                                src={user.image} 
                                                alt={user.name} 
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/[0.05]">
                                                <User size={32} className="text-white/10" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-indigo-500 rounded-full border-[3px] border-[#050505] shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </Link>

                            <div className="space-y-1">
                                <Link href={`/Community/Profile/${encodeURIComponent(user.email)}`}>
                                    <h3 className="font-bebas text-xl tracking-[2px] text-white group-hover:text-indigo-500 transition-colors">
                                        {user.name} {user.lastName}
                                    </h3>
                                </Link>
                                <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-widest truncate max-w-[150px]">
                                    {user.email}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
                                    <ShieldCheck size={10} className="text-indigo-500" />
                                    <span className="text-[8px] font-jetbrains-mono uppercase text-white/40">Verified</span>
                                </div>
                            </div>

                            <div className="w-full pt-2 flex gap-2">
                                {type === 'request' ? (
                                    <>
                                        <button 
                                            onClick={() => acceptFriendRequest(user.email)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-black rounded-2xl font-bebas text-lg tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(99,102,241,0.1)]"
                                        >
                                            <Check size={16} /> Accept
                                        </button>
                                        <button 
                                            onClick={() => rejectFriendRequest(user.email)}
                                            className="px-4 flex items-center justify-center bg-white/5 text-white/40 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => sendFriendRequest(user.email)}
                                        className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-indigo-500 hover:text-black text-white/60 border border-white/10 hover:border-transparent rounded-2xl font-bebas text-lg tracking-widest transition-all"
                                    >
                                        <UserPlus size={18} />
                                        Uplink_Request
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </MagneticCard>
            </motion.div>
        );
    };

    return (
        <div className="space-y-12 pb-32 md:pb-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-bebas text-4xl md:text-5xl tracking-[4px] text-white flex items-center gap-4">
                        COMMAND_DIRECTORY <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                    </h1>
                    <p className="font-jetbrains-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">
                        Scanning community nodes for connection protocols...
                    </p>
                </div>

                <div className="relative group w-full md:w-72">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-indigo-500 transition-colors">
                        <Search size={16} />
                    </div>
                    <input 
                        type="text"
                        placeholder="SEARCH_REGISTRY..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 focus:border-indigo-500 rounded-2xl py-3 pl-12 pr-4 text-xs font-jetbrains-mono text-white outline-none transition-all placeholder:text-white/10"
                    />
                </div>
            </div>

            {/* Incoming Requests Section */}
            {incomingRequests.length > 0 && (
                <div className="space-y-6">
                    <h2 className="font-bebas text-2xl tracking-[2px] text-indigo-500 flex items-center gap-3">
                        <Clock size={20} /> Incoming_Uplinks
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {incomingRequests.map((user, i) => (
                                <UserCard key={user.email} user={user} type="request" index={i} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Suggestions Section */}
            <div className="space-y-6">
                <h2 className="font-bebas text-2xl tracking-[2px] text-white/40 uppercase">Potential_Connections</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {suggestions.map((user, i) => (
                            <UserCard key={user.email} user={user} type="suggestion" index={i} />
                        ))}
                    </AnimatePresence>
                </div>

                {suggestions.length === 0 && incomingRequests.length === 0 && (
                    <div className="py-20 text-center space-y-4 opacity-20 border border-dashed border-white/10 rounded-[40px]">
                        <Search size={48} className="mx-auto" />
                        <p className="font-jetbrains-mono uppercase tracking-[4px] text-xs">No_Users_Found_In_Safe_Zone</p>
                    </div>
                )}
            </div>
        </div>
    );
}
