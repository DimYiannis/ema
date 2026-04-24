<script setup lang="ts">
import { ref, watch } from "vue";
import { useRenderLoop } from "@tresjs/core";
import * as THREE from "three";

const meshRef = ref<THREE.Mesh | null>(null);

const { onLoop } = useRenderLoop();
onLoop(({ elapsed }) => {
  const mesh = meshRef.value;
  if (!mesh) return;
  const geo = mesh.geometry as THREE.PlaneGeometry;
  const pos = geo.attributes.position;
  if (!pos) return;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(x * 0.5 + elapsed) * Math.cos(y * 0.5 + elapsed) * 0.3);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
});
</script>

<template>
  <TresMesh ref="meshRef" :rotation="[-Math.PI / 3, 0, 0]" :position="[0, -2, 0]">
    <TresPlaneGeometry :args="[20, 20, 50, 50]" />
    <TresMeshStandardMaterial
      color="hsl(var(--accent))"
      :wireframe="true"
      :transparent="true"
      :opacity="0.3"
      emissive="hsl(var(--accent))"
      :emissive-intensity="0.2"
    />
  </TresMesh>
</template>
