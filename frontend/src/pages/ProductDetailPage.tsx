// src/pages/ProductDetailPage.tsx
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';

interface DetailedProduct {
    id: number; name: string; price: number; photos: string[]; category: string;
    condition: string; status: string; address: string; created_at: string;
    seller: { id: number; username: string; phone: string; address: string; member_since: string; };
}

export default function ProductDetailPage() {
    const [product, setProduct] = useState<DetailedProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const { id } = useParams<{ id: string }>();
    const { socket } = useContext(SocketContext)!;
    const { userId } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true); setError('');
                const response = await api.get<DetailedProduct>(`/products/${id}`);
                setProduct(response.data);
            } catch (err) {
                setError('Failed to fetch product details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
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

    if (loading) return <div className="bg-gray-900 text-white min-h-screen text-center p-10">Loading...</div>;
    if (error) return <div className="bg-gray-900 text-white min-h-screen text-center p-10">{error}</div>;
    if (!product) return <div className="bg-gray-900 text-white min-h-screen text-center p-10">Product not found.</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div><img src={product.photos[0] || 'https://via.placeholder.com/600'} alt={product.name} className="w-full rounded-lg shadow-lg" /></div>
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-4 ${product.status === 'Available' ? 'bg-green-600' : 'bg-yellow-600'}`}> {product.status} </span>
                        <p className="text-4xl font-bold text-indigo-400 mb-4">${product.price.toFixed(2)}</p>
                        <div className="space-y-2 text-gray-300 mb-6">
                            <p><span className="font-semibold">Category:</span> {product.category}</p>
                            <p><span className="font-semibold">Condition:</span> {product.condition}</p>
                            <p><span className="font-semibold">Location:</span> {product.address}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                            <h3 className="text-xl font-bold mb-2">Seller Information</h3>
                            <p><span className="font-semibold">Username:</span> {product.seller.username}</p>
                            <p><span className="font-semibold">Contact:</span> {product.seller.phone}</p>
                        </div>
                        <button onClick={handleRequestPurchase}
                            disabled={product.status !== 'Available' || requestStatus !== 'idle' || isOwnProduct}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isOwnProduct ? 'This is your item' : (requestStatus === 'idle' ? 'Request to Buy' : 'Request Sent!')}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
