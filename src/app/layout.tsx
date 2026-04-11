import type { Metadata } from "next";
import { Inter, Bebas_Neue, Playfair_Display, Space_Grotesk, Geist, JetBrains_Mono } from "next/font/google";
import "../styles/tailwind.css";
import "../styles/globals.scss";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar/Navbar";

import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import AIChat from "@/components/AIChat/AIChat";
import LoadingWrapper from "@/components/LoadingWrapper/LoadingWrapper";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import { GlobalProvider } from "@/context/globalContext";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Sinners | Social & Community",
  description: "Official Community for Sinners.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} ${bebasNeue.variable} ${playfair.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased bg-[#131313] text-[#c6c6c6]`}>
        <SessionProvider>
          <GlobalProvider>
            <ToasterProvider />
            <LoadingWrapper>
              <SmoothScroll>
                <div className="app-wrapper">
                  <Navbar />
                  <main className="main-content">{children}</main>
                  <AIChat />
                </div>
              </SmoothScroll>
            </LoadingWrapper>
          </GlobalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}