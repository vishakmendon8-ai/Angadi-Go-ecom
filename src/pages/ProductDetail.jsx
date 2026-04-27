import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingCart, ArrowLeft, Zap, Shield, 
    Cpu, Rotate3d, CheckCircle, Info, Loader2,
    Heart, Bell
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        // Try 'product' collection first
        let currentCollection = 'product';
        let docRef = doc(db, 'product', id);
        let docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          // Fallback to 'components' collection
          currentCollection = 'components';
          docRef = doc(db, 'components', id);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          setActiveImage(data.image);

          // Fetch Related Products from the same collection
          const relatedQuery = query(
            collection(db, currentCollection),
            where('category', '==', data.category),
            limit(5) // Fetch 5 to filter out current and keep 4
          );
          
          const relatedSnap = await getDocs(relatedQuery);
          const relatedData = relatedSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => p.id !== docSnap.id)
            .slice(0, 4);
          
          setRelatedProducts(relatedData);
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  const isOutOfStock = product?.status === 'Out of Stock';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-black text-white italic uppercase mb-4 tracking-tighter">Tech Node Not Found</h2>
        <p className="text-gray-500 mb-8 font-bold uppercase tracking-widest text-[10px]">The requested unit does not exist in our neural index.</p>
        <Link to="/products" className="btn-primary">RETURN TO CATALOG</Link>
      </div>
    );
  }

  const gallery = product.gallery || [product.image, product.image, product.image];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <Link to="/products" className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-white transition-colors mb-12 uppercase tracking-[0.3em] font-black group italic">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-primary" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Cinematic Image Gallery */}
        <div className="space-y-6">
          <div className="relative glass-panel aspect-square overflow-hidden group border-primary/20">
             <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  src={activeImage} 
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                />
             </AnimatePresence>
          </div>

          <div className="grid grid-cols-4 gap-4">
             {gallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-primary' : 'border-white/5 opacity-50 hover:opacity-100'
                  }`}
                >
                   <img src={img} alt={`${product.name} shadow ${idx}`} className="w-full h-full object-cover" />
                </button>
             ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6 flex items-center gap-3">
             <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-black italic">
               {product.category}
             </span>
             <div className="h-px w-12 bg-white/10" />
             <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
               SKU_{product.sku || product.id.slice(-6).toUpperCase()}
             </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 italic uppercase leading-[0.9]">
            {product.name}
          </h1>

          <div className="flex items-center gap-6 mb-10">
             <div className="text-4xl font-black text-white italic tracking-tighter">
               ₹{product.price?.toLocaleString('en-IN')}
             </div>
             <div className={`text-[9px] font-bold px-3 py-1 rounded-sm border uppercase tracking-widest italic ${isOutOfStock ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                {isOutOfStock ? 'Depleted' : 'Active Deployment'}
             </div>
          </div>
          
          <p className="text-gray-400 leading-relaxed mb-6 text-lg font-light">
            {product.description}
          </p>
          
          <div className="flex items-center gap-3 mb-10 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
             <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                <Shield size={16} />
             </div>
             <div>
                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Acquisition Protocol: No Returns</div>
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">All units are finalized upon acquisition. No exchange or refund policy applies.</div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-12">
            {[
              { label: 'Neural Link', val: product.specs?.core || 'v4.2 Alpha', icon: Zap },
              { label: 'Shield Class', val: product.specs?.weight || 'Heavy Duty', icon: Shield },
              { label: 'Operational Range', val: product.specs?.range || 'Global', icon: Cpu },
              { label: 'Sensor Suite', val: product.specs?.sensor || '8K Neural', icon: Rotate3d }
            ].map((spec, i) => (
              <div key={i} className="glass-panel p-4 flex items-center gap-4 border-white/5">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                   <spec.icon size={18} />
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">{spec.label}</div>
                  <div className="text-white font-bold text-sm truncate max-w-[120px]">{spec.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shrink-0">
               <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
               >
                 -
               </button>
               <div className="w-12 text-center font-black italic text-xl text-white">
                 {quantity}
               </div>
               <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
               >
                 +
               </button>
            </div>

            <motion.button 
              whileTap={isOutOfStock ? {} : { scale: 0.95 }}
              onClick={isOutOfStock ? null : handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-grow flex items-center justify-center gap-3 py-5 px-8 rounded-2xl font-black italic tracking-tighter text-xl transition-all ${
                isOutOfStock
                ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                : added 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-white hover:bg-primary-glow shadow-[0_0_30px_rgba(59,130,246,0.3)]'
              }`}
            >
              {isOutOfStock ? (
                <> DEPLETED </>
              ) : added ? (
                <> <CheckCircle size={24} /> UNIT ADAPTED </>
              ) : (
                <> <ShoppingCart size={24} /> INITIATE ACQUISITION </>
              )}
            </motion.button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${
                isInWishlist(product.id)
                ? 'bg-red-500/20 border-red-500/40 text-red-500'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart size={24} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Neural Suggestions */}
      {relatedProducts.length > 0 && (
        <section className="mt-32">
          <div className="flex items-center gap-6 mb-12">
             <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase whitespace-nowrap">
               Neural <span className="text-primary italic">Suggestions</span>
             </h3>
             <div className="h-[1px] w-full bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Engineering Overview */}
      <section className="mt-32 border-t border-white/5 pt-32">
        <div className="flex items-center gap-4 mb-12">
           <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase whitespace-nowrap">
             Engineering Specs
           </h3>
           <div className="h-[1px] w-full bg-white/5" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { k: 'Operating System', v: 'Angadi-GO OS v4.2' },
            { k: 'Processor', v: 'Quantum Entanglement Core' },
            { k: 'Material', v: 'Titanium-Aero Alloy' },
            { k: 'Encryption', v: 'AES-2048 Military Grade' },
            { k: 'Connectivity', v: 'Starlink + 6G Ready' },
            { k: 'Warranty', v: '5-Year Global Hardware' }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-6 border-white/5 hover:border-primary/20 transition-all">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">{item.k}</span>
              <span className="text-white font-black uppercase tracking-tighter italic">{item.v}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
