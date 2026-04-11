"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

// Define the User Data Interface (matching backend UserDataModel)
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
                socket
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
