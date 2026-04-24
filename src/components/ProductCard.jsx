import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, variant = 'grid' }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isList = variant === 'list';
  const isFavorite = isInWishlist(product.id);

  const isOutOfStock = product.status === 'Out of Stock';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`glass-panel group relative overflow-hidden flex ${isList ? 'flex-row h-64' : 'flex-col h-full'} ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
      
      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
          isFavorite ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-white/5 border-white/10 text-gray-500 hover:text-red-500'
        }`}
      >
        <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      {/* Image Container */}
      <Link 
        to={`/product/${product.id}`} 
        className={`relative overflow-hidden block transition-all ${isList ? 'w-1/3 min-w-[200px]' : 'aspect-square'}`}
      >
        <motion.img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400/0f172a/3b82f6?text=Angadi-GO+Core';
          }}
        />
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-sm uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              OUT_OF_STOCK
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button 
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors pointer-events-auto"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        )}

        {/* Badge */}
        {product.isNew && !isOutOfStock && (
          <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            NEW
          </div>
        )}
      </Link>

      {/* Content */}
      <div className={`p-6 flex flex-col flex-grow relative z-10 ${isList ? 'justify-center' : ''}`}>
        <div className="mb-2 flex justify-between items-start">
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
            {product.category}
          </span>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
             SKU: {product.sku || product.id.slice(-6).toUpperCase()}
          </div>
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors uppercase italic ${isList ? 'text-2xl' : 'text-xl'}`}>
            {product.name}
          </h3>
        </Link>
        
        <p className={`text-gray-400 leading-relaxed mb-4 ${isList ? 'text-sm line-clamp-3 max-w-xl' : 'text-xs line-clamp-2'}`}>
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="text-[8px] font-black text-red-500/60 uppercase tracking-[0.2em] border border-red-500/20 px-2 py-0.5 rounded-sm bg-red-500/5">
            Non-Returnable Unit
          </div>
        </div>

        <div className={`mt-auto flex justify-between items-center ${isList ? 'border-t border-white/5 pt-4' : ''}`}>
          <span className={`${isList ? 'text-3xl' : 'text-2xl'} font-black text-white italic tracking-tighter`}>
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
          {isOutOfStock ? (
             <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/50">STOCK_DEPLETED</span>
          ) : (
            <Link 
              to={`/product/${product.id}`}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors"
            >
              DATA_LINK <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-primary" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
