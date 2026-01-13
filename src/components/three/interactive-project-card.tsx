"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, RoundedBox, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface ProjectData {
  title: string;
  description: string;
  stack: string[];
  color?: string;
}

interface FloatingCardProps {
  project: ProjectData;
  mousePosition: { x: number; y: number };
}

function FloatingCard({ project, mousePosition }: FloatingCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  useThree(); // Keep viewport available if needed

  // Smooth mouse following
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!meshRef.current) return;

    // Calculate target rotation based on mouse position
    targetRotation.current.x = mousePosition.y * 0.3;
    targetRotation.current.y = mousePosition.x * 0.3;

    // Smooth interpolation
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotation.current.x,
      0.1
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation.current.y,
      0.1
    );
  });

  // Parse color from project or use default
  const mainColor = project.color || "#6366f1";

  return (
    <group ref={meshRef}>
      {/* Main card body */}
      <RoundedBox args={[3, 2, 0.15]} radius={0.1} smoothness={4}>
        <meshStandardMaterial
          color={mainColor}
          roughness={0.3}
          metalness={0.8}
          envMapIntensity={0.5}
        />
      </RoundedBox>

      {/* Floating accent sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[1.2, 0.8, 0.3]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <MeshDistortMaterial
            color={mainColor}
            speed={2}
            distort={0.3}
            radius={1}
          />
        </mesh>
      </Float>

      {/* Glowing ring */}
      <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshBasicMaterial color={mainColor} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Scene({ project }: { project: ProjectData }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
      <FloatingCard project={project} mousePosition={mousePosition} />
    </>
  );
}

interface InteractiveProjectCardProps {
  project: ProjectData;
  className?: string;
}

export function InteractiveProjectCard({
  project,
  className = "",
}: InteractiveProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!motionQuery.matches) {
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) {
    // Fallback for reduced motion or SSR
    return (
      <div
        className={`relative rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 ${className}`}
      >
        <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-1 bg-primary/10 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ background: "transparent" }}
        >
          <Scene project={project} />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div
        className={`relative z-10 p-6 h-full flex flex-col justify-end transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-80"
        }`}
      >
        <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-lg">
          {project.title}
        </h3>
        <p className="text-sm text-white/80 mb-4 drop-shadow-md line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
