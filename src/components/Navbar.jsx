import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Zap, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout, upgradePlan } = useAuth();
  const { cart } = useCart();
  const location = useLocation();

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartItemCount);

  useEffect(() => {
    if (cartItemCount > prevCartCount) {
      setIsCartAnimating(true);
      const timer = setTimeout(() => setIsCartAnimating(false), 800);
      setPrevCartCount(cartItemCount);
      return () => clearTimeout(timer);
    } else if (cartItemCount < prevCartCount) {
      setPrevCartCount(cartItemCount);
    }
  }, [cartItemCount, prevCartCount]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Components', path: '/categories?view=components' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/80 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.img 
            src="/logo.png" 
            alt="Angadi-GO" 
            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform mix-blend-screen"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-2xl font-black tracking-tighter text-white italic uppercase">
            Angadi-GO
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`text-sm font-medium hover:text-primary transition-colors ${
                (location.pathname + location.search) === link.path ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {/* Membership Badge */}
          {currentUser && (
            <Link to="/pricing" className="flex items-center gap-2 group/plan">
              <div className={`px-3 py-1 rounded-full border text-[9px] font-black italic tracking-tighter transition-all duration-500 bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] flex items-center gap-1.5 ${
                currentUser.plan === 'gold' ? 'animate-glow-slow' : ''
              }`}>
                {(currentUser.plan === 'gold' || currentUser.plan === 'silver') && (
                  <Crown size={10} className={currentUser.plan === 'gold' ? 'text-yellow-500' : 'text-slate-400'} />
                )}
                {currentUser.plan?.toUpperCase() || 'BROWN'} TIED_NODE
              </div>
            </Link>
          )}

          <Link 
            to="/cart" 
            className={`group/cart relative p-3 transition-all duration-300 rounded-xl active:scale-110 active:text-primary ${
              isCartAnimating 
                ? 'text-white bg-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110' 
                : 'text-gray-400 hover:text-primary hover:bg-white/5'
            }`}
            aria-label="View Cart"
          >
            <ShoppingCart size={22} className={`transition-all duration-300 ${isCartAnimating ? 'scale-110 text-primary' : 'group-hover/cart:rotate-[-10deg]'}`} />
            {cart.length > 0 && (
              <span className={`absolute top-1 right-1 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-dark transition-all duration-300 ${
                isCartAnimating 
                  ? 'scale-125 shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse' 
                  : 'shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]'
              }`}>
                {cartItemCount}
              </span>
            )}
          </Link>
          
          {currentUser ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-primary transition-colors">
                <User size={22} />
              </Link>
              <button 
                onClick={logout}
                className="text-xs font-semibold px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-glow transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              SIGN IN
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-dark/95 border-b border-white/10 p-6 flex flex-col gap-6 md:hidden backdrop-blur-xl"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
              <Link to="/cart" className="flex items-center gap-3 text-lg" onClick={() => setIsOpen(false)}>
                <ShoppingCart size={20} /> Cart ({cart.length})
              </Link>
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-3 text-lg" onClick={() => setIsOpen(false)}>
                    <User size={20} /> Profile
                  </Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="text-left py-2 text-red-400">
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="w-full py-3 bg-primary text-center rounded-lg font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  SIGN IN
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
