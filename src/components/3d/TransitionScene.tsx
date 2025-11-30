import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function WaveGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const positionAttribute = geometry.attributes.position;
      
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const wave = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.3;
        positionAttribute.setZ(i, wave);
      }
      
      positionAttribute.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20, 50, 50]} />
      <meshStandardMaterial
        color="hsl(var(--accent))"
        wireframe
        transparent
        opacity={0.3}
        emissive="hsl(var(--accent))"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export default function TransitionScene() {
  return (
    <div className="h-screen w-full relative">
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 5, 5]} intensity={1} color="hsl(var(--accent))" />
        <WaveGrid />
      </Canvas>
    </div>
  );
}
