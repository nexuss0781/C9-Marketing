// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';

export interface Product {
  id: number;
  name: string;
  price: number;
  photos: string[];
  category: string;
  condition: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPhoto = product.photos[0] || 'https://via.placeholder.com/300';

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 transition-transform transform group-hover:-translate-y-1">
        <img className="w-full h-56 object-cover" src={displayPhoto} alt={product.name} />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-white mb-2 truncate">{product.name}</h3>
          <p className="text-2xl font-bold text-indigo-400">${product.price.toFixed(2)}</p>
          <div className="text-gray-400 text-sm mt-2">
            <span>{product.category}</span> • <span>{product.condition}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
