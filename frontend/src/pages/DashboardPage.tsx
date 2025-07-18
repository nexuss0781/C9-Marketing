// src/pages/DashboardPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import ProductCard, { type Product } from '../components/ProductCard';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortParams, setSortParams] = useState({ sortBy: 'date', order: 'desc' });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setError('');
                setLoading(true);
                const response = await api.get('/products', {
                    params: sortParams,
                });
                setProducts(response.data);
            } catch (err) {
                setError('Failed to fetch products.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [sortParams]);

    const handleSortChange = (newSortBy: string) => {
        setSortParams(prev => ({
            sortBy: newSortBy,
            order: prev.sortBy === newSortBy && prev.order === 'desc' ? 'asc' : 'desc',
        }));
    };

    const productsByCategory = useMemo(() => products.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>), [products]);

    return (
        <div className="min-vh-100 bg-dark text-white">
            <Header />
            <main className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="display-4 fw-bold">Available Goods</h1>
                    <div className="btn-group" role="group">
                        <button type="button" onClick={() => handleSortChange('date')}
                            className={`btn ${sortParams.sortBy === 'date' ? 'btn-primary' : 'btn-outline-secondary'}`}>
                            Newest
                        </button>
                        <button type="button" onClick={() => handleSortChange('price')}
                            className={`btn ${sortParams.sortBy === 'price' ? 'btn-primary' : 'btn-outline-secondary'}`}>
                            Price {sortParams.sortBy === 'price' ? (sortParams.order === 'asc' ? '▲' : '▼') : ''}
                        </button>
                    </div>
                </div>

                {loading && <div className="text-center text-muted">Loading fresh finds...</div>}
                {error && <p className="text-danger">{error}</p>}
                {!loading && !error && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {Object.entries(productsByCategory).map(([category, items]: [string, Product[]]) => (
                            <motion.div key={category} variants={itemVariants} className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="h2 fw-bold border-start border-4 border-primary ps-3">{category}</h2>
                                    {items.length > 5 && (
                                        <Link to={`/category/${category}`} className="fw-semibold text-primary">
                                            Show All →
                                        </Link>
                                    )}
                                </div>
                                <motion.div
                                    variants={containerVariants}
                                    className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4"
                                >
                                    {items.slice(0, 5).map(product => (
                                        <motion.div key={product.id} variants={itemVariants} className="col">
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
                 {!loading && products.length === 0 && <p>No products available at the moment.</p>}
            </main>
        </div>
    );
}