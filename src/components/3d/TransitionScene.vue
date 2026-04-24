<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import WaveGrid from "./_WaveGrid.vue";
</script>

<template>
  <div class="h-screen w-full relative">
    <TresCanvas alpha>
      <TresPerspectiveCamera :position="[0, 2, 8]" :fov="60" make-default />
      <TresAmbientLight :intensity="0.2" />
      <TresPointLight :position="[0, 5, 5]" :intensity="1" color="hsl(var(--accent))" />
      <WaveGrid />
    </TresCanvas>
  </div>
</template>
