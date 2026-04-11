"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import styles from "./Community.module.scss"; 
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const NotificationBell = () => {
    const { 
        notifications, 
        markNotificationsRead, 
        unreadCount, 
        userData, 
        acceptFriendRequest, 
        rejectFriendRequest 
    } = useGlobalContext();
    const [isOpen, setIsOpen] = useState(false);

    const pendingRequests = userData?.friendRequests?.filter(r => r.status === "pending") || [];
    const totalUnread = unreadCount + pendingRequests.length;

    return (
        <div className="relative z-50">
            {/* Bell Icon Trigger */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markNotificationsRead();
                }}
                className="relative p-3 bg-muted/10 border border-border/40 hover:border-indigo-500/40 rounded-full transition-all group overflow-hidden backdrop-blur-md"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Bell size={20} className="text-foreground group-hover:text-indigo-500 transition-colors" />
                
                {/* Badge Status */}
                <AnimatePresence>
                    {totalUnread > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] border-2 border-background"
                        />
                    )}
                </AnimatePresence>
            </button>

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-4 w-96 bg-background/95 backdrop-blur-2xl border border-border/40 rounded-[30px] shadow-2xl overflow-hidden shadow-indigo-500/5"
                    >
                        <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/10">
                            <h3 className="transition-colors font-bebas text-lg tracking-[2px] uppercase italic text-foreground/70">System_Alerts</h3>
                            <button onClick={() => setIsOpen(false)} className="transition-colors hover:text-indigo-500 text-foreground/40 p-1">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="max-h-[450px] overflow-y-auto no-scrollbar py-2">
                            {/* Friend Requests Section */}
                            {pendingRequests.length > 0 && (
                                <div className="border-b border-border/40 bg-indigo-500/5 mb-2">
                                    <div className="p-4">
                                        <p className="text-[10px] font-jetbrains-mono text-indigo-500 uppercase tracking-widest mb-4 px-1 font-bold italic">Uplink_Requests</p>
                                        <div className="space-y-3">
                                            {pendingRequests.map((req: any, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-muted/5 rounded-2xl border border-border/40 hover:border-indigo-500/20 transition-all">
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/40 bg-muted/10 shrink-0">
                                                            <img src={req.userImage} alt="User" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden text-left">
                                                            <span className="text-foreground text-sm truncate font-bebas tracking-widest italic">{req.userName}</span>
                                                            <span className="text-foreground/40 text-[9px] truncate font-jetbrains-mono tracking-tighter uppercase">{req.from}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button 
                                                            onClick={() => acceptFriendRequest(req.from)}
                                                            className="p-2 bg-indigo-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                                                        >
                                                            <Check size={14} strokeWidth={3} />
                                                        </button>
                                                        <button 
                                                            onClick={() => rejectFriendRequest(req.from)}
                                                            className="p-2 bg-muted/20 text-foreground/40 hover:bg-red-500 hover:text-white rounded-xl hover:scale-110 active:scale-95 transition-all"
                                                        >
                                                            <X size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {notifications.length === 0 && pendingRequests.length === 0 ? (
                                <div className="p-12 text-center text-foreground/20 font-jetbrains-mono text-[10px] uppercase tracking-[4px]">
                                    No incoming transmissions.
                                </div>
                            ) : (
                                notifications.map((notif: any) => (
                                    <div key={notif._id} className={cn(
                                        "p-5 border-b border-border/20 hover:bg-muted/10 transition-colors group cursor-default text-left",
                                        !notif.isRead ? 'bg-indigo-500/[0.03]' : ''
                                    )}>
                                        <div className="flex gap-4">
                                            <div className="mt-1.5 shrink-0">
                                                {notif.type === "MESSAGE" && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                                                {notif.type === "LIKE" && <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
                                                {notif.type === "COMMENT" && <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-foreground font-bebas text-lg tracking-widest leading-none italic group-hover:text-indigo-500 transition-colors uppercase">{notif.title}</p>
                                                    {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />}
                                                </div>
                                                <p className="text-foreground/60 text-xs italic tracking-tight line-clamp-2 mb-2">{notif.content}</p>
                                                <p className="text-foreground/30 text-[9px] font-jetbrains-mono uppercase tracking-[2px] font-bold">
                                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
