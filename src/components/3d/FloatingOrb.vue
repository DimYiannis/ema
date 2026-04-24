<script setup lang="ts">
import { ref } from "vue";
import { useRenderLoop } from "@tresjs/core";
import * as THREE from "three";

const props = withDefaults(
  defineProps<{
    color: string;
    speed?: number;
    scale?: number;
  }>(),
  { speed: 1, scale: 1 }
);

const meshRef = ref<THREE.Mesh | null>(null);

const { onLoop } = useRenderLoop();
onLoop(({ elapsed }) => {
  if (!meshRef.value) return;
  const t = elapsed * props.speed;
  meshRef.value.position.y = Math.sin(t) * 0.3;
  meshRef.value.rotation.x = Math.sin(t * 0.5) * 0.2;
  meshRef.value.rotation.y = Math.cos(t * 0.3) * 0.2;
});
</script>

<template>
  <TresMesh ref="meshRef" :position="[0, 0, 0]">
    <TresSphereGeometry :args="[props.scale, 32, 32]" />
    <TresMeshStandardMaterial
      :color="color"
      :transparent="true"
      :opacity="0.6"
      :roughness="0.2"
      :metalness="0.8"
      :emissive="color"
      :emissive-intensity="0.3"
    />
  </TresMesh>
</template>
