import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiMessageSquare, FiTag } from 'react-icons/fi';

interface Notification { id: number; content: string; is_read: boolean; link_url: string; timestamp: string; }

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    useEffect(() => { api.get<Notification[]>('/me/notifications').then(res => setNotifications(res.data)); }, []);
    const markAsRead = async (id: number) => {
        api.put(`/me/notifications/${id}/read`);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    return (
        <div className="absolute top-14 right-0 w-80 bg-surface border border-muted/50 rounded-lg shadow-2xl z-20">
            <div className="p-3 font-bold border-b border-muted/50 text-white">Notifications</div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                    <Link to={n.link_url} key={n.id} onClick={() => markAsRead(n.id)}
                        className={`flex items-start gap-3 p-3 transition-colors hover:bg-muted/50 ${!n.is_read ? 'bg-primary/20' : ''}`}>
                        <div className="text-primary pt-1">{n.link_url.includes('chat') ? <FiMessageSquare /> : <FiTag />}</div>
                        <div>
                            <p className="text-sm text-gray-200">{n.content}</p>
                            <p className="text-xs text-subtle mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                        </div>
                    </Link>
                )) : <p className="p-4 text-sm text-subtle">No new notifications.</p>}
            </div>
        </div>
    );
}