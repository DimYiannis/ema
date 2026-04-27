<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header.vue";
import { Loader2 } from "lucide-vue-next";
import type { Session } from "@supabase/supabase-js";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const router = useRouter();
const session = ref<Session | null>(null);
const loading = ref(true);

let authSub: { unsubscribe: () => void } | null = null;
let stopScene: (() => void) | null = null;

function initScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 9;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // Subtle background dust particles
  const bgCount = 120;
  const bgPos = new Float32Array(bgCount * 3);
  for (let i = 0; i < bgCount; i++) {
    bgPos[i * 3]     = (Math.random() - 0.5) * 22;
    bgPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
    bgPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const bgGeo = new THREE.BufferGeometry();
  bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
  scene.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({
    color: 0xaaaaaa, size: 0.015, transparent: true, opacity: 0.25,
  })));

  // Pure wireframe wobbly blob — vertex shader displaces, fragment colors white→teal by x position
  const vertexShader = `
    uniform float uTime;
    varying vec3 vWorldPos;

    void main() {
      vec3 pos = position;
      float d = sin(pos.x * 4.5 + uTime * 0.4) * 0.22
              + sin(pos.y * 3.8 + uTime * 0.35) * 0.18
              + sin(pos.z * 5.2 + uTime * 0.5) * 0.15
              + cos(pos.x * 2.2 + pos.y * 3.1 + uTime * 0.28) * 0.12
              + cos(pos.y * 1.8 + pos.z * 2.6 + uTime * 0.45) * 0.10
              + sin(pos.x * 7.0 + pos.z * 4.0 + uTime * 0.6) * 0.07
              + cos(pos.x * 5.5 + pos.y * 6.0 + uTime * 0.32) * 0.05
              + sin(pos.z * 6.5 + pos.y * 3.5 + uTime * 0.55) * 0.04;
      pos += normal * d;
      vWorldPos = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vWorldPos;

    void main() {
      // x < 0 = white/silver, x > 0 = bright cyan/teal  (matches screenshot)
      // Light from top-right: bright cyan highlight, dark teal shadow
      vec3 lightDir = normalize(vec3(1.0, 0.8, 1.0));
      vec3 norm     = normalize(vWorldPos);
      float diff    = clamp(dot(norm, lightDir), 0.0, 1.0);
      float t       = pow(diff, 0.6); // soften falloff — spreads mid/highlight
      vec3 shadow   = vec3(0.60, 0.80, 0.90);
      vec3 midtone  = vec3(0.40, 0.80, 1.00);
      vec3 highlight= vec3(0.10, 0.95, 0.55);
      vec3 color    = t < 0.5
        ? mix(shadow, midtone, t * 2.0)
        : mix(midtone, highlight, (t - 0.5) * 2.0);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const uniforms = { uTime: { value: 0 } };

  // IcosahedronGeometry detail=7 → fine hexagonal mesh matching screenshot
  const geo = new THREE.SphereGeometry(1.5, 48, 48);
  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    wireframe: true,
  });
  const blob = new THREE.Mesh(geo, mat);
  blob.scale.setScalar(1.35);
  scene.add(blob);

  // Second sphere — larger, sparser, offset wave phase, lower opacity
  const uniforms2 = { uTime: { value: 0 } };
  const mat2 = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: uniforms2,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  const blob2 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 48, 48), mat2);
  blob2.scale.setScalar(1.35);
  scene.add(blob2);

  const onResize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  };
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let animId: number;

  const animate = () => {
    animId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms2.uTime.value = t + 1.5;
    blob.rotation.y = t * 0.04;
    blob.rotation.x = Math.sin(t * 0.1) * 0.03;
    blob2.rotation.y = -t * 0.04;
    blob2.rotation.x = -Math.sin(t * 0.1) * 0.03;
    renderer.render(scene, camera);
  };
  animate();

  stopScene = () => {
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(animId);
    renderer.dispose();
  };
}

onMounted(() => {
  supabase.auth.getSession().then(({ data: { session: s } }) => {
    session.value = s;
    loading.value = false;
    if (!s) router.push("/login");
  });
  const { data } = supabase.auth.onAuthStateChange((_e, s) => {
    session.value = s;
    if (!s) router.push("/login");
  });
  authSub = data.subscription;
});

watch([session, loading], async ([s, l]) => {
  if (s && !l) {
    await nextTick();
    if (canvasRef.value) initScene(canvasRef.value);
  }
}, { immediate: true });

onUnmounted(() => {
  authSub?.unsubscribe();
  stopScene?.();
});
</script>

<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-background">
    <Loader2 class="h-8 w-8 animate-spin text-primary" />
  </div>

  <div v-else-if="session" class="min-h-screen bg-[#0d1512] flex flex-col relative overflow-hidden">
    <Header />

    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none" />

    <div class="relative z-10 flex-1 flex flex-col items-center justify-end pb-20 gap-3">
      <button class="px-10 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium text-sm hover:bg-white/20 transition-all duration-300">
        Start Conversation
      </button>
      <p class="text-white/35 text-xs tracking-wide">Press to start conversation</p>
    </div>
  </div>
</template>
