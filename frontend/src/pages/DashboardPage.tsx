// src/pages/DashboardPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import ProductCard, { Product } from '../components/ProductCard';
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

    useEffect(() => {
        api.get('/products')
            .then(res => setProducts(res.data))
            .finally(() => setLoading(false));
    }, []);

    const productsByCategory = useMemo(() => products.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>), [products]);

    return (
        <div className="bg-background">
            <Header />
            <main className="container mx-auto px-6 py-8">
                {loading ? (
                    <div className="text-center text-subtle">Loading fresh finds...</div>
                ) : (
                    <motion.div
                        className="space-y-16"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {Object.entries(productsByCategory).map(([category, items]) => (
                            <motion.div key={category} variants={itemVariants}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-3xl font-bold border-l-4 border-primary pl-4">{category}</h2>
                                    {items.length > 5 && (
                                        <Link to={`/category/${category}`} className="font-semibold text-primary hover:underline">
                                            Show All →
                                        </Link>
                                    )}
                                </div>
                                <motion.div
                                    variants={containerVariants}
                                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                                >
                                    {items.slice(0, 5).map(product => (
                                        <motion.div key={product.id} variants={itemVariants}>
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
}