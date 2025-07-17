import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { Product } from '../components/ProductCard';

interface OrderData { selling: Product[]; buying: Product[]; }
const OrderItemCard = ({ item, isSeller }: { item: Product; isSeller: boolean; }) => {
    const [currentStatus, setCurrentStatus] = useState(item.pickup_status);
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        try { await api.put(`/products/${item.id}/status`, { pickup_status: newStatus }); setCurrentStatus(newStatus);
        } catch (err) { alert('Failed to update status.'); }
    };

    return (
        <div className="card-base p-4 flex items-center justify-between">
            <div className="flex items-center">
                <img src={item.photos[0]} alt={item.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                <div>
                    <Link to={`/product/${item.id}`} className="font-bold text-lg text-white hover:underline">{item.name}</Link>
                    <p className="text-sm text-subtle">Status: <span className="font-semibold text-yellow-400">{currentStatus}</span></p>
                </div>
            </div>
            {isSeller && (
                <select value={currentStatus} onChange={handleStatusChange} className="input-primary w-48 text-sm p-2 mt-0">
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
        <div className="bg-background min-h-screen">
            <Header />
            <main className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold mb-8">My Orders</h1>
                <div className="space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 border-b border-muted/50 pb-2">Items I'm Selling</h2>
                        <div className="space-y-4">
                            {orders?.selling.length ? (orders.selling.map(item => <OrderItemCard key={item.id} item={item} isSeller={true} />)) : <p className="text-subtle">You haven't sold any items yet.</p>}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-4 border-b border-muted/50 pb-2">Items I'm Buying</h2>
                        <div className="space-y-4">
                             {orders?.buying.length ? (orders.buying.map(item => <OrderItemCard key={item.id} item={item} isSeller={false} />)) : <p className="text-subtle">You haven't bought any items yet.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}