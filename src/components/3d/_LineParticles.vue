<script setup lang="ts">
import { ref, watch } from "vue";
import { useRenderLoop } from "@tresjs/core";
import * as THREE from "three";

const pointsRef = ref<THREE.Points | null>(null);

const PARTICLE_COUNT = 200;
const geo = new THREE.IcosahedronGeometry(1, 4);
const edges = new THREE.EdgesGeometry(geo);
const edgeArr = edges.attributes.position.array as Float32Array;

const positions = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const idx = Math.floor(Math.random() * (edgeArr.length / 3)) * 3;
  positions[i * 3] = edgeArr[idx];
  positions[i * 3 + 1] = edgeArr[idx + 1];
  positions[i * 3 + 2] = edgeArr[idx + 2];
}

const bufferAttr = new THREE.BufferAttribute(positions, 3);

watch(pointsRef, (points) => {
  if (points) {
    points.geometry.setAttribute("position", bufferAttr);
  }
});

const AdditiveBlending = THREE.AdditiveBlending;

const { onLoop } = useRenderLoop();
onLoop(({ elapsed }) => {
  const pts = pointsRef.value;
  if (!pts) return;
  const posAttr = pts.geometry.attributes.position;
  if (!posAttr) return;
  const arr = posAttr.array as Float32Array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const angle = elapsed * 0.5 + i * 0.1;
    const radius = 1 + Math.sin(angle) * 0.05;
    const x = arr[i3], y = arr[i3 + 1], z = arr[i3 + 2];
    const len = Math.sqrt(x * x + y * y + z * z);
    if (len > 0) {
      arr[i3] = (x / len) * radius;
      arr[i3 + 1] = (y / len) * radius;
      arr[i3 + 2] = (z / len) * radius;
    }
  }
  posAttr.needsUpdate = true;
  pts.rotation.x = elapsed * 0.2;
  pts.rotation.y = elapsed * 0.3;
});
</script>

<template>
  <TresPoints ref="pointsRef" :scale="[2.5, 2.5, 2.5]">
    <TresBufferGeometry />
    <TresPointsMaterial
      :size="0.03"
      color="hsl(var(--accent))"
      :transparent="true"
      :opacity="0.8"
      :blending="AdditiveBlending"
      :depth-write="false"
    />
  </TresPoints>
</template>
