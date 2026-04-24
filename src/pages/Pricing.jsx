import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Crown, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { currentUser, upgradePlan } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'brown',
      name: 'BROWN PLAN',
      price: '0',
      description: 'Essential access for exploring the Angadi-GO ecosystem.',
      icon: MessageSquare,
      color: 'text-[#964B00]',
      features: [
        'AI customer support (limited)',
        '5 AI messages per day',
        'Basic browsing access',
        'Standard response time'
      ]
    },
    {
      id: 'silver',
      name: 'SILVER PLAN',
      price: '299',
      description: 'The standard for professional robotics acquisition.',
      icon: Shield,
      color: 'text-gray-300',
      popular: true,
      features: [
        'Unlimited AI chatbot usage',
        'Priority customer support',
        'AI project guidance',
        'Personalized recommendations',
        'Early product access'
      ]
    },
    {
      id: 'gold',
      name: 'GOLD PLAN',
      price: '599',
      description: 'VIP status within the global neural infrastructure.',
      icon: Crown,
      color: 'text-yellow-400',
      glow: true,
      features: [
        'Everything in Silver',
        'Zero delivery fees',
        'VIP instant support',
        'Advanced AI mentorship',
        'Exclusive deals & discounts',
        'Early access to all launches'
      ]
    }
  ];

  const handleUpgrade = async (planId) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    try {
      await upgradePlan(planId);
      // In a real app, this would redirect to a success page or payment gateway
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 italic uppercase"
        >
          Neural <span className="text-primary">Subscriptions</span>
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold">
          Upgrade your authentication tier to unlock advanced AI capabilities and priority deployment nodes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel relative p-8 flex flex-col h-full border-white/5 transition-all duration-500 overflow-hidden group ${
              plan.popular ? 'border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-105 z-10' : ''
            } ${
              plan.glow ? 'border-yellow-500/30' : ''
            }`}
          >
            {/* Glow Animations */}
            {plan.glow && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 blur-[50px] animate-pulse" />
            )}
            {plan.popular && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px]" />
            )}

            {plan.popular && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-primary px-3 py-1 rounded-full text-[9px] font-black italic tracking-tighter text-white">
                <Sparkles size={10} /> MOST_POPULAR
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:border-primary transition-colors ${plan.color}`}>
              <plan.icon size={28} />
            </div>

            <h3 className={`text-2xl font-black italic tracking-tighter mb-2 ${plan.color}`}>
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-white">₹{plan.price}</span>
              <span className="text-gray-500 font-bold uppercase text-[10px]">/month</span>
            </div>

            <p className="text-gray-500 text-xs font-bold leading-relaxed mb-8 h-10">
              {plan.description}
            </p>

            <div className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check size={10} className="text-green-500" />
                  </div>
                  <span className="text-gray-300 uppercase tracking-widest leading-tight font-bold text-[9px]">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={currentUser?.plan === plan.id}
              className={`w-full py-4 rounded-xl font-black italic tracking-tighter text-sm transition-all duration-300 ${
                currentUser?.plan === plan.id
                ? 'bg-white/5 text-gray-500 border border-white/10 cursor-default'
                : plan.id === 'gold'
                ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                : plan.id === 'silver'
                ? 'bg-primary text-white hover:bg-primary-glow shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'
              }`}
            >
              {currentUser?.plan === plan.id ? 'CURRENT_TIER' : 'UPGRADE_PLAN'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
