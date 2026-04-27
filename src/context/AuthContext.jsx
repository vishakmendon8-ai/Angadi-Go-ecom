import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const generateAvatar = (name) => {
    const seed = name?.replace(/\s+/g, '_') || 'pilot';
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=0ea5e9,3b82f6,6366f1`;
  };

  async function signup(email, password, name) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    const avatar = generateAvatar(name);
    
    await updateProfile(user, { displayName: name, photoURL: avatar });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      photoURL: avatar,
      plan: 'brown',
      chatCount: 0,
      lastResetDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function setupRecaptcha(containerId) {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    });
    return window.recaptchaVerifier;
  }

  async function signInWithPhone(phoneNumber, verifier) {
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  }

  async function confirmPhoneLogin(confirmationResult, code) {
    const res = await confirmationResult.confirm(code);
    const user = res.user;
    
    // Ensure user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const defaultName = 'Neural Link Pilot';
      const avatar = generateAvatar(defaultName);
      
      await updateProfile(user, { displayName: defaultName, photoURL: avatar });

      await setDoc(userRef, {
        uid: user.uid,
        name: defaultName,
        phone: user.phoneNumber,
        photoURL: avatar,
        plan: 'brown',
        chatCount: 0,
        lastResetDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    }
    return user;
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const res = await signInWithPopup(auth, provider);
    const user = res.user;
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const avatar = user.photoURL || generateAvatar(user.displayName);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: avatar,
        plan: 'brown',
        chatCount: 0,
        lastResetDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
      }, { merge: true });
    }
    return user;
  }

  useEffect(() => {
    setLoading(false);
  }, []);

  async function updateUserProfile(updates) {
    if (!auth.currentUser) {
      console.error("AUTHENTICATION_SESSION_MISSING");
      return;
    }
    
    const finalName = updates.name || auth.currentUser.displayName || currentUser?.name;
    const finalPhoto = updates.photoURL || auth.currentUser.photoURL || currentUser?.photoURL;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        name: finalName,
        photoURL: finalPhoto,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await updateProfile(auth.currentUser, {
        displayName: finalName,
        photoURL: finalPhoto
      });

      setCurrentUser(prev => ({
        ...prev,
        name: finalName,
        photoURL: finalPhoto
      }));
    } catch (err) {
      console.error("PROFILE_SYNC_FAILURE:", err);
      throw err;
    }
  }

  async function updateChatCount(newCount) {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { chatCount: newCount }, { merge: true });
      setCurrentUser(prev => ({ ...prev, chatCount: newCount }));
    } catch (err) {
      console.error("FAILED_TO_UPDATE_CHAT_COUNT:", err);
    }
  }

  async function upgradePlan(newPlan) {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { plan: newPlan }, { merge: true });
      setCurrentUser(prev => ({ ...prev, plan: newPlan }));
    } catch (err) {
      console.error("PLAN_UPGRADE_FAILURE:", err);
      throw err;
    }
  }

  const value = {
    currentUser: { uid: 'test', name: 'Test User', email: 'test@test.com', plan: 'brown', photoURL: '' },
    signup,
    login,
    logout,
    signInWithGoogle,
    setupRecaptcha,
    signInWithPhone,
    confirmPhoneLogin,
    updateUserProfile,
    updateChatCount,
    upgradePlan
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
