import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import InteractiveHero from '../components/InteractiveHero';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Cpu, Drone, Brain, Zap, Shield, Loader2, ArrowRight } from 'lucide-react';
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

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'product'), limit(4));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedProducts(productsList);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      <InteractiveHero />

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
