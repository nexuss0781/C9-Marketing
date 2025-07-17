// src/pages/ChatPage.tsx
import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import { FiSend } from 'react-icons/fi';

interface Message { id: number; content: string; timestamp: string; sender_id: number; sender_username: string; }
interface Participant { id: number; username: string; }
interface ProductInChat { id: number; name: string; seller_id: number; status: string; }

export default function ChatPage() {
    const { id: chatId } = useParams<{ id: string }>();
    const { socket } = useContext(SocketContext)!;
    const { userId } = useContext(AuthContext)!;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
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
    const handleMarkAsSold = async () => {
        if (!product) return;
        try { await api.put(`/products/${product.id}/sold`); setProduct(prev => prev ? { ...prev, status: 'Sold' } : null);
        } catch (err) { alert('Failed to mark as sold.'); }
    };

    const otherParticipant = participants.find(p => p.id !== userId);
    const isSeller = product?.seller_id === userId;

    return (
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
                            {product?.status === 'Sold' ? 'Sold' : 'Mark as Sold'}
                        </button>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender_id === userId ? 'bg-primary' : 'bg-surface'}`}>
                                <p className="text-sm text-white">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-3">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                        className="input-primary" placeholder="Type a message..." />
                    <button type="submit" className="btn-primary p-3 text-xl"><FiSend /></button>
                </form>
            </div>
        </div>
    );
}