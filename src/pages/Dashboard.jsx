import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Settings, Package, Bell, Shield, LogOut,
  ChevronRight, Database, CheckCircle, AlertCircle, Trash2, Loader2,
  Cpu, MapPin, Calendar, CreditCard, Edit3, Camera, Save, X, ChevronDown,
  ExternalLink, Crown, Heart, ShieldCheck, Globe, Zap
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { db, auth as firebaseAuth, storage } from '../lib/firebase';
import {
  doc, setDoc, collection, getDocs,
  query, where, deleteDoc, writeBatch, updateDoc
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProductCard from '../components/ProductCard';

const DUMMY_PRODUCTS = [
  {
    id: 'product1',
    name: 'Soil Moisture Sensor Hygrometer Module',
    category: 'Sensors',
    price: 31,
    oldPrice: 45,
    sku: '12251',
    status: 'In Stock',
    rating: 3,
    reviews: 3,
    discount: 31,
    description: 'High precision soil moisture detection for automated irrigation systems.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    specifications: { Power: '3.3V-5V', Output: 'Digital/Analog' }
  },
  {
    id: 'product2',
    name: 'Capacitive Soil Moisture Sensor',
    category: 'Sensors',
    price: 52,
    sku: '130230',
    status: 'Out of Stock',
    rating: 4.5,
    reviews: 2,
    description: 'Corrosion resistant capacitive sensor for long-term soil monitoring.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
    specifications: { Voltage: '5V', Interface: 'Analog' }
  }
];

const Dashboard = () => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [initStatus, setInitStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('Order History');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Profile Edit States
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const [isUploading, setIsUploading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Settings States
  const [metricsEnabled, setMetricsEnabled] = useState(true);
  const [liveStockEnabled, setLiveStockEnabled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('neural_theme') || 'Default Dark');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('neural_theme', newTheme);
    document.body.className = '';
    if (newTheme === 'High Contrast') document.body.classList.add('contrast-125');
    if (newTheme === 'Neon Pulse') document.body.classList.add('backdrop-hue-rotate-90');
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        ordersList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(ordersList);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === currentUser.name) {
      setIsEditingName(false);
      return;
    }

    setInitStatus('loading');
    try {
      await updateUserProfile({ name: newName });
      setInitStatus('success');
      setIsEditingName(false);
      setTimeout(() => setInitStatus(null), 3000);
    } catch (err) {
      setInitStatus('error');
      setErrorMessage(err.message || "Failed to update name.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setInitStatus('error');
      setErrorMessage("File too large. Max 2MB.");
      return;
    }

    setIsUploading(true);
    setInitStatus('loading');

    try {
      console.log("PHOTO_ACQUISITION_INITIATED:", file.name);

      // Secondary Backup: Convert to Base64 immediately in case of Storage failure
      const reader = new FileReader();
      const getBase64 = () => new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const localDataUrl = await getBase64();
      console.log("LOCAL_DATA_URL_READY");

      try {
        // Attempt Primary: Firebase Storage
        const storageRef = ref(storage, `profiles/${currentUser.uid}/avatar_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("STORAGE_LINK_ACQUIRED:", downloadURL);
        await updateUserProfile({ photoURL: downloadURL });
      } catch (storageErr) {
        console.warn("STORAGE_LINK_FAILED, FALLING_BACK_TO_DATA_URL", storageErr);
        // Fallback: Save the Data URL (Base64) to Firestore
        // This ensures the photo is saved even if Storage rules/CORS are blocked
        await updateUserProfile({ photoURL: localDataUrl });
      }

      setInitStatus('success');
      setTimeout(() => setInitStatus(null), 3000);
    } catch (err) {
      console.error("CRITICAL_SYNC_FAILURE:", err);
      setInitStatus('error');
      setErrorMessage("System failed to link image. Check connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInitializeStore = async () => {
    setInitStatus('loading');
    try {
      for (const product of DUMMY_PRODUCTS) {
        await setDoc(doc(db, 'product', product.id), product);
      }
      setInitStatus('success');
      setTimeout(() => setInitStatus(null), 3000);
    } catch (err) {
      setInitStatus('error');
      setErrorMessage(err.message);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm("Are you sure? This will wipe all products and orders.")) return;
    setInitStatus('loading');
    try {
      const batch = writeBatch(db);
      const prodSnap = await getDocs(collection(db, 'product'));
      prodSnap.forEach(doc => batch.delete(doc.ref));
      const orderSnap = await getDocs(collection(db, 'orders'));
      orderSnap.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      setOrders([]);
      setInitStatus('success');
      setTimeout(() => setInitStatus(null), 3000);
    } catch (err) {
      setInitStatus('error');
      setErrorMessage(err.message);
    }
  };

  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const handleCancelOrder = async (orderId) => {
    setInitStatus('loading');
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'Cancelled'
      });
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      
      setInitStatus('success');
      setCancellingOrderId(null);
      setTimeout(() => setInitStatus(null), 3000);
    } catch (err) {
      console.error("Cancellation failed:", err);
      setInitStatus('error');
      setErrorMessage("System failed to abort deployment.");
    }
  };

  const handleEnable2FA = () => {
    setInitStatus('loading');
    setTimeout(() => {
      setInitStatus('success');
      setTimeout(() => setInitStatus(null), 3000);
    }, 1000);
  };

  const handleRevokeSessions = () => {
    setInitStatus('loading');
    setTimeout(() => {
      setInitStatus('success');
      setTimeout(() => setInitStatus(null), 3000);
    }, 1000);
  };

  const formatOrderDate = (createdAt) => {
    if (!createdAt) return 'RECENT';
    if (typeof createdAt.toDate === 'function') return createdAt.toDate().toLocaleString();
    if (createdAt.seconds) return new Date(createdAt.seconds * 1000).toLocaleString();
    try {
      return new Date(createdAt).toLocaleString();
    } catch {
      return 'RECENT';
    }
  };

  const canCancelOrder = (createdAt) => {
    if (!createdAt) return false;
    let orderTime;
    if (typeof createdAt.toDate === 'function') {
      orderTime = createdAt.toDate().getTime();
    } else if (createdAt.seconds) {
      orderTime = createdAt.seconds * 1000;
    } else {
      orderTime = new Date(createdAt).getTime();
    }
    if (isNaN(orderTime)) return false;
    const currentTime = new Date().getTime();
    const diffInHours = (currentTime - orderTime) / (1000 * 60 * 60);
    return diffInHours < 5;
  };

  const menuItems = [
    { icon: Package, label: 'Order History' },
    { icon: Heart, label: 'Neural Wishlist' },
    { icon: Shield, label: 'Security & Access' },
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Neural Settings' },
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-8 text-center border-primary/20 relative group">
            <div
              className={`w-24 h-24 rounded-full bg-primary/20 border-2 border-primary mx-auto mb-6 flex items-center justify-center overflow-hidden relative cursor-pointer group ${
                currentUser.plan === 'gold' ? 'shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]' : ''
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {/* Crown Overlay for Elite Tiers */}
              {(currentUser.plan === 'gold' || currentUser.plan === 'silver') && (
                <div className="absolute top-1 right-1 z-20 bg-dark/80 p-1 rounded-full border border-primary animate-bounce">
                  <Crown size={12} className={currentUser.plan === 'gold' ? 'text-yellow-500' : 'text-slate-400'} />
                </div>
              )}
              {isUploading ? (
                <Loader2 className="animate-spin text-primary" size={32} />
              ) : currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-primary" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} accept="image/*" />

            <div className="space-y-4">
              {isEditingName ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/5 border border-primary/30 rounded-lg px-3 py-1 text-center text-white focus:outline-none focus:border-primary text-sm font-bold uppercase"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-center">
                    <button onClick={handleUpdateName} className="p-1 bg-primary rounded hover:bg-primary-glow text-white"><Save size={14} /></button>
                    <button onClick={() => setIsEditingName(false)} className="p-1 bg-white/10 rounded hover:bg-white/20 text-gray-400"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic flex items-center gap-2">
                    {currentUser.name || 'ANONYMOUS'}
                    {(currentUser.plan === 'gold' || currentUser.plan === 'silver') && (
                      <Crown size={18} className={currentUser.plan === 'gold' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-slate-400'} />
                    )}
                  </h3>
                  <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-white"><Edit3 size={14} /></button>
                </div>
              )}
              <p className="text-gray-500 text-[10px] uppercase tracking-widest truncate max-w-full">{currentUser.email}</p>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-b border-white/5 last:border-0 ${activeTab === item.label ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}

            <div className="border-t border-white/10 mt-2">
              <button onClick={handleInitializeStore} disabled={initStatus === 'loading'} className="w-full flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-accent hover:bg-accent/10 transition-colors border-b border-white/5">
                <Database size={16} /> INITIALIZE STORE
              </button>
              <button onClick={handleClearData} disabled={initStatus === 'loading'} className="w-full flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-colors border-b border-white/5">
                <Trash2 size={16} /> PURGE DATABASE
              </button>
              <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-white/5 hover:text-red-500 transition-colors">
                <LogOut size={16} /> DISCONNECT
              </button>
            </div>
          </div>

          <AnimatePresence>
            {initStatus === 'success' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl flex items-center gap-3 text-green-500 text-[10px] font-bold uppercase">
                <CheckCircle size={14} /> Synchronized
              </motion.div>
            )}
            {initStatus === 'error' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-500 text-[10px] font-bold">
                <div className="flex items-center gap-2"><AlertCircle size={14} /> Failure</div>
                <p className="opacity-70 mt-1">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-panel p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -z-0" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-4 italic uppercase">
                Welcome, <span className="text-primary">{currentUser.name?.split(' ')[0] || 'GUEST'}</span>
              </h2>
              <p className="text-gray-400 max-w-xl">
                Your neural profile is active. Use the terminal below to review recent acquisitions and deployment nodes.
              </p>
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white uppercase tracking-widest italic flex items-center gap-2">
                <Package size={24} className="text-primary" /> {activeTab}
              </h3>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{orders.length} ACTIVE DEPLOYMENTS</span>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'Order History' ? (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {loadingOrders ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <motion.div key={order.id} className="glass-panel group border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50" />

                        <div className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-2 space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 group-hover:border-primary transition-colors">
                                  <Cpu size={24} />
                                </div>
                                <div>
                                  <div className="text-white font-black italic tracking-tighter uppercase truncate max-w-[200px]">ID: {order.orderId || order.id}</div>
                                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} /> {formatOrderDate(order.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {order.items?.map((item, i) => (
                                  <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-400 border border-white/5">
                                    {item.quantity}X {item.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={12} className="text-primary" /> TARGET NODE
                              </div>
                              <div className="text-sm font-bold text-white uppercase tracking-widest">{order.address || 'NEO-CITY, SECTOR 7'}</div>
                            </div>

                            <div className="text-right space-y-4">
                              <div className="text-2xl font-black text-white italic">₹{(order.pricing?.grandTotal || order.total || 0).toLocaleString('en-IN')}</div>
                              
                              <div className="flex flex-col items-end gap-2">
                                {order.status !== 'Cancelled' && canCancelOrder(order.createdAt) && (
                                  <div className="flex flex-col items-end gap-2">
                                    {cancellingOrderId === order.id ? (
                                      <div className="flex items-center gap-2 bg-red-500/10 p-1 rounded-lg border border-red-500/20">
                                        <span className="text-[8px] font-bold text-red-500 px-2 uppercase tracking-tighter">Confirm Abort?</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCancelOrder(order.id);
                                          }}
                                          className="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                        >
                                          YES
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCancellingOrderId(null);
                                          }}
                                          className="bg-white/10 text-gray-400 text-[9px] font-black px-3 py-1 rounded hover:bg-white/20 transition-colors"
                                        >
                                          NO
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCancellingOrderId(order.id);
                                        }}
                                        className="text-[9px] font-bold text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                      >
                                        <X size={12} /> ABORT_DEPLOYMENT
                                      </button>
                                    )}
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                  className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                                >
                                  {expandedOrder === order.id ? 'HIDE_DETAILS' : 'VIEW_DETAILS'}
                                  <ChevronDown size={14} className={`transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detailed View */}
                        <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-white/5 bg-white/[0.02] p-8 overflow-hidden"
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Package size={14} className="text-primary" /> Inventory Manifest
                                  </h4>
                                  <div className="space-y-4">
                                    {order.items?.map((item, i) => (
                                      <div key={i} className="flex items-center gap-4 group/item">
                                        <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 overflow-hidden group-hover/item:border-primary transition-colors">
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-bold text-white uppercase">{item.name}</div>
                                          <div className="text-[10px] font-bold text-gray-500 uppercase">UNIT_PRICE: ₹{item.price?.toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="ml-auto text-sm font-black text-primary">X{item.quantity}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-6">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={14} className="text-primary" /> Settlement Data
                                  </h4>
                                  <div className="glass-panel p-6 border-white/10 space-y-3">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-500 uppercase font-bold">Method</span>
                                      <span className="text-white font-bold uppercase">{order.paymentMethod || 'NEURAL_CARD'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-500 uppercase font-bold">Status</span>
                                      <span className={`font-bold uppercase ${order.status === 'Cancelled' ? 'text-red-500' : 'text-green-500'}`}>
                                        {order.status || 'DEPLOYING'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-500 uppercase font-bold">Node Address</span>
                                      <span className="text-white font-bold uppercase truncate max-w-[150px]">{order.address || 'SECTOR 7'}</span>
                                    </div>
                                    <div className="pt-2 border-t border-white/5">
                                      <div className="text-[8px] font-black text-red-500/50 uppercase tracking-[0.2em] flex items-center gap-1">
                                        <Shield size={10} /> NON-RETURNABLE ACQUISITION
                                      </div>
                                    </div>
                                  </div>
                                  <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                    <ExternalLink size={14} /> GENERATE PROTOCOL LOG
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  ) : (
                    <div className="glass-panel p-20 text-center">
                      <Package size={48} className="mx-auto text-gray-700 mb-6" />
                      <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">No deployments initiated.</h3>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'Neural Wishlist' ? (
                <motion.div key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {wishlist.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="glass-panel p-20 text-center">
                      <Heart size={48} className="mx-auto text-gray-700 mb-6" />
                      <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">Neural Wishlist Empty.</h3>
                      <p className="text-gray-600 mt-2 text-xs uppercase tracking-widest">Track units for future acquisition.</p>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'Security & Access' ? (
                <motion.div key="security" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="glass-panel p-8 border-white/5 space-y-8">
                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <div className="text-white font-bold uppercase tracking-tighter">Two-Factor Authentication</div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase">Biometric Link Status: SECURE</div>
                        </div>
                      </div>
                      <button onClick={handleEnable2FA} disabled={initStatus === 'loading'} className="px-6 py-2 bg-white/5 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-primary hover:text-white transition-all">ENABLE</button>
                    </div>

                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                          <Globe size={24} />
                        </div>
                        <div>
                          <div className="text-white font-bold uppercase tracking-tighter">Active Sessions</div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase">Currently synced with 1 neural node</div>
                        </div>
                      </div>
                      <button onClick={handleRevokeSessions} disabled={initStatus === 'loading'} className="px-6 py-2 bg-white/5 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-red-500/20 hover:text-red-500 transition-all">REVOKE ALL</button>
                    </div>

                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap size={16} className="text-primary" />
                        <span className="text-xs font-black text-white uppercase italic">Account Registry: {String(currentUser.plan || 'STANDARD').toUpperCase()} TIED_NODE</span>
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-relaxed">
                        Your account is currently registered on the {String(currentUser.plan || 'standard')} tier. Upgrade to ELITE for prioritized neural processing.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === 'Notifications' ? (
                <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  {[
                    { title: "SYSTEM_UPGRADE_COMPLETE", desc: "Neural OS v4.2 has been successfully deployed to your node.", time: "2m ago", type: "system" },
                    { title: "ACQUISITION_VERIFIED", desc: "Your recent hardware order AG-38291 is now in transit.", time: "5h ago", type: "order" },
                    { title: "SECURITY_ALERT", desc: "New login detected from a verified Vercel endpoint.", time: "1d ago", type: "alert" }
                  ].map((notif, i) => (
                    <div key={i} className="glass-panel p-6 border-white/5 flex items-start gap-4 hover:border-primary/30 transition-all cursor-pointer group">
                      <div className={`w-2 h-2 rounded-full mt-2 ${notif.type === 'alert' ? 'bg-red-500 animate-ping' : 'bg-primary'}`} />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-black text-white italic tracking-tight group-hover:text-primary transition-colors">{notif.title}</h4>
                          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-normal">{notif.desc}</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] hover:text-white transition-colors italic">CLEAR_ALL_LOGS</button>
                </motion.div>
              ) : activeTab === 'Neural Settings' ? (
                <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="glass-panel p-8 border-white/5 space-y-10">
                    <div>
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Database size={14} className="text-primary" /> Data Preferences
                      </h3>
                      <div className="space-y-4">
                        <label onClick={() => setMetricsEnabled(!metricsEnabled)} className="flex items-center justify-between cursor-pointer group p-4 rounded-xl hover:bg-white/5 transition-colors">
                          <span className="text-sm font-bold text-white uppercase tracking-tighter italic">Anonymous Neural Metrics</span>
                          <div className={`w-12 h-6 rounded-full relative p-1 transition-colors ${metricsEnabled ? 'bg-primary/20 group-hover:bg-primary/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${metricsEnabled ? 'right-1 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'left-1 bg-gray-600'}`} />
                          </div>
                        </label>
                        <label onClick={() => setLiveStockEnabled(!liveStockEnabled)} className="flex items-center justify-between cursor-pointer group p-4 rounded-xl hover:bg-white/5 transition-colors">
                          <span className="text-sm font-bold text-white uppercase tracking-tighter italic">Live Stock Updates</span>
                          <div className={`w-12 h-6 rounded-full relative p-1 transition-colors ${liveStockEnabled ? 'bg-primary/20 group-hover:bg-primary/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${liveStockEnabled ? 'right-1 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'left-1 bg-gray-600'}`} />
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Cpu size={14} className="text-primary" /> Visual Interface
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {['Default Dark', 'High Contrast', 'Neon Pulse'].map((t) => (
                          <button key={t} onClick={() => handleThemeChange(t)} className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest italic transition-all ${theme === t ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all italic mt-12">
                      TERMINATE_NEURAL_LINK (DELETE ACCOUNT)
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="glass-panel p-20 text-center text-gray-500 uppercase font-bold tracking-widest italic">Neural link restricted.</div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
