'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';

function AnimatedSphere({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} scale={scale} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.2}
        />
      </Sphere>
    </Float>
  );
}

function PackageBox() {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.3} roughness={0.4} />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60A5FA" />
      
      {/* Main Package Box */}
      <PackageBox />
      
      {/* Floating Spheres */}
      <AnimatedSphere position={[-3, 2, -2]} color="#60A5FA" scale={0.8} />
      <AnimatedSphere position={[3, -2, -1]} color="#3B82F6" scale={0.6} />
      <AnimatedSphere position={[-2, -1, 2]} color="#2563EB" scale={0.5} />
      <AnimatedSphere position={[2, 1, 1]} color="#1D4ED8" scale={0.7} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function Auth3DAnimation() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-blue-900/20 dark:to-blue-800/10" suppressHydrationWarning>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden" suppressHydrationWarning>
        <motion.div
          className="absolute top-10 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        }>
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <Scene />
          </Canvas>
        </Suspense>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-md"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl mb-6"
          >
            📦
          </motion.div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              ParcelTrack
            </span>
          </h2>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Modern parcel management made simple and efficient. Track, manage, and deliver with ease.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Auto Notifications</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Smart Storage</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">4K+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Daily Parcels</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">3K+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">70%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Faster</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
