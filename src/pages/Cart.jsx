import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, ShoppingBag, ArrowRight, CreditCard,
  MapPin, CheckCircle2, ShieldCheck, Loader2,
  Wallet, Landmark, Tag, Percent, Shield
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const OrderSuccessOverlay = ({ orderId, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-dark flex items-center justify-center p-6 backdrop-blur-2xl"
    >
      <div className="max-w-md w-full text-center border border-primary/20 p-12 rounded-3xl bg-dark/50">
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-primary shadow-[0_0_50px_rgba(59,130,246,0.5)]"
        >
          <CheckCircle2 size={48} className="text-primary" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4"
        >
          Order Placed <span className="text-primary">Successfully</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-2 font-bold uppercase tracking-widest text-xs"
        >
          Transaction Verified. Returning to Neural Hub...
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">Order ID: </span>
          <span className="text-sm text-primary font-black tracking-tighter uppercase">{orderId}</span>
        </motion.div>

        <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full max-w-[200px] mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,1)]"
          />
        </div>
      </div>
    </motion.div>
  );
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [address, setAddress] = useState('Neo-City, Sector 7');
  const [paymentMethod, setPaymentMethod] = useState('Neural Card');

  // New Discount States
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponVerifying, setCouponVerifying] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });

  // Membership Discount Calculation
  const membershipLevel = currentUser?.plan?.toLowerCase() || 'brown';
  const membershipDiscountRate = membershipLevel === 'gold' ? 0.20 : membershipLevel === 'silver' ? 0.10 : 0;

  const subtotal = total;
  const membershipSavings = subtotal * membershipDiscountRate;
  const couponSavings = subtotal * couponDiscount;
  const finalSubtotal = subtotal - membershipSavings - couponSavings;
  const tax = finalSubtotal * 0.08;
  const grandTotal = finalSubtotal + tax;

  const handleVerifyCoupon = async () => {
    if (!couponCode) return;
    setCouponVerifying(true);
    setCouponMessage({ text: '', type: '' });

    try {
      const couponRef = doc(db, 'coupons', couponCode.toUpperCase());
      const couponSnap = await getDoc(couponRef);

      if (couponSnap.exists() && couponSnap.data().isActive) {
        const discount = couponSnap.data().discount;
        setCouponDiscount(discount);
        setCouponMessage({ text: `NEURAL_ENTRY_VALID: ${discount * 100}% DISCOUNT APPLIED`, type: 'success' });
      } else {
        setCouponDiscount(0);
        setCouponMessage({ text: 'INVALID_NEURAL_CODE: ACCESS DENIED', type: 'error' });
      }
    } catch (err) {
      console.error("Coupon verification failed:", err);
      setCouponMessage({ text: 'CONNECTION_FAILURE: RETRY LATER', type: 'error' });
    } finally {
      setCouponVerifying(false);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const customOrderId = `AG-${Math.random().toString(36).toUpperCase().substring(2, 9)}`;
      
      const orderData = {
        orderId: customOrderId,
        userId: currentUser.uid,
        userName: currentUser.name || 'Anonymous User',
        userEmail: currentUser.email,
        address: address,
        paymentMethod: paymentMethod,
        items: cart,
        pricing: {
          subtotal: subtotal,
          membershipDiscount: membershipSavings,
          couponDiscount: couponSavings,
          tax: tax,
          grandTotal: grandTotal
        },
        status: 'Processing',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      setOrderId(customOrderId);
      setOrderComplete(true);
      clearCart();
    } catch (err) {
      console.error("Checkout failed:", err);
      alert(`Checkout failed: ${err.message || "Unknown error"}. Check your Firebase settings.`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-8 border border-white/10">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter mb-4 italic uppercase">Your inventory is empty</h2>
        <p className="text-gray-400 mb-10 max-w-sm">No items found in your active acquisition buffer.</p>
        <Link to="/products" className="btn-primary">EXPLORE TECH</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <AnimatePresence>
        {orderComplete && (
          <OrderSuccessOverlay
            orderId={orderId}
            onComplete={() => navigate('/dashboard')}
          />
        )}
      </AnimatePresence>

      <h1 className="text-5xl font-black text-white tracking-tighter mb-12 italic uppercase text-center md:text-left">
        Review <span className="text-primary">Acquisitions</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="glass-panel p-6 flex flex-col sm:flex-row items-center gap-6 border-white/5"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">{item.name}</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">{item.category}</p>

                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <div className="w-10 text-center font-bold text-white text-sm">
                      {item.quantity}
                    </div>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-primary text-sm font-black">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col gap-4">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all group/trash"
                  title="Remove Unit"
                >
                  <Trash2 size={20} className="group-hover/trash:rotate-12 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="glass-panel p-8 sticky top-32 border-primary/20 space-y-8">
            {/* Address */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> Delivery Node
              </h3>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-primary transition-colors text-sm font-bold uppercase"
              />
            </div>

            {/* Neural Coupon */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-[0.3em] flex items-center gap-2">
                <Tag size={14} className="text-primary" /> Neural Coupon
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="FEED CODE..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary transition-colors text-sm font-bold uppercase"
                />
                <button
                  onClick={handleVerifyCoupon}
                  disabled={couponVerifying || !couponCode}
                  className="px-4 py-3 bg-white/10 rounded-xl hover:bg-primary transition-colors text-white disabled:opacity-50"
                >
                  {couponVerifying ? <Loader2 size={16} className="animate-spin" /> : 'VERIFY'}
                </button>
              </div>
              {couponMessage.text && (
                <p className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${couponMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Total Breakdown */}
            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                <span>Subtotal</span>
                <span className="text-white text-sm tracking-tighter">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {membershipSavings > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-green-500/80">
                  <span className="flex items-center gap-1"><Percent size={12} /> {membershipLevel} Tier Benefit</span>
                  <span className="text-sm tracking-tighter">- ₹{membershipSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              {couponSavings > 0 && (
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-green-500/80">
                  <span className="flex items-center gap-1"><Tag size={12} /> Neural Coupon Code</span>
                  <span className="text-sm tracking-tighter">- ₹{couponSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                <span>Platform Tax (8%)</span>
                <span className="text-white text-sm tracking-tighter">₹{tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-end pt-4 mt-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grand Total</div>
                <div className="text-4xl font-black text-white italic tracking-tighter">₹{grandTotal.toLocaleString('en-IN')}</div>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={14} className="text-red-500" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Final Acquisition Protocol</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    By finalizing, you acknowledge our <span className="text-red-500/80">NO-RETURN / NO-EXCHANGE</span> policy for all neural units.
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn-primary w-full py-5 text-xl font-black italic tracking-tighter flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>FINALIZE ORDER <ArrowRight size={24} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
