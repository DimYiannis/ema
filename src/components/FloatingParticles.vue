<script setup lang="ts">
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 10 + 15,
  delay: Math.random() * 5,
  dx: Math.random() * 20 - 10,
}));
</script>

<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      v-for="p in particles"
      :key="p.id"
      class="absolute rounded-full bg-foreground/20"
      :style="{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: `${p.size}px`,
        height: `${p.size}px`,
        animation: `float-up ${p.duration}s ease-in-out ${p.delay}s infinite`,
      }"
    />
  </div>
</template>

<style scoped>
@keyframes float-up {
  0%, 100% { transform: translate(0, 0); opacity: 0.2; }
  50% { transform: translate(0, -30px); opacity: 0.5; }
}
</style>
