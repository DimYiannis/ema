import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function LineParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, particleCount } = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1, 4);
    const edges = new THREE.EdgesGeometry(geometry);
    const edgePositions = edges.attributes.position.array;
    
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const edgeIndex = Math.floor(Math.random() * (edgePositions.length / 3)) * 3;
      positions[i * 3] = edgePositions[edgeIndex];
      positions[i * 3 + 1] = edgePositions[edgeIndex + 1];
      positions[i * 3 + 2] = edgePositions[edgeIndex + 2];
    }
    
    return { positions, particleCount };
  }, []);
  
  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime();
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = time * 0.5 + i * 0.1;
        const radius = 1 + Math.sin(angle) * 0.05;
        
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        const length = Math.sqrt(x * x + y * y + z * z);
        positions[i3] = (x / length) * radius;
        positions[i3 + 1] = (y / length) * radius;
        positions[i3 + 2] = (z / length) * radius;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.x = time * 0.2;
      particlesRef.current.rotation.y = time * 0.3;
    }
  });
  
  return (
    <points ref={particlesRef} scale={2.5}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="hsl(var(--accent))"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function AnimatedOrb() {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={meshRef} scale={2.5}>
      {/* Main wireframe with strong glow */}
      <mesh>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="hsl(var(--accent))"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={1}
          emissive="hsl(var(--accent))"
          emissiveIntensity={1.5}
          wireframe={true}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none md:pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color="hsl(var(--accent))" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="hsl(var(--accent))" />
        <pointLight position={[0, 0, 5]} intensity={1.8} color="hsl(var(--accent))" />
        <LineParticles />
        <AnimatedOrb />
        {!isMobile && (
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        )}
      </Canvas>
    </div>
  );
}
