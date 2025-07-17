// src/pages/DashboardPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import ProductCard, { Product } from '../components/ProductCard';
<<<<<<< HEAD

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // NEW: State for sorting
  const [sortParams, setSortParams] = useState({ sortBy: 'date', order: 'desc' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError('');
        setLoading(true);
        // UPDATED: API call with sorting parameters
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
  }, [sortParams]); // Re-fetch when sortParams changes

  const handleSortChange = (newSortBy: string) => {
    setSortParams(prev => ({
      sortBy: newSortBy,
      // Toggle order if clicking the same sort button again, otherwise default to desc
      order: prev.sortBy === newSortBy && prev.order === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">Available Goods</h1>
            {/* NEW: Sorting Controls */}
            <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-md">
                <button onClick={() => handleSortChange('date')}
                    className={`px-3 py-1 rounded-md text-sm font-semibold ${sortParams.sortBy === 'date' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    Newest
                </button>
                <button onClick={() => handleSortChange('price')}
                    className={`px-3 py-1 rounded-md text-sm font-semibold ${sortParams.sortBy === 'price' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    Price {sortParams.sortBy === 'price' ? (sortParams.order === 'asc' ? '▲' : '▼') : ''}
                </button>
            </div>
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
         {!loading && products.length === 0 && <p>No products available at the moment.</p>}
      </main>
    </div>
  );
}
=======
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
>>>>>>> 5f1aa463a79ab36c658b68dff4b33ded407bc008
