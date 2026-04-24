<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import FloatingOrb from "./FloatingOrb.vue";

const props = withDefaults(
  defineProps<{
    color?: string;
    speed?: number;
  }>(),
  { color: "#8c7864", speed: 1 }
);
</script>

<template>
  <div class="absolute inset-0 pointer-events-none opacity-40">
    <TresCanvas alpha>
      <TresPerspectiveCamera :position="[0, 0, 5]" :fov="45" make-default />
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
      <TresPointLight :position="[-5, -5, -5]" :intensity="0.5" />
      <FloatingOrb :color="props.color" :speed="props.speed" :scale="1.5" />
      <OrbitControls :enable-zoom="false" :enable-pan="false" auto-rotate :auto-rotate-speed="0.5" />
    </TresCanvas>
  </div>
</template>
