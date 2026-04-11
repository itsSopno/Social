"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

// Define the User Data Interface (matching backend UserDataModel)
export interface IFriendRequest {
    from: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
}

export interface IUserData {
    _id?: string;
    userId: string;
    name: string;
    lastName: string;
    email: string;
    phoneNumber: number;
    address: string;
    image: string;
    Bio: string;
    friends: string[];
    friendRequests: IFriendRequest[];
    createdAt?: string;
    updatedAt?: string;
}

interface GlobalContextType {
    userData: IUserData | null;
    allUsers: IUserData[];
    loading: boolean;
    error: string | null;
    activeChat: string | null;
    setActiveChat: (email: string | null) => void;
    refreshUserData: () => Promise<void>;
    fetchAllUsers: () => Promise<void>;
    
    // Notification & Socket Additions
    notifications: any[];
    unreadCount: number;
    fetchNotifications: (email: string) => Promise<void>;
    markNotificationsRead: () => Promise<void>;
    socket: Socket | null;

    // Friendship Additions
    sendFriendRequest: (receiverEmail: string) => Promise<void>;
    acceptFriendRequest: (senderEmail: string) => Promise<void>;
    rejectFriendRequest: (senderEmail: string) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10001";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:10001";
import { io, Socket } from 'socket.io-client';
import { toast } from "sonner";

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState<IUserData | null>(null);
    const [allUsers, setAllUsers] = useState<IUserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeChat, setActiveChat] = useState<string | null>(null);

    // Notification states
    const [notifications, setNotifications] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Fetch Notifications
    const fetchNotifications = async (email: string) => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/notification/get/${email}`);
            if (res.data.success) {
                setNotifications(res.data.notifications);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    // Mark as read
    const markNotificationsRead = async () => {
        if (!session?.user?.email) return;
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            await axios.patch(`${BACKEND_URL}/api/notification/read`, { email: session.user.email });
        } catch (err) {
            console.error("Failed to mark notifications read:", err);
        }
    };

    // Fetch specific user data by email
    const fetchUserFullData = async (email: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/user/get/${email}`);
            if (response.data.success) {
                setUserData(response.data.user);
            }
        } catch (err: unknown) {
            console.error("Failed to fetch user profile:", err);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Internal Synthesis Error");
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch all users (Admin/Community view)
    const fetchAllUsers = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/user/get`);
            if (response.data.success) {
                setAllUsers(response.data.users);
            }
        } catch (err: unknown) {
            console.error("Failed to fetch all users:", err);
        }
    };

    const refreshUserData = async () => {
        if (session?.user?.email) {
            await fetchUserFullData(session.user.email);
        }
    };

    // Auto-fetch data and init socket when session is authenticated
    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchUserFullData(session.user.email);
            fetchAllUsers(); 
            fetchNotifications(session.user.email);

            // Initialize global socket for notifications
            const newSocket = io(SOCKET_URL, {
                transports: ['websocket'],
            });

            newSocket.on('connect', () => {
                newSocket.emit('join-user', session.user?.email); // Use email as room ID
            });

            newSocket.on('new-notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                
                // If the notification indicates a friend request was accepted, refresh our data
                if (notification.title === "Request Accepted") {
                    refreshUserData();
                }

                // Trigger toast on new notification!
                toast.success(notification.title || "New Notification", {
                    description: notification.content,
                    duration: 4000,
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };

        } else if (status === "unauthenticated") {
            setUserData(null);
            setNotifications([]);
            fetchAllUsers(); 
        }
    }, [session, status]);

    // Friendship Handlers
    const sendFriendRequest = async (receiverEmail: string) => {
        if (!session?.user?.email) return;
        try {
            const res = await axios.post(`${BACKEND_URL}/api/friend/request/send`, {
                senderEmail: session.user.email,
                receiverEmail
            });
            if (res.data.success) {
                toast.success("Uplink Requested", { description: "Friend request sent successfully." });
                // Emit socket for real-time alert
                socket?.emit("send-notification", {
                    recipientId: receiverEmail,
                    senderId: session.user.email,
                    type: "LIKE", 
                    title: "New Friend Request",
                    content: `${userData?.name || "A user"} wants to be your friend.`
                });
            }
        } catch (err: any) {
            toast.error("Uplink Failed", { description: err.response?.data?.message || "Signal lost" });
        }
    };

    const acceptFriendRequest = async (senderEmail: string) => {
        if (!session?.user?.email) return;
        try {
            const res = await axios.post(`${BACKEND_URL}/api/friend/request/accept`, {
                userEmail: session.user.email,
                senderEmail
            });
            if (res.data.success) {
                toast.success("Synchronized", { description: "Friend request accepted." });
                refreshUserData();
                // Emit socket for real-time alert
                socket?.emit("send-notification", {
                    recipientId: senderEmail,
                    senderId: session.user.email,
                    type: "COMMENT",
                    title: "Request Accepted",
                    content: `${userData?.name || "A user"} accepted your friend request.`
                });
            }
        } catch (err: any) {
            toast.error("Sync Failed", { description: "Could not establish connection." });
        }
    };

    const rejectFriendRequest = async (senderEmail: string) => {
        if (!session?.user?.email) return;
        try {
            await axios.post(`${BACKEND_URL}/api/friend/request/reject`, {
                userEmail: session.user.email,
                senderEmail
            });
            setUserData(prev => prev ? {
                ...prev,
                friendRequests: prev.friendRequests.filter(r => r.from !== senderEmail)
            } : null);
            toast.info("Terminal Rejected", { description: "Friend request removed." });
        } catch (err: any) {
            toast.error("Action Failed", { description: "Signal lost" });
        }
    };

    return (
        <GlobalContext.Provider
            value={{
                userData,
                allUsers,
                loading,
                error,
                activeChat,
                setActiveChat,
                refreshUserData,
                fetchAllUsers,
                notifications,
                unreadCount,
                fetchNotifications,
                markNotificationsRead,
                socket,
                sendFriendRequest,
                acceptFriendRequest,
                rejectFriendRequest
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};
