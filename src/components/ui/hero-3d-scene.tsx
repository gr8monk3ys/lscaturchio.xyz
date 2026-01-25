'use client';

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Mouse position tracker for the entire scene
function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mouse;
}

// Shared mouse context inside Canvas
const MouseContext = {
  x: 0,
  y: 0,
};

function MouseTracker() {
  const { viewport } = useThree();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      MouseContext.x = (event.clientX / window.innerWidth) * 2 - 1;
      MouseContext.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return null;
}

// Individual floating shape with mouse reactivity
interface FloatingShapeProps {
  position: [number, number, number];
  geometry: 'box' | 'sphere' | 'torus' | 'octahedron' | 'icosahedron';
  color: string;
  scale?: number;
  rotationSpeed?: number;
  floatIntensity?: number;
  mouseInfluence?: number;
}

function FloatingShape({
  position,
  geometry,
  color,
  scale = 1,
  rotationSpeed = 0.5,
  floatIntensity = 1,
  mouseInfluence = 0.3,
}: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPosition = useRef(position);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Base rotation animation
    meshRef.current.rotation.x = time * rotationSpeed * 0.3;
    meshRef.current.rotation.y = time * rotationSpeed * 0.5;

    // Mouse influence on position
    const targetX = initialPosition.current[0] + MouseContext.x * mouseInfluence;
    const targetY = initialPosition.current[1] + MouseContext.y * mouseInfluence;

    // Smooth interpolation toward mouse position
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.02
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      0.02
    );
  });

  const geometryComponent = useMemo(() => {
    switch (geometry) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.6, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.7]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[0.6, 0]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [geometry]);

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={floatIntensity}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometryComponent}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.7}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

// Glass-like shape with transmission material for premium look
function GlassShape({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPosition = useRef(position);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    meshRef.current.rotation.x = time * 0.2;
    meshRef.current.rotation.y = time * 0.3;

    // Mouse influence
    const targetX = initialPosition.current[0] + MouseContext.x * 0.5;
    const targetY = initialPosition.current[1] + MouseContext.y * 0.5;

    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.015
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      0.015
    );
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.2}
          anisotropicBlur={0.1}
          distortion={0.2}
          distortionScale={0.2}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
        />
      </mesh>
    </Float>
  );
}

// Wireframe ring for visual interest
function WireframeRing({
  position,
  scale = 1,
  color,
}: {
  position: [number, number, number];
  scale?: number;
  color: string;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const initialPosition = useRef(position);

  useFrame((state) => {
    if (!ringRef.current) return;

    const time = state.clock.elapsedTime;
    ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2;
    ringRef.current.rotation.z = time * 0.1;

    // Subtle mouse influence
    const targetX = initialPosition.current[0] + MouseContext.x * 0.2;
    const targetY = initialPosition.current[1] + MouseContext.y * 0.2;

    ringRef.current.position.x = THREE.MathUtils.lerp(
      ringRef.current.position.x,
      targetX,
      0.01
    );
    ringRef.current.position.y = THREE.MathUtils.lerp(
      ringRef.current.position.y,
      targetY,
      0.01
    );
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ringRef} position={position} scale={scale}>
        <torusGeometry args={[1, 0.02, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

// Main scene with all shapes
function Scene() {
  // Brand colors - lime/green primary with complementary accents
  const primaryColor = '#65a30d'; // lime-600
  const secondaryColor = '#4ade80'; // green-400
  const accentColor = '#22d3ee'; // cyan-400
  const mutedColor = '#94a3b8'; // slate-400

  return (
    <>
      <MouseTracker />

      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color={primaryColor} />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Central glass icosahedron */}
      <GlassShape position={[0, 0, 0]} scale={0.8} />

      {/* Floating geometric shapes around the center */}
      <FloatingShape
        position={[-2.5, 1.5, -1]}
        geometry="octahedron"
        color={primaryColor}
        scale={0.5}
        rotationSpeed={0.4}
        floatIntensity={1.2}
        mouseInfluence={0.4}
      />

      <FloatingShape
        position={[2.5, -1, -0.5]}
        geometry="box"
        color={secondaryColor}
        scale={0.4}
        rotationSpeed={0.6}
        floatIntensity={0.8}
        mouseInfluence={0.35}
      />

      <FloatingShape
        position={[-1.5, -1.8, 0.5]}
        geometry="torus"
        color={accentColor}
        scale={0.5}
        rotationSpeed={0.5}
        floatIntensity={1}
        mouseInfluence={0.3}
      />

      <FloatingShape
        position={[1.8, 1.8, -1.5]}
        geometry="sphere"
        color={mutedColor}
        scale={0.35}
        rotationSpeed={0.3}
        floatIntensity={1.5}
        mouseInfluence={0.45}
      />

      <FloatingShape
        position={[3, 0.5, 0]}
        geometry="icosahedron"
        color={primaryColor}
        scale={0.3}
        rotationSpeed={0.7}
        floatIntensity={0.9}
        mouseInfluence={0.25}
      />

      <FloatingShape
        position={[-3, -0.5, 0.5]}
        geometry="sphere"
        color={secondaryColor}
        scale={0.25}
        rotationSpeed={0.4}
        floatIntensity={1.1}
        mouseInfluence={0.5}
      />

      {/* Decorative wireframe rings */}
      <WireframeRing position={[0, 0, -0.5]} scale={1.5} color={primaryColor} />
      <WireframeRing position={[0, 0, 0.5]} scale={2} color={mutedColor} />
    </>
  );
}

// Simplified scene for mobile/low-end devices
function SimplifiedScene() {
  const primaryColor = '#65a30d';
  const secondaryColor = '#4ade80';

  return (
    <>
      <MouseTracker />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      <FloatingShape
        position={[0, 0, 0]}
        geometry="icosahedron"
        color={primaryColor}
        scale={0.8}
        rotationSpeed={0.3}
        floatIntensity={0.5}
        mouseInfluence={0.2}
      />

      <FloatingShape
        position={[-2, 1, -1]}
        geometry="octahedron"
        color={secondaryColor}
        scale={0.4}
        rotationSpeed={0.4}
        floatIntensity={0.6}
        mouseInfluence={0.15}
      />

      <FloatingShape
        position={[2, -1, -0.5]}
        geometry="box"
        color={primaryColor}
        scale={0.35}
        rotationSpeed={0.5}
        floatIntensity={0.7}
        mouseInfluence={0.15}
      />
    </>
  );
}

export interface Hero3DSceneProps {
  className?: string;
  simplified?: boolean;
}

export function Hero3DScene({ className = '', simplified = false }: Hero3DSceneProps) {
  const [mounted, setMounted] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    // Check for low-end device
    const isLowEndDevice =
      navigator.hardwareConcurrency < 4 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsLowEnd(isLowEndDevice);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Do not render on server or if user prefers reduced motion
  if (!mounted || prefersReducedMotion) {
    return null;
  }

  const useSimplified = simplified || isLowEnd;

  return (
    <div
      className={`absolute inset-0 -z-10 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={useSimplified ? 1 : [1, 2]}
        style={{ background: 'transparent' }}
        gl={{
          antialias: !useSimplified,
          alpha: true,
          powerPreference: useSimplified ? 'low-power' : 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {useSimplified ? <SimplifiedScene /> : <Scene />}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Hero3DScene;
