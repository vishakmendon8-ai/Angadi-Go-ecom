import React from 'react';
import { Zap, Send, Camera, Code, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark/50 border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <img src="/logo.png" alt="Angadi-GO" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
              <span className="text-xl font-black tracking-tighter text-white italic">ANGADI-GO</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Advancing human potential through robotics, AI, and next-generation engineering. Join the revolution.
            </p>
            <div className="flex gap-4">
              {[Send, Camera, Code, Briefcase].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-4">
              {['Home', 'Products', 'Categories', 'Innovation'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-gray-400 text-sm hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Safety & Privacy', 'Terms of Service', 'Corporate'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-gray-400 text-sm hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">Get the latest updates on New Robotics releases.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-primary transition-colors"
              />
              <button className="bg-primary px-4 py-2 rounded-lg text-white font-bold text-sm hover:bg-primary-glow transition-colors">
                JOIN
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-center">
            &copy; 2026 ANGADI-GO SYSTEMS INC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-gray-500 text-xs hover:text-white">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 text-xs hover:text-white">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
