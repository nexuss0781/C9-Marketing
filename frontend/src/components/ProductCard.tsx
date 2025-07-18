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
        <motion.div whileHover={{ y: -5 }} className="h-100">
            <Link to={`/product/${product.id}`} className="card h-100 text-decoration-none text-dark">
                <div style={{ aspectRatio: '1 / 1' }} className="overflow-hidden">
                    <img className="w-100 h-100 object-cover" src={displayPhoto} alt={product.name} style={{ transition: 'transform .3s' }} />
                </div>
                <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                        <p className="text-primary fw-semibold">{product.category}</p>
                        <h3 className="fs-5 fw-bold mt-1 mb-2 text-truncate" title={product.name}>{product.name}</h3>
                    </div>
                    <p className="fs-2 fw-bolder">${product.price.toFixed(2)}</p>
                </div>
            </Link>
        </motion.div>
    );
}