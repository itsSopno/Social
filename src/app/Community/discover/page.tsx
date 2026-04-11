"use client";

import { useGlobalContext, IUserData } from "@/context/globalContext";
import MagneticCard from "@/components/Community/MagneticCard";
import { User, MessageSquare, Search, ShieldCheck, Zap, UserPlus, Check, X, Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
            >
                <MagneticCard delay={0}>
                    <div className="group bg-card/20 hover:bg-card/40 border border-border/40 hover:border-indigo-500/30 rounded-[40px] p-8 h-full backdrop-blur-3xl transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent h-32 w-full -translate-y-full group-hover:translate-y-full transition-all duration-[2s] ease-linear pointer-events-none" />
                        
                        <div className="flex flex-col items-center text-center space-y-6">
                            <Link href={`/Community/Profile/${encodeURIComponent(user.email)}`} className="relative block">
                                <div className="w-24 h-24 rounded-full border border-border group-hover:border-indigo-500/50 overflow-hidden bg-muted/10 p-1 transition-all duration-500">
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        {user.image ? (
                                            <Image 
                                                src={user.image} 
                                                alt={user.name} 
                                                width={96}
                                                height={96}
                                                className="w-full h-full object-cover dark:opacity-80 group-hover:opacity-100 transition-opacity" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-muted/20">
                                                <User size={40} className="text-muted-foreground/20" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-indigo-500 rounded-full border-[3px] border-background shadow-lg shadow-indigo-500/20" />
                            </Link>

                            <div className="space-y-2">
                                <Link href={`/Community/Profile/${encodeURIComponent(user.email)}`}>
                                    <h3 className="font-bebas text-2xl tracking-[2px] text-foreground group-hover:text-indigo-500 transition-colors italic">
                                        {user.name} {user.lastName}
                                    </h3>
                                </Link>
                                <p className="font-jetbrains-mono text-[9px] text-foreground/40 uppercase tracking-widest truncate max-w-[180px]">
                                    {user.email}
                                </p>
                            </div>

                            <div className="flex h-6">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 border border-border/40 font-bold">
                                    <ShieldCheck size={12} className="text-indigo-500" />
                                    <span className="text-[8px] font-jetbrains-mono uppercase text-foreground/60 tracking-widest font-bold">Verified_Node</span>
                                </div>
                            </div>

                            <div className="w-full pt-4 flex gap-3">
                                {type === 'request' ? (
                                    <>
                                        <button 
                                            onClick={() => acceptFriendRequest(user.email)}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-500 text-black rounded-[20px] font-bebas text-xl tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                                        >
                                            <Check size={18} /> Accept
                                        </button>
                                        <button 
                                            onClick={() => rejectFriendRequest(user.email)}
                                            className="px-5 flex items-center justify-center bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-red-500/20 rounded-[20px] transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => sendFriendRequest(user.email)}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-foreground/[0.03] hover:bg-indigo-500 hover:text-black text-foreground/60 border border-border/60 hover:border-transparent rounded-[20px] font-bebas text-xl tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <UserPlus size={20} />
                                        Connect_Node
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
        <div className="space-y-16 pb-32 md:pb-10">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div>
                    <h1 className="font-bebas text-5xl md:text-6xl tracking-[4px] text-foreground flex items-center gap-5 italic">
                        COMMAND_DIRECTORY <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
                    </h1>
                    <p className="font-jetbrains-mono text-[10px] text-foreground/40 uppercase tracking-[6px] mt-2">
                        Scanning community nodes for synchronization...
                    </p>
                </div>

                <div className="relative group w-full lg:w-[400px]">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-muted-foreground/40 group-focus-within:text-indigo-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text"
                        placeholder="SEARCH_REGISTRY_LOGS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-card/20 border border-border/60 focus:border-indigo-500 rounded-[24px] py-4 pl-14 pr-6 text-xs font-jetbrains-mono text-foreground outline-none transition-all placeholder:text-muted-foreground/30 backdrop-blur-3xl shadow-sm uppercase tracking-widest"
                    />
                </div>
            </div>

            {/* Incoming Requests Section */}
            {incomingRequests.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center gap-4 text-indigo-500">
                        <Clock size={24} />
                        <h2 className="font-bebas text-3xl tracking-[3px] uppercase italic">Incoming_Uplinks</h2>
                        <div className="h-[1px] flex-1 bg-indigo-500/10" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {incomingRequests.map((user, i) => (
                                <UserCard key={user.email} user={user} type="request" index={i} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Suggestions Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 text-muted-foreground/40">
                    <Zap size={24} />
                    <h2 className="font-bebas text-3xl tracking-[3px] uppercase italic">Potential_Connections</h2>
                    <div className="h-[1px] flex-1 bg-border/20" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {suggestions.map((user, i) => (
                            <UserCard key={user.email} user={user} type="suggestion" index={i} />
                        ))}
                    </AnimatePresence>
                </div>

                {suggestions.length === 0 && incomingRequests.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center space-y-6 opacity-40 border-2 border-dashed border-border rounded-[60px] bg-muted/5"
                    >
                        <Search size={64} className="mx-auto text-muted-foreground/20" />
                        <div className="space-y-2">
                            <p className="font-jetbrains-mono uppercase tracking-[6px] text-xs font-bold text-foreground">Zero_Nodes_Detected</p>
                            <p className="font-jetbrains-mono text-[9px] text-muted-foreground uppercase">Safe_Zone_Registry_Is_Empty</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
