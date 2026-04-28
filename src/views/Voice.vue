<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import * as THREE from "three";
import { pipeline, env } from "@xenova/transformers";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header.vue";
import { Loader2 } from "lucide-vue-next";
import type { Session } from "@supabase/supabase-js";

env.allowLocalModels = false;
let whisper: any = null;
let whisperLoading = false;

const canvasRef = ref<HTMLCanvasElement | null>(null);
const router = useRouter();
const session = ref<Session | null>(null);
const loading = ref(true);

// Voice state
const isListening = ref(false);
const isSpeaking = ref(false);
const isProcessing = ref(false);
const modelReady = ref(false);
const transcript = ref("");
const aiResponse = ref("");
const audioLevel = ref(0);
const errorMsg = ref("");

let authSub: { unsubscribe: () => void } | null = null;
let stopScene: (() => void) | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let pulseTimer: ReturnType<typeof setInterval> | null = null;

const SYSTEM_PROMPT = `You are ema, a warm and friendly voice AI assistant helping elderly people navigate independently. Keep responses brief (2-3 sentences max), clear, and conversational — no lists or markdown, just natural speech.`;

const FEMALE_VOICE_NAMES = ["Samantha", "Victoria", "Karen", "Moira", "Fiona", "Ava", "Allison", "Susan", "Nicky", "Google US English", "Microsoft Zira", "Microsoft Susan", "Google UK English Female"];

const getFemaleVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  for (const name of FEMALE_VOICE_NAMES) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? null;
};

const speak = (text: string) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1.1;
  const voice = getFemaleVoice();
  if (voice) utterance.voice = voice;
  isSpeaking.value = true;
  audioLevel.value = 0.5;
  utterance.onboundary = () => { audioLevel.value = 0.3 + Math.random() * 0.7; };
  utterance.onend = () => { isSpeaking.value = false; audioLevel.value = 0; };
  window.speechSynthesis.speak(utterance);
};

const sendToNvidia = async (text: string) => {
  const key = import.meta.env.VITE_NVIDIA_API_KEY;
  if (!key) { speak("NVIDIA API key not configured. Please add VITE underscore NVIDIA underscore API underscore KEY to your env file."); return; }
  isProcessing.value = true;
  audioLevel.value = 0.15;
  try {
    const res = await fetch("/api/nvidia/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: text }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "I didn't catch that. Could you try again?";
    aiResponse.value = reply;
    speak(reply);
  } catch {
    speak("Sorry, I had trouble connecting. Please try again.");
  } finally {
    isProcessing.value = false;
  }
};

const getWhisper = async () => {
  if (whisper) return whisper;
  if (whisperLoading) return null;
  whisperLoading = true;
  modelReady.value = false;
  whisper = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en");
  whisperLoading = false;
  modelReady.value = true;
  speak("Hello! I'm ema. How can I help you today?");
  return whisper;
};

const transcribeAudio = async (blob: Blob) => {
  try {
    const asr = await getWhisper();
    if (!asr) { errorMsg.value = "Model still loading, try again."; isProcessing.value = false; return; }
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();
    const float32 = audioBuffer.getChannelData(0);
    const result = await asr(float32, { sampling_rate: 16000, chunk_length_s: 30, stride_length_s: 5 });
    const text = (result as any).text?.trim();
    if (!text) { isProcessing.value = false; errorMsg.value = "No speech detected. Try again."; return; }
    transcript.value = text;
    await sendToNvidia(text);
  } catch {
    isProcessing.value = false;
    errorMsg.value = "Transcription failed. Try again.";
  }
};

const stopRecording = () => {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  isListening.value = false;
  if (pulseTimer) { clearInterval(pulseTimer); pulseTimer = null; }
  audioLevel.value = 0;
};

const startRecording = async () => {
  errorMsg.value = "";
  transcript.value = "";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
    mediaRecorder = new MediaRecorder(stream, { mimeType });
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      isProcessing.value = true;
      const blob = new Blob(audioChunks, { type: mimeType });
      await transcribeAudio(blob);
    };
    mediaRecorder.start();
    isListening.value = true;
    pulseTimer = setInterval(() => { audioLevel.value = 0.2 + Math.random() * 0.8; }, 120);
  } catch {
    errorMsg.value = "Microphone access denied.";
  }
};

const toggleListen = () => {
  if (isSpeaking.value) { window.speechSynthesis.cancel(); isSpeaking.value = false; audioLevel.value = 0; return; }
  if (isListening.value) { stopRecording(); return; }
  startRecording();
};

const noiseGLSL = `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);
    const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+2.0*C.xxx;
    vec3 x3=x0-1.+3.0*C.xxx;
    i=mod(i,289.0);
    vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=1.0/7.0;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;
    vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

const vertexShader = `
  ${noiseGLSL}
  uniform float uTime;
  uniform float uAudioLevel;
  uniform float uIntensity;
  uniform float uTonePitch;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  void main() {
    vNormal = normal;
    vPosition = position;
    float freqMult = 0.8 + uTonePitch * 0.8;
    float noise1 = snoise(position * freqMult + uTime * 0.10);
    float noise2 = snoise(position * (freqMult * 1.5) + uTime * 0.15);
    float noise3 = snoise(position * (freqMult * 2.0) - uTime * 0.08);
    float displacement = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * uIntensity;
    float audioDisplacement = uAudioLevel * (0.3 + uTonePitch * 0.2) * (noise1 + 1.0) * 0.5;
    displacement += audioDisplacement;
    vDisplacement = displacement;
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float uAudioLevel;
  uniform float uGlow;
  uniform float uTonePitch;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(vNormal, viewDirection), 2.5);
    vec3 darkGreen  = mix(vec3(0.0,0.18,0.08), vec3(0.0,0.25,0.15), uTonePitch);
    vec3 midGreen   = mix(vec3(0.0,0.45,0.25), vec3(0.0,0.6,0.35),  uTonePitch);
    vec3 brightGreen= mix(vec3(0.0,1.0,0.6),   vec3(0.3,1.0,0.8),   uTonePitch);
    float t = smoothstep(-0.3, 0.5, vDisplacement);
    vec3 gradientColor = mix(darkGreen, midGreen, t);
    vec3 rim = brightGreen * fresnel * (1.5 + uAudioLevel * 2.0 + uTonePitch * 0.5);
    gl_FragColor = vec4(gradientColor + rim * uGlow, 1.0);
  }
`;

const bgVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bgFragmentShader = `
  varying vec2 vUv;
  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    vec3 centerColor = vec3(0.04, 0.07, 0.05);
    vec3 edgeColor   = vec3(0.0, 0.0, 0.0);
    float gradient = smoothstep(0.0, 1.0, dist);
    vec3 color = mix(centerColor, edgeColor, gradient);
    gl_FragColor = vec4(color, 1.0 - gradient * 0.8);
  }
`;

function initScene(canvas: HTMLCanvasElement, levelFn: () => number) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  // Radial gradient background
  const bgMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShaderMaterial({
      vertexShader: bgVertexShader,
      fragmentShader: bgFragmentShader,
      transparent: true,
    })
  );
  bgMesh.position.z = -8;
  scene.add(bgMesh);

  // Blob
  const uniforms = {
    uTime:       { value: 0 },
    uAudioLevel: { value: 0 },
    uIntensity:  { value: 0.4 },
    uTonePitch:  { value: 0.5 },
    uColor:      { value: new THREE.Color('#004d26') },
    uGlow:       { value: 0.8 },
  };

  const blob = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.5, 32),
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      wireframe: true,
      side: THREE.DoubleSide,
    })
  );
  scene.add(blob);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const mainLight = new THREE.PointLight(0x55ffcc, 2.3);
  mainLight.position.set(0, 0, 3);
  scene.add(mainLight);
  const l1 = new THREE.PointLight(0xffffff, 1.6);
  l1.position.set(-3, 3, 2);
  scene.add(l1);
  const l2 = new THREE.PointLight(0xffffff, 1.6);
  l2.position.set(3, -3, 2);
  scene.add(l2);

  const onResize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  };
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let animId: number;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uAudioLevel.value = levelFn();
    uniforms.uIntensity.value = 0.4 + levelFn() * 0.35;
    blob.rotation.y += 0.0005;
    blob.rotation.x += 0.00025;
    renderer.render(scene, camera);
  };
  animate();

  stopScene = () => {
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(animId);
    renderer.dispose();
  };
}

onMounted(() => {
  supabase.auth.getSession().then(({ data: { session: s } }) => {
    session.value = s;
    loading.value = false;
    if (!s) router.push("/login");
    else getWhisper(); // pre-warm model in background
  });
  const { data } = supabase.auth.onAuthStateChange((_e, s) => {
    session.value = s;
    if (!s) router.push("/login");
  });
  authSub = data.subscription;
});

watch([session, loading], async ([s, l]) => {
  if (s && !l) {
    await nextTick();
    if (canvasRef.value) initScene(canvasRef.value, () => audioLevel.value);
  }
}, { immediate: true });

onUnmounted(() => {
  authSub?.unsubscribe();
  stopScene?.();
  if (pulseTimer) clearInterval(pulseTimer);
  window.speechSynthesis.cancel();
  if (mediaRecorder?.state === "recording") mediaRecorder.stop();
});
</script>

<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-background">
    <Loader2 class="h-8 w-8 animate-spin text-primary" />
  </div>

  <div v-else-if="session" class="min-h-screen bg-[#030503] flex flex-col relative overflow-hidden">
    <Header />

    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none" />

    <div class="relative z-10 flex-1 flex flex-col items-center justify-end pb-20 gap-3">
      <div v-if="transcript || aiResponse" class="max-w-xs text-center space-y-2 mb-2 px-6">
        <p v-if="transcript" class="text-white/50 text-sm">You: {{ transcript }}</p>
        <p v-if="aiResponse && !isListening" class="text-white/90 text-sm leading-relaxed">ema: {{ aiResponse }}</p>
      </div>
      <p v-if="errorMsg" class="text-red-400 text-xs text-center px-6 mb-1">{{ errorMsg }}</p>
      <p class="text-white/35 text-xs tracking-wide">
        <span v-if="!modelReady && !isListening && !isProcessing && !isSpeaking">Loading voice model...</span>
        <span v-else-if="isListening">Listening...</span>
        <span v-else-if="isProcessing">Thinking...</span>
        <span v-else-if="isSpeaking">Speaking — tap to interrupt</span>
        <span v-else>Press to speak</span>
      </p>
      <button
        @click="toggleListen"
        :disabled="isProcessing || !modelReady"
        :class="[
          'px-10 py-3.5 rounded-full backdrop-blur-sm border font-medium text-sm transition-all duration-300 disabled:opacity-50',
          isListening ? 'bg-red-500/30 border-red-400/50 text-white hover:bg-red-500/40' :
          isSpeaking  ? 'bg-primary/30 border-primary/50 text-white hover:bg-primary/40' :
                        'bg-white/10 border-white/15 text-white hover:bg-white/20'
        ]"
      >
        <Loader2 v-if="isProcessing || !modelReady" class="w-4 h-4 animate-spin inline" />
        <span v-else-if="isListening">Stop</span>
        <span v-else-if="isSpeaking">Interrupt</span>
        <span v-else>Start Conversation</span>
      </button>
    </div>
  </div>
</template>
