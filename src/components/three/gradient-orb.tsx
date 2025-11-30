"use client";

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Gentle floating motion
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#8b5cf6"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

function GlowEffect() {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!glowRef.current) return;
    const scale = 1.2 + Math.sin(state.clock.elapsedTime) * 0.1;
    glowRef.current.scale.setScalar(scale);
  });

  return (
    <Sphere ref={glowRef} args={[1.3, 32, 32]} position={[0, 0, 0]}>
      <meshBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

export function GradientOrb() {
  return (
    <div className="absolute inset-0 -z-10 opacity-70">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#06b6d4" />
          <AnimatedOrb />
          <GlowEffect />
        </Suspense>
      </Canvas>
    </div>
  );
}
