import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import InteractiveHero from '../components/InteractiveHero';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Drone, Brain, Zap, Shield, Loader2, ArrowRight, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="glass-panel p-8 group hover:border-primary/50 transition-all">
    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tighter">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const FloatingItem = ({ product, side, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: side === 'left' ? -100 : 100 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4], 
      x: side === 'left' ? [-100, -80, -100] : [100, 80, 100],
      y: [0, -20, 0]
    }}
    transition={{ 
      duration: 6, 
      repeat: Infinity, 
      delay: delay,
      ease: "easeInOut"
    }}
    className={`fixed ${side === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-10 hidden lg:block pointer-events-none`}
  >
    <div className="glass-panel p-3 w-32 md:w-40 xl:w-48 shadow-[10px_10px_30px_#000000,-2px_-2px_20px_#1a1a1a] border-primary/20 backdrop-blur-sm scale-75 md:scale-90 xl:scale-100 opacity-60 group-hover:opacity-100 transition-opacity">
      <div className="aspect-square rounded-xl overflow-hidden mb-2 border border-white/5">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">{product.category}</div>
      <div className="text-[10px] font-bold text-white uppercase tracking-tighter truncate">{product.name}</div>
    </div>
  </motion.div>
);

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [floatingProducts, setFloatingProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'product'));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllProducts(productsList);
        setFeaturedProducts(productsList.slice(0, 4));
        
        // Pick 2 DIFFERENT random products for floating
        if (productsList.length >= 2) {
          const shuffled = [...productsList].sort(() => Math.random() - 0.5);
          const first = shuffled[0];
          const second = shuffled.find(p => p.id !== first.id) || shuffled[1];
          setFloatingProducts([first, second]);
        } else if (productsList.length === 1) {
          setFloatingProducts([productsList[0], productsList[0]]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    if (searchValue.trim().length > 1) {
      const filtered = allProducts
        .filter(p => p.name.toLowerCase().includes(searchValue.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchValue, allProducts]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Floating Items */}
      {floatingProducts.length >= 2 && (
        <>
          <FloatingItem product={floatingProducts[0]} side="left" delay={0} />
          <FloatingItem product={floatingProducts[1]} side="right" delay={2} />
        </>
      )}

      <InteractiveHero />

      {/* 3D Embossed Search Bar */}
      <section className="py-12 -mt-10 md:-mt-20 relative z-30 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            {/* 3D Outer Frame */}
            <div className="absolute inset-0 bg-dark rounded-[1.5rem] md:rounded-[2.5rem] shadow-[10px_10px_20px_#000000,-5px_-5px_20px_#1a1a1a] opacity-50 blur-sm" />
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchValue.trim()) {
                  navigate(`/products?q=${encodeURIComponent(searchValue.trim())}`);
                  setSuggestions([]);
                }
              }}
              className="relative bg-dark/80 backdrop-blur-xl border border-white/5 rounded-[1.2rem] md:rounded-[2rem] p-2 md:p-4 flex items-center gap-2 md:gap-4 shadow-[inset_2px_2px_10px_rgba(255,255,255,0.05),inset_-2px_-2px_10px_rgba(0,0,0,0.5)] group-hover:border-primary/30 transition-all duration-500"
            >
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[4px_4px_10px_#000000,-4px_-4px_10px_#1a1a1a] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                <Brain size={20} className="animate-pulse md:hidden" />
                <Brain size={24} className="animate-pulse hidden md:block" />
              </div>
              
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="NEURAL SEARCH..." 
                  className="w-full bg-transparent border-none py-3 md:py-4 px-2 text-white focus:outline-none placeholder:text-gray-600 font-black italic tracking-widest text-[10px] md:text-sm uppercase"
                />
                {/* Internal Glow Line */}
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-700" />
              </div>

              <button 
                type="submit"
                className="bg-primary text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-[5px_5px_15px_#000000,-2px_-2px_10px_#1a1a1a] hover:scale-105 active:scale-95 transition-all group-hover:bg-primary-glow"
              >
                <Zap size={16} className="md:hidden" />
                <Zap size={20} className="hidden md:block" />
              </button>
            </form>

            {/* Smart Suggestions Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-full mt-4 bg-dark/95 backdrop-blur-2xl border border-white/10 rounded-[1.2rem] md:rounded-[2rem] overflow-hidden z-50 shadow-2xl"
                >
                  <div className="p-3 md:p-4 bg-primary/5 border-b border-white/5 flex items-center gap-2">
                    <Sparkles size={12} className="text-primary md:block hidden" />
                    <span className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Predictions</span>
                  </div>
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group/item"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border border-white/10 group-hover/item:border-primary/50 transition-colors">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left flex-grow min-w-0">
                        <div className="text-[10px] md:text-xs font-black text-white uppercase tracking-tighter truncate">{p.name}</div>
                        <div className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{p.category}</div>
                      </div>
                      <div className="text-[10px] md:text-xs font-black text-primary italic whitespace-nowrap">₹{p.price?.toLocaleString('en-IN')}</div>
                    </button>
                  ))}
                  <button 
                    onClick={() => navigate(`/products?q=${encodeURIComponent(searchValue)}`)}
                    className="w-full p-3 md:p-4 bg-primary/10 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    View All Results <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Label */}
            <div className="absolute -top-5 md:-top-6 left-6 md:left-10 bg-dark px-3 md:px-4 py-1 rounded-full border border-white/5 text-[7px] md:text-[8px] font-black text-primary uppercase tracking-[0.3em] shadow-[5px_5px_10px_#000000]">
              Quantum Data Access
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-dark">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Units Sold', val: '50k+' },
            { label: 'Active Droids', val: '12k' },
            { label: 'AI Computations', val: '4.2 PB' },
            { label: 'Global Clients', val: '850+' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white italic mb-2 tracking-tighter">{stat.val}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-primary font-bold tracking-[0.4em] mb-4 text-xs uppercase">The Collection</h2>
              <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic">
                FEATURED INNOVATIONS
              </h3>
            </div>
            <button 
              onClick={() => navigate('/products')}
              className="text-sm font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2 group"
            >
              View catalog <Zap size={14} className="group-hover:fill-primary transition-all" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="text-primary animate-spin" size={40} />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-20 text-center text-gray-500 uppercase tracking-widest font-bold">
              Product feed offline. Initialize store to proceed.
            </div>
          )}
        </div>
      </section>

      {/* Tech Vision Section */}
      <section className="py-32 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f611,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">BEYOND IMAGINATION</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our engineering philosophy merges biological inspiration with quantum-scale precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={Brain} 
              title="Neural Intelligence" 
              desc="Proprietary AI architectures that learn and adapt to industrial complexity in real-time."
            />
            <FeatureItem 
              icon={Drone} 
              title="Autonomous Edge" 
              desc="Unmatched precision in robotic movement and drone navigation powered by Synapse engines."
            />
            <FeatureItem 
              icon={Shield} 
              title="Military Grade" 
              desc="Durability and security measures that exceed international standards for critical deployment."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-panel p-12 md:p-24 text-center relative overflow-hidden border-primary/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-8 italic">
              READY TO <span className="text-primary">ASCEND?</span>
            </h2>
            <p className="text-gray-400 mb-12 max-w-xl mx-auto">
              Join the elite circle of innovators using Angadi-GO technologies to reshape the world.
            </p>
            <button 
              onClick={() => navigate('/auth')}
              className="btn-primary scale-110 flex items-center justify-center gap-3 mx-auto"
            >
              SECURE YOUR ACCESS <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
