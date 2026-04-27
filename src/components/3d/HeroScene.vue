<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 9;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // Wireframe icosahedron
  const orbGeo = new THREE.IcosahedronGeometry(1, 4);
  const orbMat = new THREE.MeshBasicMaterial({
    color: 0x2a2a2a,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });
  const orbGroup = new THREE.Group();
  orbGroup.scale.setScalar(3.5);
  orbGroup.add(new THREE.Mesh(orbGeo, orbMat));
  scene.add(orbGroup);

  // White particle dots
  const PARTICLE_COUNT = 350;
  const edgeGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1, 4));
  const edgeArr = edgeGeo.attributes.position.array as Float32Array;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = Math.floor(Math.random() * (edgeArr.length / 3)) * 3;
    positions[i * 3]     = edgeArr[idx];
    positions[i * 3 + 1] = edgeArr[idx + 1];
    positions[i * 3 + 2] = edgeArr[idx + 2];
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const ptMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.025,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(ptGeo, ptMat);
  points.scale.setScalar(3.5);
  scene.add(points);

  // Interaction state
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let velX = 0, velY = 0;
  let userRotX = 0, userRotY = 0;

  const getXY = (e: MouseEvent | TouchEvent) => {
    if (e instanceof TouchEvent) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const onDown = (e: MouseEvent | TouchEvent) => {
    isDragging = true;
    const { x, y } = getXY(e);
    prevX = x; prevY = y;
    velX = 0; velY = 0;
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const { x, y } = getXY(e);
    const dx = x - prevX;
    const dy = y - prevY;
    velX = dy * 0.005;
    velY = dx * 0.005;
    userRotX += velX;
    userRotY += velY;
    prevX = x; prevY = y;
  };

  const onUp = () => { isDragging = false; };

  canvas.addEventListener("mousedown", onDown);
  canvas.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: true });
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);

  const onResize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let animId: number;

  const animate = () => {
    animId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Momentum decay
    if (!isDragging) {
      velX *= 0.92;
      velY *= 0.92;
      userRotX += velX;
      userRotY += velY;
    }

    // Auto-rotate when nearly still
    const speed = Math.sqrt(velX * velX + velY * velY);
    if (!isDragging && speed < 0.001) {
      userRotY += 0.0015;
    }

    orbGroup.rotation.x = userRotX;
    orbGroup.rotation.y = userRotY;
    points.rotation.x   = userRotX;
    points.rotation.y   = userRotY;

    // Subtle particle pulse
    const posAttr = ptGeo.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const radius = 1 + Math.sin(elapsed * 0.5 + i * 0.1) * 0.03;
      const x = arr[i3], y = arr[i3 + 1], z = arr[i3 + 2];
      const len = Math.sqrt(x * x + y * y + z * z);
      if (len > 0) {
        arr[i3]     = (x / len) * radius;
        arr[i3 + 1] = (y / len) * radius;
        arr[i3 + 2] = (z / len) * radius;
      }
    }
    posAttr.needsUpdate = true;

    renderer.render(scene, camera);
  };
  animate();

  onUnmounted(() => {
    canvas.removeEventListener("mousedown", onDown);
    canvas.removeEventListener("touchstart", onDown);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("touchend", onUp);
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(animId);
    renderer.dispose();
  });
});
</script>

<template>
  <div class="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
    <canvas ref="canvasRef" class="w-full h-full" />
  </div>
</template>
