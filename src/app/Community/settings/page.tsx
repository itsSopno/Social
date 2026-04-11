"use client";

import { motion } from "framer-motion";
import { LogOut, Settings, Shield, Bell, Eye, ArrowLeft, Sun, Moon, Monitor, Palette } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    const themeOptions = [
        { id: 'light', name: 'Light_Mode', icon: Sun, color: 'text-amber-500' },
        { id: 'dark', name: 'Dark_Mode', icon: Moon, color: 'text-indigo-500' },
        { id: 'system', name: 'System_Sync', icon: Monitor, color: 'text-white/40' },
    ];

    return (
        <div className="space-y-12 pb-32 md:pb-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="font-bebas text-4xl md:text-5xl tracking-[4px] text-foreground flex items-center gap-4">
                        SYSTEM_CONFIG <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
                    </h1>
                    <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        Adjusting node security and visual protocol settings...
                    </p>
                </div>
                
                <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-jetbrains-mono text-[10px] uppercase tracking-widest">Abort_Config</span>
                </button>
            </div>

            <div className="max-w-3xl mx-auto space-y-10">
                
                {/* Visual Interface Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card/30 border border-border rounded-[40px] p-10 backdrop-blur-3xl relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-primary/10 text-primary rounded-[20px] transition-all">
                                <Palette size={24} />
                            </div>
                            <div>
                                <h3 className="font-bebas text-3xl tracking-widest text-foreground uppercase italic">Visual_Protocols</h3>
                                <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Select your preferred system interface aesthetic.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {themeOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setTheme(option.id)}
                                className={cn(
                                    "relative p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 overflow-hidden group/opt",
                                    mounted && theme === option.id 
                                        ? "bg-primary/10 border-primary text-primary" 
                                        : "bg-background/20 border-border text-muted-foreground hover:bg-background/50 hover:border-white/20"
                                )}
                            >
                                <option.icon size={28} className={cn("transition-transform group-hover/opt:scale-110", option.color)} />
                                <span className="font-jetbrains-mono text-[10px] uppercase tracking-[3px] font-bold">{option.name}</span>
                                {mounted && theme === option.id && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping" />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Security Section (Placeholder for now) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card/30 border border-border rounded-[40px] p-10 backdrop-blur-3xl relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-primary/10 text-primary rounded-[20px] group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="font-bebas text-3xl tracking-widest text-foreground uppercase italic">Security_Protocols</h3>
                                <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Manage your node encryption and access methods.</p>
                            </div>
                        </div>
                        <span className="px-4 py-1.5 bg-muted/20 text-muted-foreground rounded-full text-[9px] font-jetbrains-mono uppercase tracking-[2px] border border-border">Encrypted</span>
                    </div>
                    
                    <div className="space-y-4 opacity-40 select-none grayscale cursor-not-allowed">
                         <div className="flex items-center justify-between p-5 bg-background/40 rounded-3xl border border-border">
                            <span className="font-jetbrains-mono text-[11px] uppercase tracking-widest text-foreground/60">Two-Factor Authentication</span>
                            <div className="w-12 h-6 bg-muted/20 rounded-full" />
                         </div>
                         <div className="flex items-center justify-between p-5 bg-background/40 rounded-3xl border border-border">
                            <span className="font-jetbrains-mono text-[11px] uppercase tracking-widest text-foreground/60">Session Management</span>
                            <div className="px-5 py-2.5 bg-muted/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Active</div>
                         </div>
                    </div>
                </motion.div>

                {/* Logout Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-red-500/5 border border-red-500/20 rounded-[40px] p-10 backdrop-blur-3xl group hover:bg-red-500/10 transition-all cursor-pointer"
                    onClick={handleLogout}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-red-500/10 text-red-500 rounded-[20px] group-hover:bg-red-500 group-hover:text-white transition-all">
                                <LogOut size={24} />
                            </div>
                            <div>
                                <h3 className="font-bebas text-3xl tracking-widest text-foreground uppercase italic leading-none">Terminate_Connection</h3>
                                <p className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Gracefully disconnect your node from the network.</p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto px-10 py-5 bg-red-500 text-white font-bebas text-2xl tracking-[4px] rounded-[24px] shadow-[0_15px_40px_-10px_#ef444466] group-hover:scale-105 active:scale-95 transition-all text-center">
                            Sign_Out
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer Status */}
            <div className="pt-16 pb-12 flex flex-col items-center gap-6 opacity-40">
                <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-foreground/50 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full" />
                </div>
                <p className="font-jetbrains-mono text-[9px] tracking-[6px] uppercase text-muted-foreground">Sinners_Social_Node_v1.0.4_Stable</p>
            </div>
        </div>
    );
}
