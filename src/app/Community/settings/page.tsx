"use client";

import { motion } from "framer-motion";
import { LogOut, Settings, Shield, Bell, Eye, ArrowLeft } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
    const router = useRouter();

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <div className="space-y-8 pb-32 md:pb-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-bebas text-4xl md:text-5xl tracking-[4px] text-white flex items-center gap-4">
                        SYSTEM_CONFIG <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
                    </h1>
                    <p className="font-jetbrains-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">
                        Adjusting node security and protocol settings...
                    </p>
                </div>
                
                <button onClick={() => router.back()} className="flex items-center gap-2 text-white/20 hover:text-white transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest">Abort_Config</span>
                </button>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Security Section (Placeholder for now) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 backdrop-blur-3xl relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl group-hover:bg-indigo-500 group-hover:text-black transition-all">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="font-bebas text-2xl tracking-widest text-white uppercase italic">Security_Protocols</h3>
                                <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-widest">Manage your node encryption and access methods.</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-white/5 text-white/20 rounded-full text-[8px] font-jetbrains-mono uppercase tracking-[2px]">Encrypted</span>
                    </div>
                    
                    <div className="space-y-4 opacity-40 select-none grayscale">
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="font-jetbrains-mono text-[11px] uppercase tracking-widest text-white/60">Two-Factor Authentication</span>
                            <div className="w-10 h-5 bg-white/10 rounded-full" />
                         </div>
                         <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="font-jetbrains-mono text-[11px] uppercase tracking-widest text-white/60">Session Management</span>
                            <div className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-bold">Active</div>
                         </div>
                    </div>
                </motion.div>

                {/* Logout Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-red-500/5 border border-red-500/20 rounded-[32px] p-8 backdrop-blur-3xl group hover:bg-red-500/10 transition-all cursor-pointer"
                    onClick={handleLogout}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all">
                                <LogOut size={24} />
                            </div>
                            <div>
                                <h3 className="font-bebas text-2xl tracking-widest text-white uppercase italic">Terminate_Connection</h3>
                                <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase tracking-widest">Gracefully disconnect your node from the network.</p>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-red-500 text-white font-bebas text-xl tracking-widest rounded-2xl shadow-[0_10px_30px_#ef444433] group-hover:shadow-[0_10px_40px_#ef444455] transition-all">
                            Sign_Out
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer Status */}
            <div className="pt-10 flex flex-col items-center gap-4 opacity-20">
                <div className="flex gap-2">
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                    <div className="w-1 h-1 bg-white/50 rounded-full" />
                </div>
                <p className="font-jetbrains-mono text-[8px] tracking-[4px] uppercase">Sinners_Social_Node_v1.0.4_Stable</p>
            </div>
        </div>
    );
}
