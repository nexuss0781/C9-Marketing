// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface Product {
  id: number;
  name: string;
  price: number;
  photos: string[];
  category: string;
  condition: string;
  pickup_status?: string; // from Phase 5
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const displayPhoto = product.photos[0] || 'https://via.placeholder.com/300';

    return (
        <motion.div whileHover={{ y: -5 }} className="h-full">
            <Link to={`/product/${product.id}`} className="block group card-base overflow-hidden h-full flex flex-col">
                <div className="aspect-square overflow-hidden">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={displayPhoto} alt={product.name} />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        <p className="text-sm text-primary font-semibold">{product.category}</p>
                        <h3 className="text-lg font-bold text-white mt-1 mb-2 truncate" title={product.name}>{product.name}</h3>
                    </div>
                    <p className="text-2xl font-extrabold text-white">${product.price.toFixed(2)}</p>
                </div>
            </Link>
        </motion.div>
    );
}