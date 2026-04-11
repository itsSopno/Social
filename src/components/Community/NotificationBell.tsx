"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import styles from "./Community.module.scss"; 
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

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
                className="relative p-3 bg-white/5 border border-white/10 hover:border-[#D9FF00]/40 rounded-full transition-all group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#D9FF00]/0 to-[#D9FF00]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Bell size={20} className="text-white group-hover:text-[#D9FF00] transition-colors" />
                
                {/* Badge Status */}
                <AnimatePresence>
                    {totalUnread > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1 right-2 w-2 h-2 bg-[#D9FF00] rounded-full shadow-[0_0_10px_#D9FF00]"
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
                        className="absolute right-0 mt-4 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-white font-jetbrains-mono text-sm tracking-widest uppercase">System Alerts</h3>
                            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {/* Friend Requests Section */}
                            {pendingRequests.length > 0 && (
                                <div className="border-b border-white/10 bg-[#D9FF00]/5">
                                    <div className="p-3">
                                        <p className="text-[10px] font-jetbrains-mono text-[#D9FF00] uppercase tracking-widest mb-3 px-1">Uplink Requests</p>
                                        <div className="space-y-2">
                                            {pendingRequests.map((req, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/10">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <div className="p-1.5 bg-white/5 rounded-lg shrink-0">
                                                            <UserPlus size={14} className="text-[#D9FF00]" />
                                                        </div>
                                                        <span className="text-white text-xs truncate font-jetbrains-mono">{req.from}</span>
                                                    </div>
                                                    <div className="flex gap-1 ml-2">
                                                        <button 
                                                            onClick={() => acceptFriendRequest(req.from)}
                                                            className="p-1.5 hover:bg-[#D9FF00] hover:text-black rounded-lg transition-colors text-white/40"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => rejectFriendRequest(req.from)}
                                                            className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-white/40"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {notifications.length === 0 && pendingRequests.length === 0 ? (
                                <div className="p-8 text-center text-white/40 font-jetbrains-mono text-xs">
                                    No incoming transmissions.
                                </div>
                            ) : (
                                notifications.map((notif: any) => (
                                    <div key={notif._id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-white/[0.02]' : ''}`}>
                                        <div className="flex gap-3">
                                            {/* Icon depending on type */}
                                            <div className="mt-1">
                                                {notif.type === "MESSAGE" && <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />}
                                                {notif.type === "LIKE" && <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />}
                                                {notif.type === "COMMENT" && <div className="w-2 h-2 mt-1.5 rounded-full bg-[#D9FF00] shadow-[0_0_8px_#D9FF00]" />}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{notif.title}</p>
                                                <p className="text-white/60 text-xs mt-1 leading-relaxed">{notif.content}</p>
                                                <p className="text-white/30 text-[10px] mt-2 font-jetbrains-mono uppercase">
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
