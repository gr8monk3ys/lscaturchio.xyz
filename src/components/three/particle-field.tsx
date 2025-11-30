"use client";

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleCloud({ count = 5000 }) {
  const ref = useRef<THREE.Points>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  // Generate random positions for particles
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread particles in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 3;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Color gradient from purple to cyan
      const t = Math.random();
      colors[i * 3] = 0.4 + t * 0.3; // R
      colors[i * 3 + 1] = 0.2 + t * 0.4; // G
      colors[i * 3 + 2] = 0.8 + t * 0.2; // B
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;

    // Slow rotation
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.025) * 0.1;

    // Subtle movement based on mouse
    ref.current.position.x = mousePosition.current.x * 0.1;
    ref.current.position.y = mousePosition.current.y * 0.1;
  });

  return (
    <Points ref={ref} positions={particles.positions} colors={particles.colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[0.8, 1]} />
      <meshBasicMaterial
        color="#8b5cf6"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function GlowingRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.x = Math.PI / 2;
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <torusGeometry args={[1.5, 0.02, 16, 100]} />
      <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
    </mesh>
  );
}

export function ParticleField() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <ParticleCloud count={3000} />
          <FloatingGeometry />
          <GlowingRing />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Simplified version for lower-end devices
export function ParticleFieldLite() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={1}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ParticleCloud count={1000} />
        </Suspense>
      </Canvas>
    </div>
  );
}
