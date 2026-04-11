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
import { cn } from "@/lib/utils";
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                    <p className="font-bebas text-3xl tracking-[0.2em] text-muted-foreground uppercase italic">Decrypting_Session...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
                {/* Atmospheric Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-lg w-full relative z-10"
                >
                    <div className="p-10 md:p-14 rounded-[40px] border border-border bg-card/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        
                        <div className="text-center space-y-10">
                            <div className="w-20 h-20 mx-auto relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                                <div className="relative w-full h-full border border-border rounded-2xl bg-muted/10 flex items-center justify-center transform rotate-3">
                                    <h2 className="font-bebas text-4xl text-foreground tracking-widest italic -rotate-3">S<span className="text-indigo-500">.</span></h2>
                                </div>
                            </div>

                            <h1 className="font-bebas text-5xl md:text-6xl text-foreground tracking-[0.1em] uppercase leading-none">
                                Global <span className="text-indigo-500 italic">Community</span>
                            </h1>
                            
                            <p className="font-jetbrains-mono text-xs text-muted-foreground uppercase tracking-[3px] leading-relaxed max-w-sm mx-auto">
                                Synchronize your digital identity to access the circle.
                            </p>

                            <div className="pt-8">
                                <Link 
                                    href="/register"
                                    className="relative w-full flex items-center justify-center gap-5 py-5 bg-foreground text-background hover:opacity-90 font-jetbrains-mono text-xs uppercase tracking-[0.3em] rounded-2xl transition-all duration-300"
                                >
                                    <span>Initiate Registration</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6 flex flex-col items-center">
            <div className="w-full max-w-6xl">
                <div className="mb-12">
                    <Link href="/Community" className="inline-flex items-center gap-4 text-muted-foreground hover:text-indigo-500 transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-jetbrains-mono text-[11px] uppercase tracking-[6px]">Return_to_Comm_Link</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                >
                    <div className="relative bg-card/20 border border-border rounded-[50px] backdrop-blur-3xl p-10 md:p-20 lg:p-24 shadow-2xl overflow-hidden min-h-[600px]">
                        
                        <div className="flex flex-col lg:flex-row gap-20 lg:gap-32 items-center lg:items-start">
                            {/* Profile Sidebar */}
                            <div className="w-full lg:w-1/3 flex flex-col items-center gap-12">
                                <div className="relative group/avatar">
                                    <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"></div>
                                    <Avatar className="w-56 h-56 border border-border p-2 bg-muted/10 relative z-10 transition-all duration-500 group-hover:scale-105">
                                        {uploading ? (
                                            <div className="flex h-full w-full items-center justify-center bg-muted/20 rounded-full">
                                                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
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
                                    <Label htmlFor="avatar-upload" className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-500 text-black rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 z-20 border-4 border-background">
                                        <UploadCloud size={24} />
                                        <input id="avatar-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </Label>
                                </div>

                                <div className="text-center space-y-4">
                                    <h2 className="font-bebas text-5xl tracking-widest text-foreground uppercase italic truncate max-w-xs">
                                        {(formData.name || "UNIDENTIFIED")}_{(formData.lastName || "NODE")}
                                    </h2>
                                    <p className="font-jetbrains-mono text-[10px] text-muted-foreground/40 tracking-[8px] uppercase italic">
                                        {formData.email}
                                    </p>
                                </div>

                                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border/40 to-transparent"></div>

                                <div className="flex gap-8 opacity-20">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="flex-1 w-full space-y-16 text-left">
                                <div className="space-y-4">
                                    <h1 className="font-bebas text-6xl md:text-7xl tracking-tighter text-foreground uppercase italic leading-none">Profile_Synthesis</h1>
                                    <p className="font-jetbrains-mono text-[11px] text-muted-foreground uppercase tracking-[5px]">Update metadata for neural community uplinks.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <Label className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[3px] ml-1">Node_First_Name</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="h-16 bg-muted/5 border-border rounded-3xl px-8 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-jetbrains-mono text-sm transition-all"
                                                placeholder="ALEX"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[3px] ml-1">Node_Last_Name</Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                className="h-16 bg-muted/5 border-border rounded-3xl px-8 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-jetbrains-mono text-sm transition-all"
                                                placeholder="PARKER"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <Label className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[3px] ml-1">Communication_Signal</Label>
                                            <Input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                                className="h-16 bg-muted/5 border-border rounded-3xl px-8 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-jetbrains-mono text-sm transition-all"
                                                placeholder="+880..."
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[3px] ml-1">Grid_Location</Label>
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                className="h-16 bg-muted/5 border-border rounded-3xl px-8 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-jetbrains-mono text-sm transition-all"
                                                placeholder="COORDINATES..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="font-jetbrains-mono text-[10px] text-muted-foreground uppercase tracking-[3px] ml-1">Bio_Log</Label>
                                        <Textarea
                                            value={formData.Bio}
                                            onChange={(e) => setFormData({...formData, Bio: e.target.value})}
                                            className="min-h-[160px] bg-muted/5 border-border rounded-[32px] px-8 py-6 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-jetbrains-mono text-sm transition-all resize-none"
                                            placeholder="DESCRIBE_YOUR_INTERFACE..."
                                        />
                                    </div>

                                    <div className="pt-10">
                                        <Button
                                            type="submit"
                                            disabled={loading || uploading}
                                            className="w-full h-20 bg-foreground text-background font-bebas text-3xl tracking-[0.4em] rounded-[30px] hover:opacity-90 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-5 disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : "Initiate_Synthesis"}
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