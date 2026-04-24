import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ChatBot from './ChatBot';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Sync global body theme with neural tier
  useEffect(() => {
    const plan = currentUser?.plan?.toLowerCase() || 'brown';
    
    // Remove existing themes
    document.body.classList.remove('theme-gold', 'theme-silver', 'theme-brown');
    
    // Inject new tier class to root body for global variable propagation
    document.body.classList.add(`theme-${plan}`);
    
    console.log(`%cNEURAL_THEME_SYNC: ${plan.toUpperCase()}_MODE_ACTIVE`, "color: #3b82f6; font-weight: bold;");
  }, [currentUser]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ChatBot />
      <main className="flex-grow">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
