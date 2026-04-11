"use client";
import React, { useState, useEffect } from "react";
import LoadingScreen from "@/app/Loading/page";

export default function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  // Control body overflow while loading
  useEffect(() => {
    if (loading) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [loading]);

  // Hard safety timeout — after 7s force unlock NO MATTER WHAT
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <LoadingScreen onComplete={() => setLoading(false)} />
      )}
      <div 
        className="relative w-full h-full pointer-events-auto"
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      >
        {children}
      </div>
    </div>
  );
}
