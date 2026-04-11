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
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const BACKEND_URL = "https://t-mark-4.onrender.com";

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState<IUserData | null>(null);
    const [allUsers, setAllUsers] = useState<IUserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [activeChat, setActiveChat] = useState<string | null>(null);

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

    // Auto-fetch when session is authenticated
    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchUserFullData(session.user.email);
            fetchAllUsers(); // Fetch all users for community/admin view
        } else if (status === "unauthenticated") {
            setUserData(null);
            fetchAllUsers(); // Still fetch all users for public community view if needed
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
                fetchAllUsers
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
