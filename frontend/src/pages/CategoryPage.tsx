// src/pages/CategoryPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import ProductCard, { type Product } from '../components/ProductCard';

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
        <div className="min-vh-100 bg-dark text-white">
            <Header />
            <main className="container py-5">
                <div className="mb-4">
                    <Link to="/dashboard" className="text-primary">← Back to Dashboard</Link>
                    <h1 className="display-4 fw-bold mt-2">Category: {categoryName}</h1>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {products.map(product => (
                            <div key={product.id} className="col">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}