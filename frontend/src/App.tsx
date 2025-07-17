// src/App.tsx
import { useState, useEffect, useContext } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider, SocketContext } from './contexts/SocketContext';
import { AppRoutes } from './routes/AppRoutes';
import NotificationToast from './components/NotificationToast';
import LoadingScreen from './components/LoadingScreen'; // Import the new component

interface NotificationData {
    productId: number;
    productName: string;
    buyerId: number;
    buyerUsername: string;
}

const AppController = () => {
    const { socket } = useContext(SocketContext)!;
    const [notification, setNotification] = useState<NotificationData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;
        const handleNewRequest = (data: NotificationData) => setNotification(data);
        const handleChatStarted = (data: { chatId: number }) => navigate(`/chat/${data.chatId}`);
        const handleError = (data: { msg: string }) => alert(`Server Error: ${data.msg}`);
        socket.on('server:new_request', handleNewRequest);
        socket.on('server:chat_started', handleChatStarted);
        socket.on('server:error', handleError);
        return () => {
            socket.off('server:new_request', handleNewRequest);
            socket.off('server:chat_started', handleChatStarted);
            socket.off('server:error', handleError);
        };
    }, [socket, navigate]);

    const handleAccept = () => {
        if (!socket || !notification) return;
        socket.emit('client:accept_request', { productId: notification.productId, buyerId: notification.buyerId });
        setNotification(null);
    };

    const handleDecline = () => setNotification(null);

    return (
        <>
            {notification && <NotificationToast notification={notification} onAccept={handleAccept} onDecline={handleDecline} />}
            <AppRoutes />
        </>
    );
}

function App() {
    const [appLoading, setAppLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => setAppLoading(false), 3000); // 3 seconds
        return () => clearTimeout(timer);
    }, []);

    if (appLoading) {
        return <LoadingScreen />;
    }

    return (
        <AuthProvider>
            <SocketProvider>
                <BrowserRouter>
                    <AppController />
                </BrowserRouter>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;