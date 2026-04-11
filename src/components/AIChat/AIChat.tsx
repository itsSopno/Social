"use client";
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import styles from "./aiChat.module.scss";

interface Message {
    role: "user" | "ai";
    content: string;
}

const AIChat = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: "Hi! I'm your Sinners Assistant. How can I help you find the perfect setup today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const windowRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Entrance Animation
    useEffect(() => {
        gsap.from(bubbleRef.current, {
            scale: 0.5,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001"}/api/ai/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userPrompt: userMsg }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: "ai", content: data.aiResponse }]);
            } else {
                setMessages(prev => [...prev, { role: "ai", content: data.message || "Sorry, I'm having trouble connecting right now." }]);
            }
        } catch (err) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { role: "ai", content: "Connection error. Please make sure the backend is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (pathname.includes("/Community")) return null;

    return (
        <div className={styles.chatWrapper}>
            {/* Chat Window */}
            <div className={`${styles.chatWindow} ${isOpen ? styles.active : ""} flex flex-col bg-[#050505]/95 md:bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl overflow-hidden rounded-none md:rounded-[40px] shadow-2xl`} ref={windowRef}>
                <div className={styles.chatHeader}>
                    <div className={styles.status}></div>
                    <h3>Sinners Assistant</h3>
                </div>

                <div className={styles.messageList} ref={listRef}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`${styles.message} ${msg.role === "user" ? styles.user : styles.ai}`}>
                            {msg.content}
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles.message} ${styles.ai} ${styles.typing}`}>
                            Assistant is thinking...
                        </div>
                    )}
                </div>

                <div className={styles.chatInputArea}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button onClick={handleSend} disabled={isLoading}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Floating Bubble */}
            <div className={styles.chatBubble} onClick={toggleChat} ref={bubbleRef}>
                {isOpen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
            </div>
        </div>
    );
};

export default AIChat;
