<script setup lang="ts">
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 10 + 10,
  delay: Math.random() * 5,
}));
</script>

<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute inset-0 opacity-10">
      <svg class="w-full h-full">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--accent))" stroke-width="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <div
      v-for="p in particles"
      :key="p.id"
      class="absolute w-1 h-1 rounded-full bg-accent/30"
      :style="{
        left: `${p.x}%`,
        top: `${p.y}%`,
        animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
      }"
    />

    <div class="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background" />
  </div>
</template>

<style scoped>
@keyframes float-particle {
  from {
    transform: translate(0, 0);
    opacity: 0.2;
  }
  to {
    transform: translate(calc(var(--tx, 20px)), calc(var(--ty, -30px)));
    opacity: 0.5;
  }
}

.absolute[style*="float-particle"] {
  --tx: calc((var(--id, 0) * 13 % 40 - 20) * 1px);
  --ty: -30px;
}
</style>
