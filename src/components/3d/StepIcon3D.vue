<script setup lang="ts">
import { ref, onMounted } from "vue";
import { TresCanvas, useRenderLoop } from "@tresjs/core";
import * as THREE from "three";
import chatBubbleImage from "@/assets/chat-bubble-3d.png";

const props = defineProps<{
  type: "phone" | "message" | "map" | "notification";
  isHovered: boolean;
}>();

const groupRef = ref<THREE.Group | null>(null);
const chatTexture = ref<THREE.Texture | null>(null);
const primaryColor = "#8c7864";
const accentColor = "#8c9c65";

onMounted(async () => {
  if (props.type === "message") {
    const loader = new THREE.TextureLoader();
    chatTexture.value = await loader.loadAsync(chatBubbleImage);
  }
});

const { onLoop } = useRenderLoop();
onLoop(({ elapsed }) => {
  const g = groupRef.value;
  if (!g) return;
  g.position.y = Math.sin(elapsed * 1.5) * 0.15;
  if (props.isHovered) {
    g.rotation.y += 0.02;
  } else {
    g.rotation.y = Math.sin(elapsed * 0.5) * 0.2;
  }
});
</script>

<template>
  <div class="w-24 h-24 flex-shrink-0">
    <TresCanvas alpha shadows>
      <TresPerspectiveCamera :position="[0, 0, 4]" :fov="50" make-default />
      <TresAmbientLight :intensity="0.4" />
      <TresDirectionalLight :position="[5, 8, 5]" :intensity="1.2" cast-shadow />
      <TresPointLight :position="[-5, 5, -5]" :intensity="0.5" :color="accentColor" />
      <TresSpotLight :position="[0, 5, 0]" :angle="0.6" :penumbra="1" :intensity="0.5" cast-shadow />

      <!-- Phone -->
      <TresGroup v-if="type === 'phone'" ref="groupRef" :scale="isHovered ? 1.1 : 1">
        <TresMesh cast-shadow>
          <TresBoxGeometry :args="[0.8, 1.4, 0.12]" />
          <TresMeshStandardMaterial :color="primaryColor" :metalness="0.9" :roughness="0.1" :emissive="primaryColor" :emissive-intensity="0.3" />
        </TresMesh>
        <TresMesh :position="[0, 0.05, 0]" cast-shadow>
          <TresBoxGeometry :args="[0.7, 1.2, 0.13]" />
          <TresMeshStandardMaterial color="#1a1a1a" :metalness="0.95" :roughness="0.05" :emissive="accentColor" :emissive-intensity="isHovered ? 0.5 : 0.2" />
        </TresMesh>
        <TresMesh :position="[0, 0.6, 0]" :rotation="[Math.PI / 2, 0, 0]">
          <TresCylinderGeometry :args="[0.05, 0.05, 0.14]" />
          <TresMeshStandardMaterial color="#1a1a1a" :metalness="0.8" :roughness="0.2" />
        </TresMesh>
      </TresGroup>

      <!-- Message with texture -->
      <TresGroup v-else-if="type === 'message'" ref="groupRef" :scale="isHovered ? 1.2 : 1">
        <TresMesh v-if="chatTexture" :position="[0, 0, 0]">
          <TresPlaneGeometry :args="[2, 2]" />
          <TresMeshStandardMaterial
            :map="chatTexture"
            :transparent="true"
            :side="THREE.DoubleSide"
            :metalness="0.3"
            :roughness="0.5"
            :emissive="accentColor"
            :emissive-intensity="isHovered ? 0.3 : 0.1"
          />
        </TresMesh>
      </TresGroup>

      <!-- Map/Location Pin -->
      <TresGroup v-else-if="type === 'map'" ref="groupRef" :scale="isHovered ? 1.1 : 1">
        <TresMesh :position="[0, 0.5, 0]" :scale="[1, 1.2, 1]" cast-shadow>
          <TresSphereGeometry :args="[0.4, 32, 32]" />
          <TresMeshStandardMaterial :color="primaryColor" :metalness="0.7" :roughness="0.2" :emissive="accentColor" :emissive-intensity="isHovered ? 0.6 : 0.3" />
        </TresMesh>
        <TresMesh :position="[0, -0.1, 0]" :rotation="[Math.PI, 0, 0]" cast-shadow>
          <TresConeGeometry :args="[0.35, 0.8, 32]" />
          <TresMeshStandardMaterial :color="primaryColor" :metalness="0.8" :roughness="0.15" />
        </TresMesh>
        <TresMesh :position="[0, 0.5, 0.41]">
          <TresSphereGeometry :args="[0.15, 16, 16]" />
          <TresMeshStandardMaterial color="#fff" emissive="#fff" :emissive-intensity="0.8" />
        </TresMesh>
        <TresMesh :position="[0, -0.7, 0]" :rotation="[Math.PI / 2, 0, 0]">
          <TresTorusGeometry :args="[0.6, 0.05, 16, 32]" />
          <TresMeshStandardMaterial :color="accentColor" :transparent="true" :opacity="isHovered ? 0.6 : 0.3" :emissive="accentColor" :emissive-intensity="0.5" />
        </TresMesh>
      </TresGroup>

      <!-- Notification Bell -->
      <TresGroup v-else-if="type === 'notification'" ref="groupRef" :scale="isHovered ? 1.1 : 1" :rotation="[0, 0, isHovered ? 0.2 : 0]">
        <TresMesh :position="[0, 0.2, 0]" :rotation="[Math.PI, 0, 0]" cast-shadow>
          <TresConeGeometry :args="[0.5, 0.7, 32]" />
          <TresMeshStandardMaterial :color="primaryColor" :metalness="0.7" :roughness="0.2" :emissive="accentColor" :emissive-intensity="isHovered ? 0.6 : 0.3" />
        </TresMesh>
        <TresMesh :position="[0, 0.6, 0]">
          <TresSphereGeometry :args="[0.12, 16, 16]" />
          <TresMeshStandardMaterial :color="primaryColor" :metalness="0.8" :roughness="0.2" />
        </TresMesh>
        <TresMesh :position="[0.4, 0.4, 0]">
          <TresSphereGeometry :args="[0.15, 16, 16]" />
          <TresMeshStandardMaterial color="#ff4444" emissive="#ff4444" :emissive-intensity="isHovered ? 1 : 0.6" />
        </TresMesh>
        <TresMesh v-for="(r, i) in [0.7, 0.85]" :key="i" :position="[0, 0.3, 0]" :rotation="[Math.PI / 2, 0, 0]">
          <TresTorusGeometry :args="[r, 0.03, 16, 32]" />
          <TresMeshStandardMaterial :color="accentColor" :transparent="true" :opacity="isHovered ? 0.5 - i * 0.15 : 0.2 - i * 0.1" :emissive="accentColor" :emissive-intensity="0.5" />
        </TresMesh>
      </TresGroup>
    </TresCanvas>
  </div>
</template>
