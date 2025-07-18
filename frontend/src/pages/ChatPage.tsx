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
    const [error, setError] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!chatId) return;
            try {
                const response = await api.get(`/chats/${chatId}`);
                setMessages(response.data.messages);
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

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
        try {
            await api.put(`/products/${product.id}/status`, { status: 'Sold' });
            setProduct(prev => prev ? { ...prev, status: 'Sold' } : null);
        } catch (err) {
            alert('Failed to mark as sold. Please try again.');
        }
    };

    const otherParticipant = participants.find(p => p.id !== userId);
    const isSeller = product?.seller_id === userId;

    return (
        <div className="d-flex flex-column vh-100 bg-dark text-white">
            <Header />
            <div className="flex-grow-1 d-flex flex-column p-4 overflow-hidden">
                <div className="border-bottom pb-3 mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="fs-5 fw-bold">Chat about: {product?.name || '...'}</h1>
                        <p className="text-sm text-muted mb-0">with {otherParticipant?.username || 'user'}</p>
                    </div>
                    {isSeller && (
                        <button
                            onClick={handleMarkAsSold}
                            disabled={product?.status === 'Sold'}
                            className="btn btn-secondary btn-sm">
                            {product?.status === 'Sold' ? 'Sold' : 'Mark as Sold'}
                        </button>
                    )}
                </div>
                {error && <p className="text-danger text-center">{error}</p>}
                <div className="flex-grow-1 overflow-y-auto pe-2">
                    {messages.map(msg => (
                        <div key={msg.id} className={`d-flex align-items-end gap-2 mb-3 ${msg.sender_id === userId ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className={`p-3 rounded-3 ${msg.sender_id === userId ? 'bg-primary' : 'bg-secondary'}`} style={{ maxWidth: '70%' }}>
                                <p className="text-sm text-white mb-0">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="mt-4 d-flex align-items-center gap-3">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                        className="form-control bg-dark text-white border-secondary" placeholder="Type a message..." />
                    <button type="submit" className="btn btn-primary p-2 fs-5"><FiSend /></button>
                </form>
            </div>
        </div>
    );
}