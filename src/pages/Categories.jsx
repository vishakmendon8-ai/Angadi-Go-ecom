import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Cpu, Plane, Zap, Loader2, Microchip, Radio, Settings2, Eye, 
  Grid, List, SlidersHorizontal, ChevronDown, Search 
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const CategoryCard = ({ icon: Icon, title, count, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`glass-panel p-8 flex flex-col items-center gap-4 transition-all group ${
      active 
      ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
      : 'border-white/5 hover:border-primary/50'
    }`}
  >
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
      active ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'
    }`}>
      <Icon size={32} />
    </div>
    <div className="text-center">
      <h3 className={`font-black italic uppercase tracking-tighter text-lg ${active ? 'text-white' : 'text-gray-400'}`}>
        {title}
      </h3>
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">
        {count} UNITS AVAILABLE
      </p>
    </div>
  </button>
);

const Categories = () => {
  const [searchParams] = useSearchParams();
  const isComponentSilo = searchParams.get('view') === 'components';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(isComponentSilo ? 'All Components' : 'All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOrder, setSortOrder] = useState('default');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = [
    { label: 'Neural Default', val: 'default' },
    { label: 'Price: Low to High', val: 'price-asc' },
    { label: 'Price: High to Low', val: 'price-desc' },
  ];

  useEffect(() => {
    if (isComponentSilo) {
      setSelectedCategory('All Components');
    } else {
      setSelectedCategory('All');
    }
  }, [isComponentSilo]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const targetCollection = isComponentSilo ? 'components' : 'product';
        const docSnap = await getDocs(collection(db, targetCollection));
        
        const data = docSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);
      } catch (err) {
        console.error("Error fetching units:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isComponentSilo]);

  const GLOBAL_TAXONOMY = [
    { title: 'All', icon: Box },
    { title: 'Electronics', icon: Cpu },
    { title: 'Robotics', icon: Zap },
    { title: 'Drones', icon: Plane },
    { title: 'AI', icon: Cpu },
  ];

  const COMPONENT_REPOSITORY = [
    { title: 'All Components', icon: Box },
    { title: 'Control Modules', icon: Microchip },
    { title: 'Robotics Components', icon: Settings2 },
    { title: 'Drone Components', icon: Plane },
    { title: 'Sensors & Modules', icon: Radio },
    { title: 'Optical Units', icon: Eye },
  ];

  const activeMap = isComponentSilo ? COMPONENT_REPOSITORY : GLOBAL_TAXONOMY;

  const filteredProducts = products.filter(p => {
    const name = p.name?.toLowerCase() || '';
    const cat = p.category?.toLowerCase() || '';
    const selected = selectedCategory.toLowerCase();
    
    const matchesCategory = selected === 'all' || selected === 'all components' || cat === selected;
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    return 0;
  });

  const getCount = (catName) => {
    const selected = catName.toLowerCase();
    if (selected === 'all' || selected === 'all components') return products.length;
    return products.filter(p => p.category?.toLowerCase() === selected).length;
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase mb-4">
          Neural <span className="text-primary">{isComponentSilo ? 'Repository' : 'Taxonomy'}</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold leading-relaxed">
          {isComponentSilo 
            ? 'Accessing authorized hardware sub-nodes. Filter deployment groups below.' 
            : 'Classified technology index. Select a node to filter active deployment units.'}
        </p>
      </div>
      
      {/* Search Bar - Unified UI */}
      <div className="mb-16 relative max-w-2xl mx-auto group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder={isComponentSilo ? "SEARCH HARDWARE REGISTRY..." : "SEARCH TECHNOLOGY TAXONOMY..."}
            className="w-full bg-dark border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-black italic text-white placeholder:text-gray-700 focus:outline-none focus:border-primary transition-all uppercase tracking-[0.2em]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <>
          <div className={`grid grid-cols-2 ${isComponentSilo ? 'md:grid-cols-6' : 'md:grid-cols-5'} gap-4 mb-20 text-white`}>
            {activeMap.map((cat) => (
              <CategoryCard 
                key={cat.title}
                icon={cat.icon}
                title={cat.title}
                count={getCount(cat.title)}
                active={selectedCategory === cat.title}
                onClick={() => setSelectedCategory(cat.title)}
              />
            ))}
          </div>

          <div className="border-t border-white/5 pt-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                <span className="w-12 h-[1px] bg-primary"></span>
                {isComponentSilo ? `${selectedCategory}` : `${selectedCategory} Deployments`}
              </h2>

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
              {sortedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={p} variant={viewMode} />
                </motion.div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="py-40 text-center glass-panel">
                <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">
                  No modules detected in this node.
                </h3>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Categories;
