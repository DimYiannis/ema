import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import FloatingOrb from "./FloatingOrb";
import { Suspense } from "react";

interface CardSceneProps {
  color?: string;
  speed?: number;
}

export default function CardScene({ color = "#8c7864", speed = 1 }: CardSceneProps) {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          <FloatingOrb color={color} speed={speed} scale={1.5} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
