// src/pages/ProductDetailPage.tsx
import { useState, useEffect, useContext } from 'react';
<<<<<<< HEAD
import { useParams } from 'react-router-dom';
=======
import { useParams, Link } from 'react-router-dom';
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
import api from '../services/api';
import Header from '../components/Header';
import { SocketContext } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
<<<<<<< HEAD

interface DetailedProduct {
    id: number; name: string; price: number; photos: string[]; category: string;
    condition: string; status: string; address: string; created_at: string;
    seller: { id: number; username: string; phone: string; address: string; member_since: string; };
}
=======
import { FiUser, FiPhone, FiMapPin, FiCalendar, FiTag, FiClipboard } from 'react-icons/fi';

interface DetailedProduct { id: number; name: string; price: number; photos: string[]; category: string; condition: string; status: string; address: string; created_at: string; seller: { id: number; username: string; phone: string; address: string; member_since: string; }; }
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008

export default function ProductDetailPage() {
    const [product, setProduct] = useState<DetailedProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
    const { id } = useParams<{ id: string }>();
    const { socket } = useContext(SocketContext)!;
    const { userId } = useContext(AuthContext)!;

    useEffect(() => {
<<<<<<< HEAD
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
=======
        if (!id) return;
        api.get<DetailedProduct>(`/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(() => setError('Failed to fetch product details.'))
            .finally(() => setLoading(false));
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
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

<<<<<<< HEAD
    if (loading) return <div className="bg-gray-900 text-white min-h-screen text-center p-10">Loading...</div>;
    if (error) return <div className="bg-gray-900 text-white min-h-screen text-center p-10">{error}</div>;
    if (!product) return <div className="bg-gray-900 text-white min-h-screen text-center p-10">Product not found.</div>;
=======
    if (loading) return <div className="bg-background text-white min-h-screen text-center p-10">Loading...</div>;
    if (error) return <div className="bg-background text-white min-h-screen text-center p-10">{error}</div>;
    if (!product) return <div className="bg-background text-white min-h-screen text-center p-10">Product not found.</div>;
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008

    return (
        <div className="bg-background">
            <Header />
<<<<<<< HEAD
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
=======
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
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
                    </div>
                </div>
            </main>
        </div>
    );
}