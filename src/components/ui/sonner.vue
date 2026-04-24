<script setup lang="ts">
import { Toaster as VueSonnerToaster } from "vue-sonner";

interface Props {
  richColors?: boolean;
  expand?: boolean;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}

withDefaults(defineProps<Props>(), {
  richColors: true,
  expand: false,
  position: "bottom-right",
});
</script>

<template>
  <VueSonnerToaster v-bind="$props" />
</template>
