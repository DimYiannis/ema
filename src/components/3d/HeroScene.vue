<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import LineParticles from "./_LineParticles.vue";
import AnimatedOrb from "./_AnimatedOrb.vue";

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<template>
  <div class="absolute inset-0 z-10 pointer-events-none md:pointer-events-auto">
    <TresCanvas alpha>
      <TresPerspectiveCamera :position="[0, 0, 5]" :fov="50" make-default />
      <TresAmbientLight :intensity="0.2" />
      <TresPointLight :position="[10, 10, 10]" :intensity="2" color="hsl(var(--accent))" />
      <TresPointLight :position="[-10, -10, -10]" :intensity="1.5" color="hsl(var(--accent))" />
      <TresPointLight :position="[0, 0, 5]" :intensity="1.8" color="hsl(var(--accent))" />
      <LineParticles />
      <AnimatedOrb />
      <OrbitControls
        v-if="!isMobile"
        :enable-zoom="false"
        :enable-pan="false"
        auto-rotate
        :auto-rotate-speed="0.5"
      />
    </TresCanvas>
  </div>
</template>
