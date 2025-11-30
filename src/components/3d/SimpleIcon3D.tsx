import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Box, Sphere, Cone, Torus } from "@react-three/drei";
import * as THREE from "three";

interface Icon3DMeshProps {
  type: "phone" | "message" | "navigation" | "shield";
}

function Icon3DMesh({ type }: Icon3DMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    groupRef.current.rotation.x = Math.cos(t * 0.3) * 0.2;
    groupRef.current.position.y = Math.sin(t) * 0.1;
  });

  const color = "#8c7864";
  const screenColor = "#2a2a2a";

  if (type === "phone") {
    return (
      <group ref={groupRef}>
        {/* Phone body */}
        <Box args={[0.7, 1.3, 0.15]}>
          <meshStandardMaterial
            color={color}
            metalness={0.8}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </Box>
        {/* Phone screen */}
        <Box args={[0.6, 1.1, 0.16]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color={screenColor}
            metalness={0.9}
            roughness={0.1}
            emissive="#4a4a4a"
            emissiveIntensity={0.3}
          />
        </Box>
        {/* Home button */}
        <Sphere args={[0.08, 16, 16]} position={[0, -0.5, 0.08]}>
          <meshStandardMaterial
            color={color}
            metalness={0.8}
            roughness={0.3}
          />
        </Sphere>
      </group>
    );
  }

  return (
    <mesh ref={meshRef}>
      {type === "message" && <Sphere args={[0.7, 32, 32]} />}
      {type === "navigation" && <Cone args={[0.7, 1.2, 4]} rotation={[0, 0, 0]} />}
      {type === "shield" && <Torus args={[0.6, 0.25, 16, 32]} rotation={[Math.PI / 2, 0, 0]} />}
      <meshStandardMaterial
        color={color}
        metalness={0.6}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

interface SimpleIcon3DProps {
  type: "phone" | "message" | "navigation" | "shield";
}

export default function SimpleIcon3D({ type }: SimpleIcon3DProps) {
  return (
    <div className="w-10 h-10 flex-shrink-0">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} />
        <Icon3DMesh type={type} />
      </Canvas>
    </div>
  );
}
