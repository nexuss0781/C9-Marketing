// src/App.tsx
import { useState, useEffect, useContext } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { SocketProvider, SocketContext } from './contexts/SocketContext';
import { AppRoutes } from './routes/AppRoutes';
import NotificationToast from './components/NotificationToast'; // We'll update this component
=======
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider, SocketContext } from './contexts/SocketContext';
import { AppRoutes } from './routes/AppRoutes';
import NotificationToast from './components/NotificationToast';
import LoadingScreen from './components/LoadingScreen'; // Import the new component
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008

interface NotificationData {
    productId: number;
    productName: string;
    buyerId: number;
    buyerUsername: string;
}

<<<<<<< HEAD
// This component now needs access to the router's navigation function
=======
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
const AppController = () => {
    const { socket } = useContext(SocketContext)!;
    const [notification, setNotification] = useState<NotificationData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;
<<<<<<< HEAD

        const handleNewRequest = (data: NotificationData) => setNotification(data);
        const handleChatStarted = (data: { chatId: number }) => navigate(`/chat/${data.chatId}`);
        const handleError = (data: { msg: string }) => alert(`Server Error: ${data.msg}`);

        socket.on('server:new_request', handleNewRequest);
        socket.on('server:chat_started', handleChatStarted);
        socket.on('server:error', handleError);

        return () => { // Cleanup listeners
=======
        const handleNewRequest = (data: NotificationData) => setNotification(data);
        const handleChatStarted = (data: { chatId: number }) => navigate(`/chat/${data.chatId}`);
        const handleError = (data: { msg: string }) => alert(`Server Error: ${data.msg}`);
        socket.on('server:new_request', handleNewRequest);
        socket.on('server:chat_started', handleChatStarted);
        socket.on('server:error', handleError);
        return () => {
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
            socket.off('server:new_request', handleNewRequest);
            socket.off('server:chat_started', handleChatStarted);
            socket.off('server:error', handleError);
        };
    }, [socket, navigate]);

    const handleAccept = () => {
        if (!socket || !notification) return;
<<<<<<< HEAD
        socket.emit('client:accept_request', { 
            productId: notification.productId, 
            buyerId: notification.buyerId 
        });
        setNotification(null); // Close the toast immediately
    };

    const handleDecline = () => {
        // Future enhancement: emit a 'client:decline_request' event
        setNotification(null);
    };

    return (
        <>
            {notification && (
                <NotificationToast
                    notification={notification}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                />
            )}
=======
        socket.emit('client:accept_request', { productId: notification.productId, buyerId: notification.buyerId });
        setNotification(null);
    };

    const handleDecline = () => setNotification(null);

    return (
        <>
            {notification && <NotificationToast notification={notification} onAccept={handleAccept} onDecline={handleDecline} />}
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
            <AppRoutes />
        </>
    );
}

<<<<<<< HEAD
// AppRoutes needs to be wrapped in the Router, so AppController can use navigate
function App() {
=======
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

>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
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

<<<<<<< HEAD
// We must re-export BrowserRouter for AppRoutes to work correctly
import { BrowserRouter } from 'react-router-dom';
export default App;
=======
export default App;
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
