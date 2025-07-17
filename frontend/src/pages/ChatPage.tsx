// src/pages/ChatPage.tsx
import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
<<<<<<< HEAD

interface Message { id: number; content: string; timestamp: string; sender_id: number; sender_username: string; }
interface Participant { id: number; username: string; }
// NEW: Interface for product details in chat
=======
import { FiSend } from 'react-icons/fi';

interface Message { id: number; content: string; timestamp: string; sender_id: number; sender_username: string; }
interface Participant { id: number; username: string; }
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
interface ProductInChat { id: number; name: string; seller_id: number; status: string; }

export default function ChatPage() {
    const { id: chatId } = useParams<{ id: string }>();
    const { socket } = useContext(SocketContext)!;
    const { userId } = useContext(AuthContext)!;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
<<<<<<< HEAD
    const [product, setProduct] = useState<ProductInChat | null>(null); // UPDATED
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!chatId) return;
            try {
                const response = await api.get(`/chats/${chatId}`);
                setMessages(response.data.messages);
                // UPDATED: Get full product object
                setProduct({
                    id: response.data.product_id,
                    name: response.data.product_name,
                    seller_id: response.data.seller_id,
                    status: response.data.product_status
                });
                setParticipants(response.data.participants);
            } catch (err) {
                setError('Failed to load chat history.');
            }
        };
        fetchChatHistory();
    }, [chatId]);

    // ... (message receiving and scrolling useEffects remain the same)
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
=======
    const [product, setProduct] = useState<ProductInChat | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        if (!chatId) return;
        api.get(`/chats/${chatId}`).then(res => {
            setMessages(res.data.messages);
            setProduct({ id: res.data.product_id, name: res.data.product_name, seller_id: res.data.seller_id, status: res.data.product_status });
            setParticipants(res.data.participants);
        });
    }, [chatId]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (message: Message) => setMessages(prev => [...prev, message]);
        socket.on('server:new_message', handleNewMessage);
        return () => { socket.off('server:new_message', handleNewMessage) };
    }, [socket]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !socket) return;
        socket.emit('client:send_message', { chatId: parseInt(chatId!), content: newMessage });
        setNewMessage('');
    };
<<<<<<< HEAD

    // NEW: Handler for marking item as sold
    const handleMarkAsSold = async () => {
        if (!product) return;
        try {
            await api.put(`/products/${product.id}/sold`);
            setProduct(prev => prev ? { ...prev, status: 'Sold' } : null);
            // Optionally show a success message
        } catch (err) {
            alert('Failed to mark as sold. Please try again.');
        }
=======
    const handleMarkAsSold = async () => {
        if (!product) return;
        try { await api.put(`/products/${product.id}/sold`); setProduct(prev => prev ? { ...prev, status: 'Sold' } : null);
        } catch (err) { alert('Failed to mark as sold.'); }
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
    };

    const otherParticipant = participants.find(p => p.id !== userId);
    const isSeller = product?.seller_id === userId;

    return (
<<<<<<< HEAD
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <Header />
            <div className="flex-grow flex flex-col p-4 overflow-hidden">
                <div className="border-b border-gray-700 pb-2 mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Chat about: {product?.name || '...'}</h1>
                        <p className="text-sm text-gray-400">with {otherParticipant?.username || 'user'}</p>
                    </div>
                    {/* NEW: Conditional button */}
                    {isSeller && (
                        <button
                            onClick={handleMarkAsSold}
                            disabled={product?.status === 'Sold'}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold text-sm disabled:bg-gray-500 disabled:cursor-not-allowed">
=======
        <div className="flex flex-col h-screen bg-background">
            <Header />
            <div className="flex-grow flex flex-col p-4 overflow-hidden">
                <div className="border-b border-muted/50 pb-3 mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">Chat about: {product?.name || '...'}</h1>
                        <p className="text-sm text-subtle">with {otherParticipant?.username || 'user'}</p>
                    </div>
                    {isSeller && (
                        <button onClick={handleMarkAsSold} disabled={product?.status === 'Sold'}
                            className="btn-secondary text-sm py-1 px-3 disabled:bg-green-800 disabled:text-green-300 disabled:cursor-not-allowed">
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
                            {product?.status === 'Sold' ? 'Sold' : 'Mark as Sold'}
                        </button>
                    )}
                </div>
<<<<<<< HEAD
                {error && <p className="text-red-500 text-center">{error}</p>}
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender_id === userId ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
=======
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender_id === userId ? 'bg-primary' : 'bg-surface'}`}>
                                <p className="text-sm text-white">{msg.content}</p>
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
<<<<<<< HEAD
                <form onSubmit={handleSendMessage} className="mt-4 flex">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                        className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Type a message..." />
                    <button type="submit" className="px-6 bg-indigo-600 hover:bg-indigo-700 rounded-r-md font-semibold">Send</button>
=======
                <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-3">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                        className="input-primary" placeholder="Type a message..." />
                    <button type="submit" className="btn-primary p-3 text-xl"><FiSend /></button>
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
                </form>
            </div>
        </div>
    );
<<<<<<< HEAD
}
=======
}
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
