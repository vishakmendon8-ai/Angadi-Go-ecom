import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RotatingEarth = () => {
  const earthRef = useRef();
  
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group scale={1.5}>
      {/* Central stylized Earth Core */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshPhongMaterial 
          color="#0ea5e9"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Outer atmosphere glow */}
      <Sphere args={[1.05, 64, 64]}>
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.2}
          speed={2}
          roughness={0}
          metalness={1}
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Lat/Long Grid lines */}
      <Sphere args={[1.02, 32, 32]}>
        <meshBasicMaterial 
          color="#ffffff" 
          wireframe 
          transparent 
          opacity={0.05} 
        />
      </Sphere>
    </group>
  );
};

const InteractiveHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-[#020617]">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          
          <Suspense fallback={null}>
            <Stars 
              radius={100} 
              depth={50} 
              count={7000} 
              factor={4} 
              saturation={0} 
              fade 
              speed={1} 
            />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
              <RotatingEarth />
            </Float>
            
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
          </Suspense>
        </Canvas>
        
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-full h-full bg-primary/10 rounded-full blur-[150px]" />
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Main Logo */}
          <div className="flex justify-center mb-10">
             <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
             >
               <img 
                src="/brand-main.png" 
                alt="Angadi-GO" 
                className="w-full max-w-[500px] h-auto object-contain mix-blend-screen"
               />
             </motion.div>
          </div>
          
          <h2 className="text-white/60 font-medium tracking-[0.6em] mb-12 text-xs uppercase">
             The Future of Robotics is Here
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="btn-primary px-12 py-5 text-xl font-black italic tracking-tighter"
            >
              SHOP NOW
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/categories')}
              className="btn-outline px-12 py-5 text-xl border-white/20 text-white font-black italic tracking-tighter"
            >
              CATEGORIES
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10"
      >
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
};

export default InteractiveHero;
