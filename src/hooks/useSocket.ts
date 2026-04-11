import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:10000";

export const useSocket = (userId: string | null | undefined) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // Initialize socket connection
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('🔗 Connected to Socket Server');
            setIsConnected(true);
            
            // Join user's personal room
            newSocket.emit('join-user', userId);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket Server');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('⚠️ Socket Connection Error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [userId]);

    return {
        socket,
        isConnected
    };
};
