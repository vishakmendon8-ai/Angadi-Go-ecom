import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Globe, Zap, Phone, ShieldCheck, ArrowLeft } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', name: 'India' },
  { code: '+1', name: 'USA/Canada' },
  { code: '+44', name: 'UK' },
  { code: '+61', name: 'Australia' },
  { code: '+971', name: 'UAE' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+81', name: 'Japan' },
  { code: '+86', name: 'China' },
];

const Auth = () => {
  const [authMode, setAuthMode] = useState('email'); // 'email' | 'phone'
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [step, setStep] = useState(1); // 1: send otp, 2: verify otp

  const { 
    login, signup, signInWithGoogle, 
    setupRecaptcha, signInWithPhone, confirmPhoneLogin 
  } = useAuth();
  
  const navigate = useNavigate();

  useEffect(() => {
    // Clear error when switching modes
    setError('');
  }, [authMode, isLogin]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      const verifier = setupRecaptcha('recaptcha-container');
      const result = await signInWithPhone(fullPhone, verifier);
      setVerificationResult(result);
      setStep(2);
    } catch (err) {
      setError(err.message);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmPhoneLogin(verificationResult, otp);
      navigate('/dashboard');
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-10 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            {authMode === 'phone' ? 'Neural Link' : (isLogin ? 'Access Portal' : 'Join the Elite')}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {authMode === 'phone' 
              ? (step === 1 ? 'Enter your mobile identity.' : 'Enter the secure sequence.') 
              : (isLogin ? 'Enter your credentials to proceed.' : 'Create an account to access advanced tech.')}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* RECAPTCHA CONTAINER */}
        <div id="recaptcha-container" className="hidden"></div>

        <AnimatePresence mode="wait">
          {authMode === 'email' ? (
            <motion.form 
              key="email-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleEmailSubmit} 
              className="space-y-4"
            >
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                {loading ? 'SYNCING...' : (isLogin ? 'SIGN IN' : 'REGISTER')}
              </button>

              <button 
                type="button" 
                onClick={() => setAuthMode('phone')}
                className="w-full text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest mt-2"
              >
                Use Phone Identity instead
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="phone-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative w-28">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code} className="bg-dark text-white">
                            {c.code} ({c.name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2 uppercase"
                  >
                    {loading ? 'SENDING...' : 'SEND OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                    <input
                      type="text"
                      placeholder="6-Digit OTP"
                      required
                      maxLength={6}
                      className="w-full bg-white/5 border border-primary/50 rounded-xl py-4 pl-12 pr-4 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-primary transition-colors"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2 uppercase"
                  >
                    {loading ? 'VERIFYING...' : 'VERIFY OTP'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    <ArrowLeft size={14} /> Back to Number
                  </button>
                </form>
              )}

              <button 
                type="button" 
                onClick={() => setAuthMode('email')}
                className="w-full text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest mt-2"
              >
                Use Email Account instead
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative my-8 text-center text-xs text-gray-500 uppercase tracking-[0.2em]">
          <span className="bg-dark px-4 relative z-10">Neural Interface</span>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-0" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
        >
          <Globe size={20} />
          GOOGLE
        </button>

        <p className="text-center text-gray-400 text-sm mt-8">
          {isLogin ? "Don't have access?" : "Already an initiate?"} {' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
