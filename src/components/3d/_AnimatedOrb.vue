<script setup lang="ts">
import { ref } from "vue";
import { useRenderLoop } from "@tresjs/core";
import { MeshWobbleMaterial } from "@tresjs/cientos";
import * as THREE from "three";

const groupRef = ref<THREE.Group | null>(null);

const { onLoop } = useRenderLoop();
onLoop(({ elapsed }) => {
  if (groupRef.value) {
    groupRef.value.rotation.x = elapsed * 0.2;
    groupRef.value.rotation.y = elapsed * 0.3;
  }
});
</script>

<template>
  <TresGroup ref="groupRef" :scale="[2.5, 2.5, 2.5]">
    <TresMesh>
      <TresIcosahedronGeometry :args="[1, 4]" />
      <MeshWobbleMaterial
        color="hsl(var(--accent))"
        :factor="0.4"
        :speed="2"
        :roughness="0"
        :metalness="1"
        emissive="hsl(var(--accent))"
        :emissive-intensity="1.5"
        :wireframe="true"
        :transparent="true"
        :opacity="0.9"
      />
    </TresMesh>
  </TresGroup>
</template>
