import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import type { Product } from '../components/ProductCard';

interface OrderData { selling: Product[]; buying: Product[]; }
const OrderItemCard = ({ item, isSeller }: { item: Product; isSeller: boolean; }) => {
    const [currentStatus, setCurrentStatus] = useState(item.pickup_status);
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        try { await api.put(`/products/${item.id}/status`, { pickup_status: newStatus }); setCurrentStatus(newStatus);
        } catch (err) { alert('Failed to update status.'); }
    };

    return (
        <div className="card bg-secondary p-3 d-flex flex-row align-items-center justify-content-between">
            <div className="d-flex align-items-center">
                <img src={item.photos[0]} alt={item.name} className="rounded me-3" style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
                <div>
                    <Link to={`/product/${item.id}`} className="fw-bold fs-5 text-white text-decoration-none">{item.name}</Link>
                    <p className="text-sm text-muted mb-0">Status: <span className="fw-semibold text-warning">{currentStatus}</span></p>
                </div>
            </div>
            {isSeller && (
                <select value={currentStatus} onChange={handleStatusChange} className="form-select bg-dark text-white border-secondary w-auto">
                    <option>Awaiting Drop-off</option> <option>At Center</option> <option>Shipped</option> <option>Completed</option>
                </select>
            )}
        </div>
    );
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderData | null>(null);
    useEffect(() => { api.get('/me/orders').then(res => setOrders(res.data)) }, []);

    return (
        <div className="bg-dark min-vh-100 text-white">
            <Header />
            <main className="container py-5">
                <h1 className="display-4 fw-bold mb-5">My Orders</h1>
                <div className="vstack gap-5">
                    <div>
                        <h2 className="h2 fw-bold mb-4 border-bottom pb-2">Items I'm Selling</h2>
                        <div className="vstack gap-3">
                            {orders?.selling.length ? (orders.selling.map(item => <OrderItemCard key={item.id} item={item} isSeller={true} />)) : <p className="text-muted">You haven't sold any items yet.</p>}
                        </div>
                    </div>
                    <div>
                        <h2 className="h2 fw-bold mb-4 border-bottom pb-2">Items I'm Buying</h2>
                        <div className="vstack gap-3">
                             {orders?.buying.length ? (orders.buying.map(item => <OrderItemCard key={item.id} item={item} isSeller={false} />)) : <p className="text-muted">You haven't bought any items yet.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}