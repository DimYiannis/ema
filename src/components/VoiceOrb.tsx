import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbProps {
  audioLevel: number;
  isRecording: boolean;
  isPlaying: boolean;
  tonePitch?: number;
}

// Simplex noise function for shader
const noiseShader = `
  // Simplex 3D Noise 
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }
`;

const vertexShader = `
  ${noiseShader}
  
  uniform float uTime;
  uniform float uAudioLevel;
  uniform float uIntensity;
  uniform float uTonePitch;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  void main() {
    vNormal = normal;
    vPosition = position;
    
    // Adjust noise frequencies based on tone pitch
    float freqMult = 0.8 + uTonePitch * 0.8; // Higher pitch = faster oscillations
    
    float noise1 = snoise(position * freqMult + uTime * 0.3);
    float noise2 = snoise(position * (freqMult * 1.5) + uTime * 0.5);
    float noise3 = snoise(position * (freqMult * 2.0) - uTime * 0.2);
    
    float displacement = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * uIntensity;
    
    // Audio displacement reacts stronger to tone
    float audioDisplacement = uAudioLevel * (0.3 + uTonePitch * 0.2) * (noise1 + 1.0) * 0.5;
    displacement += audioDisplacement;
    
    vDisplacement = displacement;
    
    vec3 newPosition = position + normal * displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// ⭐ UPDATED DARK GREEN GRADIENT FRAGMENT SHADER
const fragmentShader = `
  uniform vec3 uColor;
  uniform float uAudioLevel;
  uniform float uGlow;
  uniform float uTonePitch;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(vNormal, viewDirection), 2.5);

    // Shift colors based on tone pitch
    vec3 darkGreen = mix(vec3(0.0, 0.18, 0.08), vec3(0.0, 0.25, 0.15), uTonePitch);
    vec3 midGreen  = mix(vec3(0.0, 0.45, 0.25), vec3(0.0, 0.6, 0.35), uTonePitch);
    vec3 brightGreen = mix(vec3(0.0, 1.0, 0.6), vec3(0.3, 1.0, 0.8), uTonePitch);

    float t = smoothstep(-0.3, 0.5, vDisplacement);
    vec3 gradientColor = mix(darkGreen, midGreen, t);

    vec3 rim = brightGreen * fresnel * (1.5 + uAudioLevel * 2.0 + uTonePitch * 0.5);

    gl_FragColor = vec4(gradientColor + rim * uGlow, 1.0);
  }
`;

function FluidBlob({ audioLevel, isRecording, isPlaying, tonePitch = 0.5 }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudioLevel: { value: 0 },
      uIntensity: { value: 0.4 },
      uTonePitch: { value: 0.5 },
      uColor: { value: new THREE.Color('#004d26') },
      uGlow: { value: 0.8 }
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    const targetAudio = audioLevel / 100;
    materialRef.current.uniforms.uAudioLevel.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uAudioLevel.value,
      targetAudio,
      0.1
    );

    // Smoothly interpolate tone pitch
    materialRef.current.uniforms.uTonePitch.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uTonePitch.value,
      tonePitch,
      0.15
    );

    // Keep your color states but override hues toward green dominance
    if (isRecording) {
      materialRef.current.uniforms.uColor.value.lerp(new THREE.Color('#004d26'), 0.1);
      materialRef.current.uniforms.uGlow.value = 1.2;
    } else if (isPlaying) {
      materialRef.current.uniforms.uColor.value.lerp(new THREE.Color('#006644'), 0.1);
      materialRef.current.uniforms.uGlow.value = 1.0;
    } else {
      materialRef.current.uniforms.uColor.value.lerp(new THREE.Color('#004d26'), 0.1);
      materialRef.current.uniforms.uGlow.value = 0.8;
    }

    meshRef.current.rotation.y += 0.002;
    meshRef.current.rotation.x += 0.001;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function RadialGradientBackground() {
  return (
    <mesh position={[0, 0, -8]}>
      <planeGeometry args={[30, 30]} />
      <shaderMaterial
        transparent={true}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);
            
            vec3 centerColor = vec3(0.12, 0.20, 0.15);
            vec3 edgeColor   = vec3(0.0, 0.0, 0.0);
            
            float gradient = smoothstep(0.0, 1.0, dist);
            vec3 color = mix(centerColor, edgeColor, gradient);
            
            gl_FragColor = vec4(color, 1.0 - gradient * 0.8);
          }
        `}
      />
    </mesh>
  );
}

function PulsingLights({ audioLevel, isRecording, isPlaying }: { audioLevel: number; isRecording: boolean; isPlaying: boolean }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const mainLightRef = useRef<THREE.PointLight>(null);
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!ambientRef.current || !mainLightRef.current || !light1Ref.current || !light2Ref.current) return;

    const normalizedAudio = audioLevel / 100;
    
    // Base intensities
    const baseAmbient = 0.2;
    const baseMain = 2.3;
    const baseSide = 1.6;
    
    if (isRecording) {
      // Pulse stronger during recording
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        baseAmbient + normalizedAudio * 0.4,
        0.1
      );
      mainLightRef.current.intensity = THREE.MathUtils.lerp(
        mainLightRef.current.intensity,
        baseMain + normalizedAudio * 1.5,
        0.15
      );
      light1Ref.current.intensity = THREE.MathUtils.lerp(
        light1Ref.current.intensity,
        baseSide + normalizedAudio * 0.8,
        0.12
      );
      light2Ref.current.intensity = THREE.MathUtils.lerp(
        light2Ref.current.intensity,
        baseSide + normalizedAudio * 0.8,
        0.12
      );
    } else if (isPlaying) {
      // Subtle pulse during playback
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        baseAmbient + normalizedAudio * 0.2,
        0.08
      );
      mainLightRef.current.intensity = THREE.MathUtils.lerp(
        mainLightRef.current.intensity,
        baseMain + normalizedAudio * 0.8,
        0.1
      );
    } else {
      // Return to base values when idle
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        baseAmbient,
        0.05
      );
      mainLightRef.current.intensity = THREE.MathUtils.lerp(
        mainLightRef.current.intensity,
        baseMain,
        0.05
      );
      light1Ref.current.intensity = THREE.MathUtils.lerp(
        light1Ref.current.intensity,
        baseSide,
        0.05
      );
      light2Ref.current.intensity = THREE.MathUtils.lerp(
        light2Ref.current.intensity,
        baseSide,
        0.05
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.2} />
      <pointLight ref={mainLightRef} position={[0, 0, 3]} intensity={2.3} color="#55ffcc" />
      <pointLight ref={light1Ref} position={[-3, 3, 2]} intensity={1.6} />
      <pointLight ref={light2Ref} position={[3, -3, 2]} intensity={1.6} />
    </>
  );
}

export const VoiceOrb = ({ audioLevel, isRecording, isPlaying, tonePitch = 0.5 }: OrbProps) => {
  return (
    <div className="w-full h-[400px] sm:h-[500px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>


        <PulsingLights audioLevel={audioLevel} isRecording={isRecording} isPlaying={isPlaying} />

        <FluidBlob 
          audioLevel={audioLevel} 
          isRecording={isRecording}
          isPlaying={isPlaying}
          tonePitch={tonePitch}
        />
      </Canvas>
    </div>
  );
};
