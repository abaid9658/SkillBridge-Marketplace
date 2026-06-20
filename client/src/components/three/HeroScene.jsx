import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Sphere, Float } from '@react-three/drei';

const FloatingMesh = () => {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(time / 4) * 0.3;
      meshRef.current.rotation.y = time / 6;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <MeshDistortMaterial
        color="#7c3aed"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
};

const LittleSphere = ({ position, color, size = 0.2 }) => {
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere position={position} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  );
};

const HeroScene = () => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '350px' }}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }}>
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-5, 5, 2]} intensity={0.8} />

        {/* Floating 3D Main Mesh */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
          <FloatingMesh />
        </Float>

        {/* Small floating decorative spheres */}
        <LittleSphere position={[-2, 1.2, -0.5]} color="#06b6d4" size={0.3} />
        <LittleSphere position={[2, -1, 0.5]} color="#ec4899" size={0.25} />
        <LittleSphere position={[-1.5, -1.2, 0.8]} color="#10b981" size={0.2} />
        <LittleSphere position={[1.8, 1.3, -1]} color="#f59e0b" size={0.35} />

        {/* Controls */}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
