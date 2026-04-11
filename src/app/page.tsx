"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, useReducedMotion } from "framer-motion";
import { UploadCloud, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { FormEvent, useState, ChangeEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";


const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://t-mark-4.onrender.com";

export default function CreateProfilePage() {
    const { data: session, status } = useSession();
    const shouldReduceMotion = useReducedMotion();
    const router = useRouter();
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        userId: "",
        name: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral",
        Bio: "",
    });

    // Populate form with session data when loaded
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                userId: session.user?.id || "",
                name: (session.user?.name || "").split(" ")[0] || "",
                lastName: (session.user?.name || "").split(" ").slice(1).join(" ") || "",
                email: session.user?.email || "",
                image: session.user?.image || prev.image,
            }));
        }
    }, [session]);

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dhkdtyjsr";
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!uploadPreset) {
            toast.error("Cloudinary upload preset missing in environment variables.");
            return;
        }

        setUploading(true);
        const imgFormData = new FormData();
        imgFormData.append("file", file);
        imgFormData.append("upload_preset", uploadPreset);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                imgFormData
            );
            const imageUrl = res.data.secure_url;
            setFormData({ ...formData, image: imageUrl });
            toast.success("Identity visual updated via Cloudinary");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("V-Sync failed: Could not upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (!formData.email || !formData.name) {
            toast.error("Critical fields missing: Name and Email are required");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/user/create`,
                {
                    ...formData,
                    phoneNumber: Number(formData.phoneNumber) || 0
                }
            );

            if (response.data.success) {
                toast.success("Neural profile synthesized successfully", {
                    description: "Your digital footprint has been registered."
                });
                router.push("/Community");
            }
        } catch (error) {
            console.error("Submission error:", error);
            const errorMsg = axios.isAxiosError(error) ? error.response?.data?.message : "Internal server error during synthesis";
            toast.error(`Synthesis Failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-[#D9FF00] animate-spin" />
                    <p className="font-bebas text-2xl tracking-[0.2em] text-white/40 uppercase italic">Decrypting_Session...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 relative overflow-hidden">
                {/* Atmospheric Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#D9FF00]/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-lg w-full relative z-10"
                >
                    <div className="p-10 md:p-14 rounded-[30px] border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        
                        <div className="text-center space-y-6">
                            {/* Logo Representation */}
                            <div className="w-16 h-16 mx-auto mb-8 relative">
                                <div className="absolute inset-0 bg-[#D9FF00]/20 blur-xl rounded-full" />
                                <div className="relative w-full h-full border border-white/10 rounded-2xl bg-[#0A0A0A] flex items-center justify-center transform rotate-3">
                                    <h2 className="font-bebas text-3xl text-white tracking-widest italic -rotate-3">S<span className="text-[#D9FF00]">.</span></h2>
                                </div>
                            </div>

                            <h1 className="font-bebas text-4xl md:text-5xl text-white tracking-[0.15em] uppercase">
                                Global <span className="text-[#D9FF00] italic">Community</span>
                            </h1>
                            
                            <p className="font-jetbrains-mono text-xs text-white/40 uppercase tracking-[2px] leading-relaxed max-w-sm mx-auto">
                                Synchronize your digital identity to access the high-performance circle.
                            </p>

                            <div className="pt-8">
                                <Link 
                                    href="/register"
                                    className="relative w-full flex items-center justify-center gap-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-jetbrains-mono text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,255,0,0.1)] hover:border-[#D9FF00]/30 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#D9FF00]/0 via-[#D9FF00]/10 to-[#D9FF00]/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    <svg viewBox="0 0 24 24" width="18" height="18" className="z-10">
                                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                    </svg>
                                    <span className="z-10">Initiate Registration</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-40 pb-20 px-6 overflow-x-hidden flex flex-col items-center">
            <div className="w-full max-w-6xl">
                <div className="mb-12">
                    <Link href="/Community" className="inline-flex items-center gap-3 text-white/40 hover:text-[#D9FF00] transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-jetbrains-mono text-[10px] uppercase tracking-[4px]">Return_to_Comm_Link</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    {/* Background Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#D9FF00]/5 via-transparent to-[#D9FF00]/5 rounded-[60px] blur-3xl opacity-50 pointer-events-none"></div>
                    
                    <div className="relative bg-[#0F0F0F]/80 border border-white/5 rounded-[40px] backdrop-blur-3xl p-8 md:p-16 lg:p-20 shadow-2xl overflow-hidden min-h-[600px]">
                        
                        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center lg:items-start">
                            {/* Profile Sidebar */}
                            <div className="w-full lg:w-1/3 flex flex-col items-center gap-10">
                                <div className="relative group/avatar">
                                    <div className="absolute -inset-2 bg-[#D9FF00]/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
                                    <Avatar className="w-48 h-48 border-2 border-white/10 p-2 bg-[#050505] relative z-10">
                                        {uploading ? (
                                            <div className="flex h-full w-full items-center justify-center bg-black/20 rounded-full">
                                                <Loader2 className="w-10 h-10 text-[#D9FF00] animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-full rounded-full overflow-hidden">
                                                <Image 
                                                    src={formData.image} 
                                                    alt="Avatar" 
                                                    fill 
                                                    className="object-cover"
                                                    unoptimized={formData.image.includes('imgbb') || formData.image.includes('dicebear')}
                                                />
                                            </div>
                                        )}
                                    </Avatar>
                                    <Label htmlFor="avatar-upload" className="absolute bottom-4 right-4 w-12 h-12 bg-[#D9FF00] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl shadow-[#D9FF00]/20 z-20 border-4 border-[#050505]">
                                        <UploadCloud size={20} className="text-black" />
                                        <input id="avatar-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </Label>
                                </div>

                                <div className="text-center space-y-3">
                                    <h2 className="font-bebas text-4xl tracking-widest text-[#D9FF00] uppercase italic">
                                        {(formData.name || "UNIDENTIFIED")}_{(formData.lastName || "NODE")}
                                    </h2>
                                    <p className="font-jetbrains-mono text-[9px] text-white/20 tracking-[6px] uppercase italic">
                                        {formData.email}
                                    </p>
                                </div>

                                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                                <div className="flex gap-6 opacity-30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D9FF00] animate-pulse"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D9FF00] animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D9FF00] animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="flex-1 w-full space-y-12">
                                <div className="space-y-2">
                                    <h1 className="font-bebas text-5xl md:text-6xl tracking-tighter text-white uppercase italic">Profile_Synthesis</h1>
                                    <p className="font-jetbrains-mono text-[10px] text-white/30 uppercase tracking-[3px]">Update your metadata for global community uplinks.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                                        <div className="space-y-3">
                                            <Label className="font-jetbrains-mono text-[9px] text-white/40 uppercase tracking-[2px] ml-1">Node_First_Name</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="h-14 bg-[#050505] border-white/10 rounded-2xl px-6 focus:border-[#D9FF00] focus:ring-1 focus:ring-[#D9FF00]/10 font-jetbrains-mono text-sm transition-all"
                                                placeholder="ALEX"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-jetbrains-mono text-[9px] text-white/40 uppercase tracking-[2px] ml-1">Node_Last_Name</Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                className="h-14 bg-[#050505] border-white/10 rounded-2xl px-6 focus:border-[#D9FF00] focus:ring-1 focus:ring-[#D9FF00]/10 font-jetbrains-mono text-sm transition-all"
                                                placeholder="PARKER"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                                        <div className="space-y-3">
                                            <Label className="font-jetbrains-mono text-[9px] text-white/40 uppercase tracking-[2px] ml-1">Communication_Signal</Label>
                                            <Input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                                className="h-14 bg-[#050505] border-white/10 rounded-2xl px-6 focus:border-[#D9FF00] focus:ring-1 focus:ring-[#D9FF00]/10 font-jetbrains-mono text-sm transition-all"
                                                placeholder="+880..."
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-jetbrains-mono text-[9px] text-white/40 uppercase tracking-[2px] ml-1">Grid_Location</Label>
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                className="h-14 bg-[#050505] border-white/10 rounded-2xl px-6 focus:border-[#D9FF00] focus:ring-1 focus:ring-[#D9FF00]/10 font-jetbrains-mono text-sm transition-all"
                                                placeholder="COORDINATES..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-left">
                                        <Label className="font-jetbrains-mono text-[9px] text-white/40 uppercase tracking-[2px] ml-1">Bio_Log</Label>
                                        <Textarea
                                            value={formData.Bio}
                                            onChange={(e) => setFormData({...formData, Bio: e.target.value})}
                                            className="min-h-[140px] bg-[#050505] border-white/10 rounded-3xl px-6 py-5 focus:border-[#D9FF00] focus:ring-1 focus:ring-[#D9FF00]/10 font-jetbrains-mono text-sm transition-all resize-none"
                                            placeholder="DESCRIBE_YOUR_INTERFACE..."
                                        />
                                    </div>

                                    <div className="pt-8">
                                        <Button
                                            type="submit"
                                            disabled={loading || uploading}
                                            className="w-full h-16 bg-[#D9FF00] text-black font-bebas text-2xl tracking-[0.3em] rounded-3xl hover:scale-[1.01] active:scale-[0.98] transition-all shadow-2xl shadow-[#D9FF00]/20 flex items-center justify-center gap-4 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Initiate_Synthesis"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}