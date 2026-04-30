import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, Bot, User, ShoppingCart, Sparkles, 
  Crown, Loader2, Lock, ArrowRight, Terminal, Activity, 
  Download, FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const ChatBot = () => {
  const { currentUser, updateChatCount } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([
    { role: 'assistant', content: 'Neural link established. **Angadi-GO OS v4.2** online. How can I assist your robotic project today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // Proactive popup logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowPopup(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const quickSuggestions = [
    { label: "🚁 DRONE_GUIDE", query: "Give me a technical guide for a DIY drone project." },
    { label: "🤖 ROBOT_ARM", query: "How do I build a 4-DOF robot arm with AI modules?" },
    { label: "📜 FULL_REPORT", query: "Provide a complete technical manifest for an AI rover." },
  ];

  const handleDownloadReport = async (content) => {
    if (!currentUser || currentUser.plan === 'brown') {
      setShowLimitModal(true);
      return;
    }

    try {
        const response = await fetch(`/api/generate-pdf-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: content.replace('::REPORT_READY::', ''),
                plan: currentUser.plan
            })
        });

        if (!response.ok) throw new Error("TOKEN_PACKET_LOSS");

        const { token } = await response.json();
        window.location.href = `/api/download-manifest/${token}`;
    } catch (err) {
        console.error("MANIFEST_SYNCHRONIZATION_FAILURE:", err);
        alert(`NEURAL_OS_ERROR: ${err.message || "Failed to download manifest."}`);
    }
  };

  const handleSuggestion = (query) => {
    setMessage(query);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    if (!currentUser) {
      navigate('/auth');
      return;
    }

    if (currentUser.plan === 'brown' && currentUser.chatCount >= 5) {
      setShowLimitModal(true);
      return;
    }

    const userMessage = { role: 'user', content: message };
    setChats(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    setShowPopup(false);

    try {
      const response = await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chats, userMessage].map(c => ({ role: c.role, content: c.content })),
          model: 'openai/gpt-oss-120b',
          plan: currentUser.plan || 'brown',
          userName: currentUser.name || 'Pilot'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error (${response.status})`);
      }

      const data = await response.json();
      
      if (data.message) {
        // Client-Side Final Currency Sanitization (Quad-Lock)
        const sanitizedMessage = data.message.replace(/\$(\d+(?:,\d+)?(?:\.\d+)?)/g, (match, p1) => {
          const val = parseFloat(p1.replace(/,/g, ''));
          return `₹${(val * 80).toLocaleString('en-IN')}`;
        }).replace(/USD/gi, 'INR').replace(/dollars/gi, 'Rupees');

        setChats(prev => [...prev, { role: 'assistant', content: sanitizedMessage }]);
        if (currentUser.plan === 'brown') {
          await updateChatCount(currentUser.chatCount + 1);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error("AI_LINK_FAILED:", err);
      const errorMessage = err.message || 'Connection to Groq Neural Engine lost.';
      setChats(prev => [...prev, { role: 'assistant', content: `**CRITICAL_ERROR**: ${errorMessage}.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Proactive Assistant Popup */}
      <AnimatePresence>
        {showPopup && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-28 right-8 z-[60] glass-panel bg-primary px-6 py-3 rounded-2xl border-primary shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-white animate-pulse" />
              <p className="text-[10px] font-black italic text-white uppercase tracking-tighter">
                NEURAL_LINK: I AM YOUR ASISTANT. HOW CAN I HELP?
              </p>
              <button onClick={() => setShowPopup(false)} className="ml-2 text-white/50 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)" }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowPopup(false);
        }}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center z-50 transition-all duration-500 shadow-2xl ${
          currentUser?.plan === 'gold' 
          ? 'bg-yellow-500 text-black' 
          : 'bg-primary text-white shadow-[0_0_30px_rgba(59,130,246,0.4)]'
        }`}
      >
        {isOpen ? <X size={28} /> : (
            <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Bot size={32} />
                </motion.div>
                {currentUser?.plan === 'brown' && (
                    <span className="absolute -top-5 -right-5 bg-primary/20 backdrop-blur-xl px-2 py-0.5 rounded-full text-[9px] font-black italic border border-primary/30 text-primary">
                        {currentUser.chatCount}/5
                    </span>
                )}
            </div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, rotateX: -10 }}
            className="fixed bottom-28 right-8 w-[420px] h-[640px] glass-panel p-0 z-50 flex flex-col border-primary/20 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <div className={`p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden ${
                currentUser?.plan === 'gold' ? 'bg-yellow-500/5' : 'bg-primary/5'
            }`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all group ${
                    currentUser?.plan === 'gold' ? 'bg-yellow-500 text-black' : 'bg-primary/10 text-primary'
                }`}>
                  <Bot size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
                    Neural Assistant <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  </h3>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    {currentUser?.plan === 'brown' ? `DATA_LINK: ${currentUser.chatCount}/5 PACKETS` : 'UNLIMITED_BANDWIDTH'}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide relative bg-[linear-gradient(rgba(10,10,20,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,20,0.4)_1px,transparent_1px)] bg-[size:20px_20px]">
              {chats.map((chat, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: chat.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex flex-col ${chat.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`}
                >
                  <div className={`max-w-[90%] p-4 rounded-2xl relative ${
                    chat.role === 'user' 
                    ? (currentUser?.plan === 'gold' ? 'bg-yellow-500 text-black font-black italic shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-primary text-white font-bold italic shadow-[0_0_15px_rgba(59,130,246,0.3)]')
                    : 'bg-white/[0.03] border border-white/5 text-gray-400'
                  }`}>
                    <div className="text-xs leading-relaxed prose prose-invert prose-p:my-0 prose-ul:my-2 prose-li:my-0">
                      <ReactMarkdown>{String(chat.content || '').replace('::REPORT_READY::', '').replace(/::SUGGEST_CART:[^:]+::/g, '')}</ReactMarkdown>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 justify-end">
                      {chat.role === 'assistant' && chat.content?.includes('::REPORT_READY::') && (
                        <button
                          onClick={() => handleDownloadReport(String(chat.content || '').replace('::REPORT_READY::', '').replace(/::SUGGEST_CART:[^:]+::/g, ''))}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black italic transition-all ${
                            currentUser?.plan !== 'brown' ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white' : 'bg-white/5 text-gray-600'
                          }`}
                        >
                          {currentUser?.plan === 'brown' ? <Lock size={12} /> : <FileText size={12} />}
                          DOWNLOAD_MANIFEST
                        </button>
                      )}

                      {chat.role === 'assistant' && typeof chat.content === 'string' && /::SUGGEST_CART:/i.test(chat.content) && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const match = chat.content.match(/::SUGGEST_CART:\s*([^:]+?)\s*::/i);
                            if (match && match[1]) {
                              const itemName = match[1].replace(/[*_`]/g, '').trim();
                              try {
                                const componentsRef = collection(db, 'components');
                                const productsRef = collection(db, 'product');
                                const [compSnap, prodSnap] = await Promise.all([
                                  getDocs(componentsRef),
                                  getDocs(productsRef)
                                ]);
                                const allItems = [
                                  ...compSnap.docs.map(d => ({ ...d.data(), id: d.id, type: 'Component' })),
                                  ...prodSnap.docs.map(d => ({ ...d.data(), id: d.id, type: 'Product' }))
                                ];
                                const normalize = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                                const searchNameNormalized = normalize(itemName);
                                const match = allItems.find(item => {
                                  const dbNameNormalized = normalize(item.name || '');
                                  return dbNameNormalized === searchNameNormalized || 
                                         dbNameNormalized.includes(searchNameNormalized) ||
                                         searchNameNormalized.includes(dbNameNormalized);
                                });
                                if (match) {
                                  addToCart({ 
                                    id: match.id, 
                                    name: match.name || itemName, 
                                    price: Number(match.price) || 0, 
                                    image: match.image || '/logo.png',
                                    category: match.type === 'Component' ? 'Hardware Component' : (match.category || 'System')
                                  });
                                  setChats(prev => [...prev, { role: 'assistant', content: `**ACQUISITION_SUCCESS**: The **${itemName}** added to cart.` }]);
                                }
                              } catch (err) { console.error(err); }
                            }
                          }}
                          className="flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black italic bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 transition-all"
                        >
                          <ShoppingCart size={14} /> ACQUIRE_UNIT
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase italic tracking-widest px-2">
                  <Loader2 className="animate-spin" size={14} />
                  ACQUIRING NEURAL DATA...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-white/[0.01]">
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {quickSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestion(s.query)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black italic text-gray-500 hover:bg-primary/20 hover:text-primary transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <input
                  type="text"
                  placeholder="ENTER_COMMAND_"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isTyping}
                  className="relative w-full bg-dark border border-white/10 rounded-xl py-5 pl-14 pr-14 text-[11px] font-black italic text-white placeholder:text-gray-700 focus:outline-none focus:border-primary transition-all uppercase"
                />
                <Bot className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                <button
                  type="submit"
                  disabled={isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
