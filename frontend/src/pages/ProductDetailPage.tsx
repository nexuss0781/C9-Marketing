// src/pages/ProductDetailPage.tsx
import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
import { FiUser, FiPhone, FiMapPin, FiCalendar, FiTag, FiClipboard } from 'react-icons/fi';

interface DetailedProduct { id: number; name: string; price: number; photos: string[]; category: string; condition: string; status: string; address: string; created_at: string; seller: { id: number; username: string; phone: string; address: string; member_since: string; }; }

export default function ProductDetailPage() {
    const [product, setProduct] = useState<DetailedProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const { id } = useParams<{ id: string }>();
    const { socket } = useContext(SocketContext)!;
    const { userId } = useContext(AuthContext)!;

    useEffect(() => {
        if (!id) return;
        api.get<DetailedProduct>(`/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(() => setError('Failed to fetch product details.'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!socket) return;
        socket.on('server:request_sent', () => setRequestStatus('sent'));
        return () => { socket.off('server:request_sent'); };
    }, [socket]);

    const handleRequestPurchase = () => {
        if (!socket || !id) return;
        setRequestStatus('sending');
        socket.emit('client:request_purchase', { productId: parseInt(id) });
    };
    
    const isOwnProduct = product?.seller.id === userId;

    if (loading) return <div className="bg-background text-white min-h-screen text-center p-10">Loading...</div>;
    if (error) return <div className="bg-background text-white min-h-screen text-center p-10">{error}</div>;
    if (!product) return <div className="bg-background text-white min-h-screen text-center p-10">Product not found.</div>;

    return (
        <div className="bg-background">
            <Header />
            <main className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3">
                        <img src={product.photos[0] || 'https://via.placeholder.com/600'} alt={product.name} className="w-full rounded-lg shadow-xl aspect-video object-cover" />
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-surface p-8 rounded-lg shadow-xl">
                            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-4 ${product.status === 'Available' ? 'bg-green-600/20 text-green-300' : 'bg-yellow-600/20 text-yellow-300'}`}>{product.status}</span>
                            <h1 className="text-4xl font-bold mb-2 text-white">{product.name}</h1>
                            <p className="text-4xl font-bold text-primary mb-6">${product.price.toFixed(2)}</p>
                            
                            <div className="space-y-3 text-gray-300 mb-6 border-y border-muted/50 py-4">
                                <p className="flex items-center gap-3"><FiTag className="text-primary"/> <span className="font-semibold">Category:</span> {product.category}</p>
                                <p className="flex items-center gap-3"><FiClipboard className="text-primary"/> <span className="font-semibold">Condition:</span> {product.condition}</p>
                                <p className="flex items-center gap-3"><FiMapPin className="text-primary"/> <span className="font-semibold">Location:</span> {product.address}</p>
                            </div>
                            
                            <div className="bg-background p-4 rounded-lg mb-6">
                                <h3 className="text-xl font-bold mb-3">Seller Information</h3>
                                <div className="space-y-3 text-gray-300">
                                    <p className="flex items-center gap-3"><FiUser className="text-primary"/> <Link to={`/profile/${product.seller.username}`} className="hover:underline">{product.seller.username}</Link></p>
                                    <p className="flex items-center gap-3"><FiPhone className="text-primary"/> {product.seller.phone}</p>
                                    <p className="flex items-center gap-3"><FiCalendar className="text-primary"/> Member since {new Date(product.seller.member_since).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <button onClick={handleRequestPurchase} disabled={product.status !== 'Available' || requestStatus !== 'idle' || isOwnProduct} className="w-full py-4 btn-primary disabled:bg-muted disabled:cursor-not-allowed text-lg">
                                {isOwnProduct ? 'This is your item' : (requestStatus === 'idle' ? 'Request to Buy' : 'Request Sent!')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}