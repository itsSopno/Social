"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    Edit3,
    Calendar,
    ArrowLeft,
    Terminal,
    ShieldCheck,
    Search,
    Trash2,
    UserMinus
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useGlobalContext, IUserData } from "@/context/globalContext";
import { useState } from "react";
import Image from "next/image";
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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-[#6366f1] rounded-full animate-spin" />
                <p className="font-jetbrains-mono text-[10px] text-indigo-500 uppercase tracking-[4px] animate-pulse">Decrypting_Profile...</p>
            </div>
        </div>
    );

    if (!currentUserData) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505]">
            <div className="max-w-md w-full bg-white/[0.02] border border-white/[0.05] rounded-[40px] p-10 text-center backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <ShieldCheck className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="font-bebas text-4xl tracking-widest text-white mb-2 italic">Access_Denied</h2>
                <p className="font-jetbrains-mono text-[10px] text-white/40 uppercase tracking-[4px] mb-8 leading-relaxed">Identity Protocol Failure.<br />Secure Uplink Required.</p>
                <div className="space-y-4">
                    <Link href="/login" className="flex items-center justify-center w-full py-4 bg-indigo-500 text-black font-bebas text-xl tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/10">
                        Establish Connection
                    </Link>
                    <Link href="/Community" className="flex items-center justify-center w-full py-4 bg-white/5 text-white/40 font-bebas text-xl tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all">
                        Return To Base
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-[#050505] pb-24 selection:bg-indigo-500 selection:text-black">
                {/* Top Navigation Bar */}
                <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
                    <Link href="/Community" className="flex items-center gap-3 text-white/40 hover:text-indigo-500 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-jetbrains-mono text-[10px] uppercase tracking-[3px]">Back_To_Stream</span>
                    </Link>
                    <div className="flex gap-2">
                        <Terminal size={14} className="text-indigo-500/50" />
                    </div>
                </div>

                {/* Profile Header/Cover */}
                <div className="relative h-64 md:h-80 w-full overflow-hidden bg-[#0A0A0A] border-b border-white/[0.05]">
                    <div className="absolute inset-0 bg-indigo-500/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50"></div>

                    {/* Abstract grid background */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                </div>

                <div className="max-w-5xl mx-auto px-6">
                    {/* Main Profile Info Section */}
                    <div className="relative -mt-24 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">

                            {/* Avatar */}
                            <div className="relative group/avatar">
                                <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full border-4 border-[#050505] bg-[#0A0A0A] shadow-2xl overflow-hidden shadow-indigo-500/10 flex items-center justify-center p-1">
                                    <div className="relative w-full h-full rounded-full overflow-hidden">
                                        <img
                                            src={currentUserData.image || `https://ui-avatars.com/api/?name=${currentUserData.name}&background=6366f1&color=050505`}
                                            alt="Profile Image"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full border-4 border-[#050505] bg-indigo-500 shadow-[0_0_15px_rgba(217,255,0,0.6)] animate-pulse" />
                            </div>

                            {/* Name & Title */}
                            <div className="pb-4 space-y-2">
                                {/* <h1 className="font-bebas text-5xl md:text-7xl tracking-widest text-white uppercase italic leading-none text-glow">
                                {currentUserData.name} <span className="text-indigo-500">{currentUserData.lastName}</span>
                            </h1> */}
                                <p className="font-jetbrains-mono text-[10px] md:text-xs text-indigo-500 uppercase tracking-[4px] flex items-center justify-center md:justify-start gap-2">
                                    <Terminal className="h-3 w-3" /> {currentUserData.name}
                                </p>
                                <p className="font-jetbrains-mono text-[9px] text-white/40 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <Mail className="h-3 w-3" /> {currentUserData.email}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full md:w-auto pb-4 justify-center md:justify-end">
                            <Link href="/CreateProfile" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/[0.1] rounded-2xl font-jetbrains-mono text-[10px] uppercase tracking-[2px] transition-all">
                                <Edit3 className="h-4 w-4" /> Edit_Data
                            </Link>
                            <button
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-black border border-indigo-500/20 hover:border-transparent rounded-2xl font-jetbrains-mono text-[10px] uppercase tracking-[2px] transition-all shadow-[0_0_15px_rgba(217,255,0,0)] hover:shadow-[0_0_20px_rgba(217,255,0,0.3)]"
                                onClick={() => setActiveChat(currentUserData.email)}
                            >
                                <MessageSquare className="h-4 w-4" /> Message
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Bio Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 md:p-10 backdrop-blur-md"
                        >
                            <h2 className="font-bebas text-3xl text-white tracking-widest uppercase mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> User_Bio
                            </h2>
                            <p className="font-sans text-white/60 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                {currentUserData.Bio ? currentUserData.Bio : "System log empty. No bio data recorded for this node."}
                            </p>
                        </motion.div>

                        {/* Meta Details Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 md:p-10 backdrop-blur-md space-y-8"
                        >
                            <h2 className="font-bebas text-3xl text-white tracking-widest uppercase flex items-center gap-3">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>Details
                            </h2>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start group">
                                    <div className="mt-1 p-2 bg-indigo-500/5 text-indigo-500 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-[2px] mb-1">Location_Vector</p>
                                        <p className="font-sans text-sm text-white/80">{currentUserData.address || "Undisclosed Region"}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start group">
                                    <div className="mt-1 p-2 bg-indigo-500/5 text-indigo-500 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-[2px] mb-1">Comms_Channel</p>
                                        <p className="font-sans text-sm text-white/80">{currentUserData.phoneNumber || "Offline"}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start group">
                                    <div className="mt-1 p-2 bg-indigo-500/5 text-indigo-500 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-[2px] mb-1">Initialization_Date</p>
                                        <p className="font-sans text-sm text-white/80">
                                            {currentUserData.createdAt ? new Date(currentUserData.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : "Unknown Cycle"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Friends List for Personal Profile */}
                            <div className="pt-8 border-t border-white/5">
                                <div className="flex flex-col gap-6 mb-6">
                                    <h3 className="font-bebas text-2xl text-white tracking-widest uppercase flex items-center justify-between">
                                        Friend List
                                        <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md font-jetbrains-mono">
                                            {currentUserData.friends?.length || 0}
                                        </span>
                                    </h3>

                                    {/* Search Input */}
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-indigo-500 transition-colors">
                                            <Search size={14} />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Search_Connections..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 font-jetbrains-mono text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all uppercase tracking-widest"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-3">
                                    {filteredFriends.map((friendEmail: string) => {
                                        const friendObj = allUsers.find(u => u.email === friendEmail);
                                        if (!friendObj) return null;
                                        return (
                                            <div key={friendEmail} className="group/friend relative">
                                                <Link 
                                                    href={`/Community/Profile/${encodeURIComponent(friendEmail)}`}
                                                    title={friendObj.name}
                                                    className="block"
                                                >
                                                    <div className="aspect-square rounded-xl overflow-hidden border border-white/10 group-hover/friend:border-indigo-500/50 transition-all">
                                                        <img 
                                                            src={friendObj.image || `https://ui-avatars.com/api/?name=${friendObj.name}&background=6366f1&color=050505`} 
                                                            alt={friendObj.name}
                                                            className="w-full h-full object-cover grayscale group-hover/friend:grayscale-0 transition-all scale-100 group-hover/friend:scale-110"
                                                        />
                                                    </div>
                                                </Link>
                                                
                                                {/* Unfriend Button */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if(confirm(`Terminate uplink with ${friendObj.name}?`)) {
                                                            unfriend(friendEmail);
                                                        }
                                                    }}
                                                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/friend:opacity-100 transition-all hover:scale-110 shadow-lg shadow-red-500/20 z-20"
                                                    title="Terminate Uplink"
                                                >
                                                    <UserMinus size={12} />
                                                </button>

                                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#050505] opacity-0 group-hover/friend:opacity-100 transition-opacity" />
                                            </div>
                                        );
                                    })}
                                    {filteredFriends.length === 0 && (
                                        <p className="col-span-full font-jetbrains-mono text-[8px] text-white/20 uppercase tracking-[2px] text-center py-6 border border-dashed border-white/5 rounded-2xl">
                                            {searchTerm ? "No matching uplink found." : "No active uplinks yet."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <MyArchive></MyArchive>
        </>
    );
}