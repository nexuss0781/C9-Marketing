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

    if (loading) return <div className="bg-dark text-white min-vh-100 text-center p-5">Loading...</div>;
    if (error) return <div className="bg-dark text-white min-vh-100 text-center p-5">{error}</div>;
    if (!product) return <div className="bg-dark text-white min-vh-100 text-center p-5">Product not found.</div>;

    return (
        <div className="bg-dark text-white">
            <Header />
            <main className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-7">
                        <img src={product.photos[0] || 'https://via.placeholder.com/600'} alt={product.name} className="w-100 rounded-3 shadow-lg" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
                    </div>
                    <div className="col-lg-5">
                        <div className="bg-secondary p-4 rounded-3 shadow-lg">
                            <span className={`badge mb-4 ${product.status === 'Available' ? 'bg-success' : 'bg-warning'}`}>{product.status}</span>
                            <h1 className="display-5 fw-bold mb-2">{product.name}</h1>
                            <p className="display-4 fw-bold text-primary mb-4">${product.price.toFixed(2)}</p>
                            
                            <div className="vstack gap-2 text-light mb-4 border-top border-bottom border-secondary py-4">
                                <p className="d-flex align-items-center gap-3"><FiTag className="text-primary"/> <span className="fw-semibold">Category:</span> {product.category}</p>
                                <p className="d-flex align-items-center gap-3"><FiClipboard className="text-primary"/> <span className="fw-semibold">Condition:</span> {product.condition}</p>
                                <p className="d-flex align-items-center gap-3"><FiMapPin className="text-primary"/> <span className="fw-semibold">Location:</span> {product.address}</p>
                            </div>
                            
                            <div className="bg-dark p-4 rounded-3 mb-4">
                                <h3 className="h4 fw-bold mb-3">Seller Information</h3>
                                <div className="vstack gap-2 text-light">
                                    <p className="d-flex align-items-center gap-3"><FiUser className="text-primary"/> <Link to={`/profile/${product.seller.username}`} className="text-white">{product.seller.username}</Link></p>
                                    <p className="d-flex align-items-center gap-3"><FiPhone className="text-primary"/> {product.seller.phone}</p>
                                    <p className="d-flex align-items-center gap-3"><FiCalendar className="text-primary"/> Member since {new Date(product.seller.member_since).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <button onClick={handleRequestPurchase} disabled={product.status !== 'Available' || requestStatus !== 'idle' || isOwnProduct} className="w-100 py-3 btn btn-primary btn-lg">
                                {isOwnProduct ? 'This is your item' : (requestStatus === 'idle' ? 'Request to Buy' : 'Request Sent!')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
