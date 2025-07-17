// src/pages/CategoryPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import ProductCard, { Product } from '../components/ProductCard';

export default function CategoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { categoryName } = useParams<{ categoryName: string }>();

    useEffect(() => {
        if (categoryName) {
            setLoading(true);
            api.get(`/products/category/${categoryName}`)
                .then(res => setProducts(res.data))
                .catch(err => console.error("Failed to fetch category", err))
                .finally(() => setLoading(false));
        }
    }, [categoryName]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="container mx-auto px-6 py-8">
                <div className="mb-6">
                    <Link to="/dashboard" className="text-indigo-400 hover:underline">← Back to Dashboard</Link>
                    <h1 className="text-4xl font-bold mt-2">Category: {categoryName}</h1>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}