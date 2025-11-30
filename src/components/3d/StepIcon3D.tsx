import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame, useLoader } from "@react-three/fiber";
import { Box, Sphere, Cone, Torus, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import chatBubbleImage from "@/assets/chat-bubble-3d.png";

interface Icon3DMeshProps {
  type: "phone" | "message" | "map" | "notification";
  isHovered: boolean;
}

function Icon3DMesh({ type, isHovered }: Icon3DMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Base floating animation
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.15;
    
    // Rotation on hover
    if (isHovered) {
      groupRef.current.rotation.y += 0.02;
    } else {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    }
  });

  const primaryColor = "#8c7864";
  const accentColor = "#8c9c65";
  const screenColor = "#1a1a1a";

  // Phone Model
  if (type === "phone") {
    return (
      <group ref={groupRef} scale={isHovered ? 1.1 : 1}>
        {/* Phone body */}
        <Box args={[0.8, 1.4, 0.12]} castShadow>
          <meshStandardMaterial
            color={primaryColor}
            metalness={0.9}
            roughness={0.1}
            emissive={primaryColor}
            emissiveIntensity={0.3}
          />
        </Box>
        {/* Screen */}
        <Box args={[0.7, 1.2, 0.13]} position={[0, 0.05, 0]} castShadow>
          <meshStandardMaterial
            color={screenColor}
            metalness={0.95}
            roughness={0.05}
            emissive={accentColor}
            emissiveIntensity={isHovered ? 0.5 : 0.2}
          />
        </Box>
        {/* Camera notch */}
        <Cylinder args={[0.05, 0.05, 0.14]} position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={screenColor} metalness={0.8} roughness={0.2} />
        </Cylinder>
        {/* Speaker grill */}
        <Box args={[0.3, 0.03, 0.14]} position={[0, 0.55, 0]}>
          <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
        </Box>
      </group>
    );
  }

  // Message/Chat Icon Model - Using AI-generated texture on a plane
  if (type === "message") {
    const texture = useLoader(THREE.TextureLoader, chatBubbleImage);
    
    return (
      <group ref={groupRef} scale={isHovered ? 1.2 : 1}>
        {/* Image plane with the chat bubble texture */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial
            map={texture}
            transparent={true}
            side={THREE.DoubleSide}
            metalness={0.3}
            roughness={0.5}
            emissive="#8c9c65"
            emissiveIntensity={isHovered ? 0.3 : 0.1}
          />
        </mesh>
        
        {/* Subtle glow effect on hover */}
        {isHovered && (
          <mesh position={[0, 0, -0.1]} scale={1.1}>
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial
              color="#8c9c65"
              transparent={true}
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    );
  }

  // Map/Location Pin Model
  if (type === "map") {
    return (
      <group ref={groupRef} scale={isHovered ? 1.1 : 1}>
        {/* Pin top (rounded) */}
        <Sphere args={[0.4, 32, 32]} position={[0, 0.5, 0]} scale={[1, 1.2, 1]} castShadow>
          <meshStandardMaterial
            color={primaryColor}
            metalness={0.7}
            roughness={0.2}
            emissive={accentColor}
            emissiveIntensity={isHovered ? 0.6 : 0.3}
          />
        </Sphere>
        {/* Pin point */}
        <Cone args={[0.35, 0.8, 32]} position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <meshStandardMaterial
            color={primaryColor}
            metalness={0.8}
            roughness={0.15}
          />
        </Cone>
        {/* Center dot */}
        <Sphere args={[0.15, 16, 16]} position={[0, 0.5, 0.41]}>
          <meshStandardMaterial
            color="#fff"
            emissive="#fff"
            emissiveIntensity={0.8}
          />
        </Sphere>
        {/* Pulsing ring at base */}
        <Torus args={[0.6, 0.05, 16, 32]} position={[0, -0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={accentColor}
            transparent
            opacity={isHovered ? 0.6 : 0.3}
            emissive={accentColor}
            emissiveIntensity={0.5}
          />
        </Torus>
      </group>
    );
  }

  // Notification Bell Model
  if (type === "notification") {
    return (
      <group ref={groupRef} scale={isHovered ? 1.1 : 1} rotation={[0, 0, isHovered ? 0.2 : 0]}>
        {/* Bell body */}
        <Cone args={[0.5, 0.7, 32]} position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <meshStandardMaterial
            color={primaryColor}
            metalness={0.7}
            roughness={0.2}
            emissive={accentColor}
            emissiveIntensity={isHovered ? 0.6 : 0.3}
          />
        </Cone>
        {/* Bell top knob */}
        <Sphere args={[0.12, 16, 16]} position={[0, 0.6, 0]}>
          <meshStandardMaterial
            color={primaryColor}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        {/* Bell clapper */}
        <Sphere args={[0.08, 16, 16]} position={[0, -0.15, 0]}>
          <meshStandardMaterial
            color="#ddd"
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        {/* Notification badge */}
        <Sphere args={[0.15, 16, 16]} position={[0.4, 0.4, 0]}>
          <meshStandardMaterial
            color="#ff4444"
            emissive="#ff4444"
            emissiveIntensity={isHovered ? 1 : 0.6}
          />
        </Sphere>
        {/* Alert rings */}
        {[0.7, 0.85].map((radius, i) => (
          <Torus
            key={i}
            args={[radius, 0.03, 16, 32]}
            position={[0, 0.3, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={accentColor}
              transparent
              opacity={isHovered ? 0.5 - i * 0.15 : 0.2 - i * 0.1}
              emissive={accentColor}
              emissiveIntensity={0.5}
            />
          </Torus>
        ))}
      </group>
    );
  }

  return null;
}

interface StepIcon3DProps {
  type: "phone" | "message" | "map" | "notification";
  isHovered: boolean;
}

export default function StepIcon3D({ type, isHovered }: StepIcon3DProps) {
  return (
    <div className="w-24 h-24 flex-shrink-0">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#8c9c65" />
        <spotLight
          position={[0, 5, 0]}
          angle={0.6}
          penumbra={1}
          intensity={0.5}
          castShadow
        />
        <Icon3DMesh type={type} isHovered={isHovered} />
      </Canvas>
    </div>
  );
}
