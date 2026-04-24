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

const components = [
  {
    id: "uno_001",
    name: "Arduino Uno R3",
    price: 1250,
    category: "Control Modules",
    image: "/inventory/arduino_uno.png",
    description: "Industry-standard microcontroller for prototyping and neural interfacing."
  },
  {
    id: "nano_001",
    name: "Arduino Nano",
    price: 450,
    category: "Control Modules",
    image: "/inventory/arduino_nano.png",
    description: "Compact neural logic unit for space-constrained robotic deployments."
  },
  {
    id: "ldr_001",
    name: "LDR Sensor Module",
    price: 45,
    category: "Sensors & Modules",
    image: "/inventory/ldr_sensor.png",
    description: "High-sensitivity optical resistor for environmental light detection."
  },
  {
    id: "led_001",
    name: "RGB LED Pack (10x)",
    price: 80,
    category: "Optical Units",
    image: "/inventory/led_pack.png",
    description: "Visual feedback array for system status and environmental lighting."
  },
  {
    id: "motor_001",
    name: "DC Gear Motor",
    price: 120,
    category: "Robotics Components",
    image: "/inventory/dc_motor.png",
    description: "High-torque kinetic driver for autonomous mobile platforms."
  },
  {
    id: "servo_001",
    name: "SG90 Micro Servo",
    price: 250,
    category: "Robotics Components",
    image: "/inventory/servo_motor.png",
    description: "Precision-angle actuator for robotic arm and gimbal stabilization."
  },
  {
    id: "switch_001",
    name: "Tactile Push Button",
    price: 15,
    category: "Sensors & Modules",
    image: "/logo.png",
    description: "Manual override and system input module for human-to-machine interfacing."
  },
  {
    id: "esc_001",
    name: "30A Brushless ESC",
    price: 850,
    category: "Drone Components",
    image: "/logo.png",
    description: "High-speed electronic speed controller for brushless drone motors."
  },
  {
    id: "prop_001",
    name: "Carbon Fiber Props (Set)",
    price: 1100,
    category: "Drone Components",
    image: "/logo.png",
    description: "Ultra-lightweight aerodynamic blades for high-performance drone lift."
  }
];

async function seed() {
  console.log("🚀 UPGRADING TO TIERED NEURAL INVENTORY...");
  
  try {
    for (const item of components) {
      await setDoc(doc(db, "components", item.id), item);
      console.log(`✅ TIERED_SYNC: ${item.name} -> [${item.category}]`);
    }
    console.log("\n✨ TIERED SYNCHRONIZATION COMPLETE.");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING_FAILURE:", error);
    process.exit(1);
  }
}

seed();
