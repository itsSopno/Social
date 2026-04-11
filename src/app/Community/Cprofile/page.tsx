"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    Edit3,
    Calendar,
    ArrowLeft,
    Terminal,
    Search,
    UserMinus,
    ExternalLink,
    Hash
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useGlobalContext, IUserData } from "@/context/globalContext";
import { useState } from "react";
import MyArchive from "@/components/Community/UserPost/post";

export default function ProfilePage() {
    const { data: session } = useSession();
    const { allUsers, loading, setActiveChat, unfriend } = useGlobalContext();
    const [searchTerm, setSearchTerm] = useState("");

    const currentUserData = allUsers?.find(
        (user: IUserData) => user.email === session?.user?.email
    );

    const filteredFriends = currentUserData?.friends?.filter((email: string) => {
        const friend = allUsers.find(u => u.email === email);
        if (!friend) return false;
        return friend.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               friend.email.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin" />
                <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[6px]">Syncing_Identity...</p>
            </div>
        </div>
    );

    if (!currentUserData) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
             <div className="max-w-md w-full text-center space-y-8">
                <h2 className="font-bebas text-6xl text-foreground tracking-widest italic">Identity_Lost</h2>
                <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[4px]">Session protocol terminated. Return to gateway.</p>
                <Link href="/login" className="block w-full py-5 bg-foreground text-background font-bebas text-2xl tracking-widest hover:opacity-90 transition-all">
                    Establish Uplink
                </Link>
             </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background pb-20">
            {/* Minimal Header */}
            <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/Community" className="flex items-center gap-4 group transition-opacity hover:opacity-70">
                        <ArrowLeft size={18} className="text-muted-foreground" />
                        <span className="font-jetbrains-mono text-[11px] uppercase tracking-[4px]">Directory</span>
                    </Link>
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>
            </nav>

            {/* Profile Content */}
            <main className="pt-32 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: Fixed Bio & Info */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="sticky top-32">
                            {/* Identity Section */}
                            <div className="space-y-8">
                                <div className="relative inline-block">
                                    <div className="h-48 w-48 rounded-[2rem] overflow-hidden border border-border bg-muted/10">
                                        <img
                                            src={currentUserData.image || `https://ui-avatars.com/api/?name=${currentUserData.name}&background=111&color=fff`}
                                            alt={currentUserData.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-black p-2 rounded-xl shadow-2xl">
                                        <Hash size={16} />
                                    </div>
                                </div>

                                <div>
                                    <h1 className="font-bebas text-7xl uppercase italic leading-none tracking-tight">
                                        {currentUserData.name} <br/>
                                        <span className="text-muted-foreground/30">{currentUserData.lastName}</span>
                                    </h1>
                                    <p className="mt-4 font-jetbrains-mono text-[10px] text-indigo-500 uppercase tracking-[4px] opacity-70">Authenticated_User</p>
                                </div>

                                <div className="space-y-6 pt-8 border-t border-border/40">
                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                                        {currentUserData.Bio || "No transmission recorded in user bio field."}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 pt-4">
                                        <Link href="/CreateProfile" className="px-6 py-3 bg-foreground text-background font-jetbrains-mono text-[10px] uppercase tracking-[2px] transition-all hover:opacity-80">
                                            Edit_Data
                                        </Link>
                                        <button className="px-6 py-3 border border-border font-jetbrains-mono text-[10px] uppercase tracking-[2px] hover:bg-muted/10 transition-all">
                                            Export_Log
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata list */}
                            <div className="mt-16 space-y-8">
                                {[
                                    { icon: MapPin, label: "Vector_Location", value: currentUserData.address || "Unknown" },
                                    { icon: Mail, label: "Comm_Protocol", value: currentUserData.email },
                                    { icon: Calendar, label: "Node_Established", value: currentUserData.createdAt ? new Date(currentUserData.createdAt).toLocaleDateString() : "N/A" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 items-start">
                                        <item.icon size={16} className="text-indigo-500 mt-1 shrink-0" />
                                        <div>
                                            <p className="font-jetbrains-mono text-[9px] text-muted-foreground/50 uppercase tracking-[2px] mb-1">{item.label}</p>
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
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                                <div className="space-y-2">
                                    <h2 className="font-bebas text-5xl italic tracking-widest text-foreground/90">Connections</h2>
                                    <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[4px]">Uplinked_Identity_Stream</p>
                                </div>
                                
                                <div className="relative w-full md:w-80">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input 
                                        type="text"
                                        placeholder="Scan_Nodes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-background/50 border border-border/40 py-4 pl-12 pr-6 rounded-2xl font-jetbrains-mono text-[10px] text-foreground uppercase tracking-widest focus:border-indigo-500/50 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredFriends.map((email) => {
                                        const friend = allUsers.find(u => u.email === email);
                                        if (!friend) return null;
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                key={email}
                                                className="group relative"
                                            >
                                                <Link 
                                                    href={`/Community/Profile/${encodeURIComponent(email)}`}
                                                    className="block aspect-square rounded-2xl overflow-hidden border border-border group-hover:border-indigo-500/50 transition-all dark:grayscale dark:group-hover:grayscale-0"
                                                >
                                                    <img 
                                                        src={friend.image || `https://ui-avatars.com/api/?name=${friend.name}&background=111&color=fff`} 
                                                        alt={friend.name}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                </Link>
                                                
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if(confirm(`Terminate uplink with ${friend.name}?`)) unfriend(email);
                                                    }}
                                                    className="absolute -top-2 -right-2 w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                                                >
                                                    <UserMinus size={14} />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                
                                {filteredFriends.length === 0 && (
                                    <div className="col-span-full py-16 text-center border border-dashed border-border rounded-[2rem]">
                                        <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[4px]">Zero_Active_Uplinks</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Posts Module */}
                        <div className="space-y-12">
                            <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                    <h2 className="font-bebas text-5xl italic tracking-widest leading-none">Archives</h2>
                                    <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[4px]">Personal_Data_Logs</p>
                                </div>
                                <Terminal size={20} className="text-muted-foreground/30" />
                            </div>
                            <div className="border border-border rounded-[3rem] p-2 bg-card/10">
                                <MyArchive />
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}