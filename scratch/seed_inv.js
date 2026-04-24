import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const components = [
  {
    id: "uno_001",
    name: "Arduino Uno R3",
    price: 1250,
    image: "/inventory/arduino_uno.png",
    description: "Industry-standard microcontroller for prototyping and neural interfacing."
  },
  {
    id: "nano_001",
    name: "Arduino Nano",
    price: 450,
    image: "/inventory/arduino_nano.png",
    description: "Compact neural logic unit for space-constrained robotic deployments."
  },
  {
    id: "ldr_001",
    name: "LDR Sensor Module",
    price: 45,
    image: "/inventory/ldr_sensor.png",
    description: "High-sensitivity optical resistor for environmental light detection."
  },
  {
    id: "led_001",
    name: "RGB LED Pack (10x)",
    price: 80,
    image: "/inventory/led_pack.png",
    description: "Visual feedback array for system status and environmental lighting."
  },
  {
    id: "motor_001",
    name: "DC Gear Motor",
    price: 120,
    image: "/inventory/dc_motor.png",
    description: "High-torque kinetic driver for autonomous mobile platforms."
  },
  {
    id: "servo_001",
    name: "SG90 Micro Servo",
    price: 250,
    image: "/inventory/servo_motor.png",
    description: "Precision-angle actuator for robotic arm and gimbal stabilization."
  },
  {
    id: "switch_001",
    name: "Tactile Push Button",
    price: 15,
    image: "/logo.png", // Fallback for the switch
    description: "Manual override and system input module for human-to-machine interfacing."
  }
];

async function seed() {
  console.log("🚀 INITIALIZING NEURAL INVENTORY SEEDING...");
  
  try {
    for (const item of components) {
      await setDoc(doc(db, "components", item.id), item);
      console.log(`✅ SYNCED: ${item.name}`);
    }
    console.log("\n✨ INVENTORY SYNCHRONIZATION COMPLETE.");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING_FAILURE:", error);
    process.exit(1);
  }
}

seed();
