import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  return (
    <LazyMotion features={domAnimation}>
      <motion.div 
        className="group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link 
          to={`/products/${product.id}`} 
          className="block"
          aria-label={`View details for ${product.name}`}
        >
          <div className="relative overflow-hidden rounded-lg mb-4 aspect-[3/4]">
            <img 
              src={product.images[0] || 'https://images.pexels.com/photos/5705506/pexels-photo-5705506.jpeg'} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              width="300"
              height="400"
            />
            <div 
              className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <button 
                className="bg-white text-primary-900 px-4 py-2 rounded-md font-medium inline-flex items-center transform translate-y-4 group-hover:translate-y-0 transition-transform"
                aria-label={`Quick view ${product.name}`}
              >
                <ShoppingBag size={18} className="mr-2" aria-hidden="true" /> Quick View
              </button>
            </div>
            {product.stock < 10 && product.stock > 0 && (
              <div 
                className="absolute top-2 right-2 bg-warning-500 text-white text-xs px-2 py-1 rounded"
                role="status"
                aria-label="Low stock warning"
              >
                Low Stock
              </div>
            )}
            {product.stock === 0 && (
              <div 
                className="absolute top-2 right-2 bg-error-500 text-white text-xs px-2 py-1 rounded"
                role="status"
                aria-label="Out of stock"
              >
                Sold Out
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-primary-600 mb-1">{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
            <h3 className="font-medium text-base mb-2">{product.name}</h3>
            <p className="text-sm font-semibold text-blue-600">{product.price.toFixed(2)} MAD</p>
          </div>
        </Link>
      </motion.div>
    </LazyMotion>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;