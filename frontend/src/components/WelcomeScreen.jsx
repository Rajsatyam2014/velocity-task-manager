import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

const RotatingCube = () => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#00f0ff" wireframe />
    </mesh>
  );
};

const WelcomeScreen = ({ onComplete }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="absolute inset-0 pointer-events-none">
        <Canvas>
          <React.Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#9d00ff" intensity={2} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <RotatingCube />
            <Text
              position={[0, -2, 0]}
              fontSize={0.5}
              color="#e0e0ff"
              anchorX="center"
              anchorY="middle"
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
            >
              Welcome to Smart Task Manager
            </Text>
          </React.Suspense>
        </Canvas>
      </div>
      <div className="z-10 text-center pointer-events-none">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold neon-text mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          VELOCITY
        </motion.h1>
        <motion.p
          className="text-xl text-primary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Initializing System...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;
