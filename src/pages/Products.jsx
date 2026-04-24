import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, Grid, List, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOrder, setSortOrder] = useState('default');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const categories = ['All', 'electronics', 'Robotics', 'AI', 'Drones'];

  const sortOptions = [
    { label: 'Neural Default', val: 'default' },
    { label: 'Price: Low to High', val: 'price-asc' },
    { label: 'Price: High to Low', val: 'price-desc' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'product'));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const sortedAndFilteredProducts = [...products]
    .filter(p => {
      const productCat = p.category?.toLowerCase() || '';
      const matchesCategory = filter === 'All' || productCat === filter.toLowerCase();
      const matchesSearch = 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      return 0; // default (neural order)
    });

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 italic uppercase leading-none">
          Technology <span className="text-primary italic">Catalog</span>
        </h1>
        <p className="text-gray-500 max-w-2xl font-bold uppercase tracking-[0.2em] text-[10px]">
          Browsing classified deployment units sourced directly from your neural storage.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search technology..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all uppercase tracking-widest text-xs font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] whitespace-nowrap transition-all uppercase italic border ${
                filter === cat 
                ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-40"><Loader2 className="text-primary animate-spin" size={48} /></div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-white/5 gap-6">
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black italic">
              Showing {sortedAndFilteredProducts.length} Neural Nodes
            </span>
            
            <div className="flex items-center gap-6">
              {/* View Toggle */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all italic"
                >
                  <SlidersHorizontal size={14} /> 
                  {sortOptions.find(o => o.val === sortOrder).label}
                  <ChevronDown size={14} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-dark/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => {
                            setSortOrder(opt.val);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                            sortOrder === opt.val ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" 
            : "flex flex-col gap-6"
          }>
            {sortedAndFilteredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} variant={viewMode} />
            ))}
          </div>

          {sortedAndFilteredProducts.length === 0 && (
            <div className="py-40 text-center glass-panel">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">No Technology Found</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">The product database returned zero active nodes.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
