// src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const auth = useContext(AuthContext);

    useEffect(() => {
        if (auth?.isAuthenticated) {
            const token = localStorage.getItem('authToken');
            const newSocket = io(import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000", {
                query: { token }
            });

            setSocket(newSocket);

            newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
            newSocket.on('disconnect', () => console.log('Socket disconnected'));

            return () => {
                newSocket.disconnect();
            };
        } else {
            // If user logs out, disconnect the socket
            socket?.disconnect();
            setSocket(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
