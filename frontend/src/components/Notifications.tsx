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
        <div className="position-absolute top-100 end-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-20">
            <div className="p-3 fw-bold border-bottom">Notifications</div>
            <div className="mh-96 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                    <Link to={n.link_url} key={n.id} onClick={() => markAsRead(n.id)}
                        className={`d-flex align-items-start gap-3 p-3 text-decoration-none text-dark transition-colors hover-bg-light ${!n.is_read ? 'bg-primary-soft' : ''}`}>
                        <div className="text-primary pt-1">{n.link_url.includes('chat') ? <FiMessageSquare /> : <FiTag />}</div>
                        <div>
                            <p className="mb-0 text-sm">{n.content}</p>
                            <p className="text-muted text-xs mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                        </div>
                    </Link>
                )) : <p className="p-4 text-sm text-muted">No new notifications.</p>}
            </div>
        </div>
    );
}