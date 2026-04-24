<script setup lang="ts">
import { ref } from "vue";
import { TresCanvas, useRenderLoop } from "@tresjs/core";
import * as THREE from "three";

const props = defineProps<{
  type: "phone" | "message" | "navigation" | "shield";
}>();

const groupRef = ref<THREE.Group | null>(null);
const meshRef = ref<THREE.Mesh | null>(null);
const color = "#8c7864";

const { onLoop } = useRenderLoop();
onLoop(({ elapsed }) => {
  const g = groupRef.value || meshRef.value;
  if (!g) return;
  g.rotation.y = Math.sin(elapsed * 0.5) * 0.3;
  g.rotation.x = Math.cos(elapsed * 0.3) * 0.2;
  g.position.y = Math.sin(elapsed) * 0.1;
});
</script>

<template>
  <div class="w-10 h-10 flex-shrink-0">
    <TresCanvas alpha>
      <TresPerspectiveCamera :position="[0, 0, 3]" :fov="50" make-default />
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
      <TresPointLight :position="[-5, -5, -5]" :intensity="0.3" />

      <!-- Phone -->
      <TresGroup v-if="type === 'phone'" ref="groupRef">
        <TresMesh>
          <TresBoxGeometry :args="[0.7, 1.3, 0.15]" />
          <TresMeshStandardMaterial :color="color" :metalness="0.8" :roughness="0.2" :emissive="color" :emissive-intensity="0.2" />
        </TresMesh>
        <TresMesh>
          <TresBoxGeometry :args="[0.6, 1.1, 0.16]" />
          <TresMeshStandardMaterial color="#2a2a2a" :metalness="0.9" :roughness="0.1" emissive="#4a4a4a" :emissive-intensity="0.3" />
        </TresMesh>
        <TresMesh :position="[0, -0.5, 0.08]">
          <TresSphereGeometry :args="[0.08, 16, 16]" />
          <TresMeshStandardMaterial :color="color" :metalness="0.8" :roughness="0.3" />
        </TresMesh>
      </TresGroup>

      <!-- Message -->
      <TresMesh v-else-if="type === 'message'" ref="meshRef">
        <TresSphereGeometry :args="[0.7, 32, 32]" />
        <TresMeshStandardMaterial :color="color" :metalness="0.6" :roughness="0.2" :emissive="color" :emissive-intensity="0.2" />
      </TresMesh>

      <!-- Navigation -->
      <TresMesh v-else-if="type === 'navigation'" ref="meshRef">
        <TresConeGeometry :args="[0.7, 1.2, 4]" />
        <TresMeshStandardMaterial :color="color" :metalness="0.6" :roughness="0.2" :emissive="color" :emissive-intensity="0.2" />
      </TresMesh>

      <!-- Shield -->
      <TresMesh v-else-if="type === 'shield'" ref="meshRef" :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[0.6, 0.25, 16, 32]" />
        <TresMeshStandardMaterial :color="color" :metalness="0.6" :roughness="0.2" :emissive="color" :emissive-intensity="0.2" />
      </TresMesh>
    </TresCanvas>
  </div>
</template>
