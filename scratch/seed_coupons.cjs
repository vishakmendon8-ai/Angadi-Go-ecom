const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDn-pCCHlAG_mdn3nh9qc29Y1PVRIiu2rY",
  authDomain: "eccomerce-8c5a1.firebaseapp.com",
  projectId: "eccomerce-8c5a1",
  storageBucket: "eccomerce-8c5a1.firebasestorage.app",
  messagingSenderId: "1016878906579",
  appId: "1:1016878906579:web:e54815fd38dd3cc734e826"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const coupons = [
  { code: "ANGADI5", discount: 0.05, isActive: true },
  { code: "NEURAL5", discount: 0.05, isActive: true },
  { code: "PILOT5", discount: 0.05, isActive: true },
  { code: "CYBER5", discount: 0.05, isActive: true },
  { code: "TECH5", discount: 0.05, isActive: true }
];

async function seed() {
  console.log("🚀 POPULATING NEURAL COUPON REGISTRY...");
  
  try {
    for (const coupon of coupons) {
      await setDoc(doc(db, "coupons", coupon.code), coupon);
      console.log(`✅ SYNCED: ${coupon.code} -> [${coupon.discount * 100}% DISCOUNT]`);
    }
    console.log("\n✨ COUPON SYNCHRONIZATION COMPLETE.");
    process.exit(0);
  } catch (error) {
    console.error("❌ SYNC_FAILURE:", error);
    process.exit(1);
  }
}

seed();
