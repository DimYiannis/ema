import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

interface FloatingOrbProps {
  color: string;
  speed?: number;
  scale?: number;
}

export default function FloatingOrb({ color, speed = 1, scale = 1 }: FloatingOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    meshRef.current.position.y = Math.sin(t) * 0.3;
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    meshRef.current.rotation.y = Math.cos(t * 0.3) * 0.2;
  });

  return (
    <Sphere ref={meshRef} args={[1 * scale, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}
