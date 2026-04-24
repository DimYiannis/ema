<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Phone, MessageSquare, MapPin, Bell, ArrowDown, Navigation, Calendar, Footprints, Brain, Shield, Newspaper, Bus, Heart, Users, ChevronRight, MessageCircle, CheckCircle, LogOut, Eye } from "lucide-vue-next";
import HeroScene from "@/components/3d/HeroScene.vue";
import AIGridBackground from "@/components/3d/AIGridBackground.vue";
import FloatingParticles from "@/components/FloatingParticles.vue";
import Header from "@/components/Header.vue";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button.vue";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "vue-sonner";
import heroImage from "@/assets/hero-phone-call.png";
import type { Session } from "@supabase/supabase-js";

const router = useRouter();
const session = ref<Session | null>(null);
const hoveredStep = ref<number | null>(null);

let authSub: { unsubscribe: () => void } | null = null;

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((_event, s) => { session.value = s; });
  authSub = data.subscription;
  supabase.auth.getSession().then(({ data: { session: s } }) => { session.value = s; });
});

onUnmounted(() => authSub?.unsubscribe());

const handleLogout = async () => {
  await supabase.auth.signOut();
  toast.success("Logged out", { description: "You've been successfully logged out." });
};

const scrollToContent = () => {
  document.getElementById("content")?.scrollIntoView({ behavior: "smooth" });
};

const features = [
  { icon: Navigation, title: "Smart Navigation", description: "Real-time voice guidance for public transport, walking routes, and landmarks — no app experience needed." },
  { icon: Calendar, title: "Daily Planning", description: "Voice-activated scheduling that reads appointments back to you and reminds you of upcoming events." },
  { icon: Brain, title: "Memory Support", description: "Gentle reminders for medications, appointments, and important tasks tailored to your daily rhythm." },
  { icon: Shield, title: "Safety First", description: "Family notifications and emergency contacts just a voice command away, giving peace of mind to loved ones." },
  { icon: Newspaper, title: "Daily Briefings", description: "Morning news, weather, and personalized updates delivered in a calm, clear voice you can trust." },
  { icon: Bus, title: "Transit Help", description: "Step-by-step guidance for buses, trains, and trams — including real-time delays and platform changes." },
];

const steps = [
  { number: 1, icon: Phone, title: "Call or open the app on your phone", description: "Tap or answer call—no setup needed. Just pick up and start." },
  { number: 2, icon: MessageSquare, title: "Ask where you want to go in your own words", description: "Speak naturally and the voice assistant listens and understands." },
  { number: 3, icon: MapPin, title: "Receive clear, spoken directions step by step", description: "Voice output gives you turn-by-turn instructions as you travel." },
  { number: 4, icon: Bell, title: "Optional: Family or caregiver gets notified", description: "Optional alert to family for added safety and peace of mind." },
];
</script>

<template>
  <div>
    <Header />

    <main class="relative w-full overflow-x-hidden bg-background">
      <!-- Hero Section -->
      <section class="h-screen relative flex items-center justify-center">
        <div class="absolute inset-0 bg-gradient-to-br from-background via-accent/10 to-background" />
        <AIGridBackground />
        <HeroScene />

        <div class="relative z-20 text-center text-foreground px-6">
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { duration: 1200, delay: 300 } }"
          >
            <h1 class="text-6xl md:text-8xl lg:text-9xl font-sans font-light mb-6">ema.</h1>
            <p class="opacity-60 text-lg md:text-xl tracking-widest font-sans font-normal mb-12">
              Real-Time Voice Intelligence
            </p>

            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 800, delay: 1000 } }"
              class="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <template v-if="session">
                <Button size="lg" class="rounded-full px-8" @click="router.push('/dashboard')">Go to Dashboard</Button>
                <Button size="lg" variant="outline" class="rounded-full px-8 gap-2" @click="handleLogout">
                  <LogOut class="h-4 w-4" />
                  Logout
                </Button>
              </template>
              <template v-else>
                <Button size="lg" class="rounded-full px-8" @click="router.push('/login')">Login</Button>
                <Button size="lg" variant="outline" class="rounded-full px-8" @click="scrollToContent">Learn More</Button>
              </template>
            </div>
          </div>
        </div>

        <button
          @click="scrollToContent"
          class="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-20"
        >
          <span class="text-xs uppercase tracking-widest font-sans font-normal">Scroll to explore</span>
          <ArrowDown class="w-4 h-4 animate-bounce-down" />
        </button>
      </section>

      <div id="content">
        <!-- Hero Info Section -->
        <section
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 800 } }"
          class="min-h-screen flex items-center justify-center px-4 pb-20 relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-background via-accent/20 to-background" />
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(140,120,100,0.1),transparent_50%)]" />
          <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div
              v-motion
              :initial="{ opacity: 0, x: -50 }"
              :visible-once="{ opacity: 1, x: 0, transition: { duration: 800, delay: 200 } }"
              class="space-y-6"
            >
              <h2 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight drop-shadow-lg">
                Call and Connect with Your AI Assistant
              </h2>
              <p class="text-xl md:text-2xl text-muted-foreground leading-relaxed drop-shadow-md">
                Plan trips, get directions, and stay connected — all by speaking naturally.
              </p>
              <Button size="lg" class="text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" @click="router.push('/dashboard')">
                Try It Today
                <ChevronRight class="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div
              v-motion
              :initial="{ opacity: 0, x: 50 }"
              :visible-once="{ opacity: 1, x: 0, transition: { duration: 800, delay: 400 } }"
              class="flex items-center justify-center"
            >
              <div class="relative w-full aspect-square max-w-lg">
                <div class="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                <img :src="heroImage" alt="Older adults using AI voice companion" class="relative rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border border-border/50 object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </section>

        <!-- Problem Section -->
        <section
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 800 } }"
          class="py-24 px-4 bg-card"
        >
          <div class="max-w-6xl mx-auto">
            <h2
              v-motion
              :initial="{ opacity: 0, y: 30 }"
              :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
              class="text-4xl md:text-5xl font-bold text-center text-foreground mb-16"
            >Travel Shouldn't Be Hard at Any Age</h2>
            <div class="grid md:grid-cols-3 gap-8">
              <div
                v-for="(problem, i) in [
                  { icon: Phone, title: 'Digital Barriers', desc: 'Complex apps are confusing and hard to navigate' },
                  { icon: Footprints, title: 'Physical Barriers', desc: 'Walking, boarding, and navigation is challenging' },
                  { icon: Calendar, title: 'Social Barriers', desc: 'Missing errands and social events due to travel difficulty' },
                ]"
                :key="problem.title"
                v-motion
                :initial="{ opacity: 0, y: 50 }"
                :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: i * 100 } }"
              >
                <Card class="border-2 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <CardContent class="pt-8 text-center space-y-4">
                    <div class="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
                      <component :is="problem.icon" class="w-10 h-10 text-primary drop-shadow-md" />
                    </div>
                    <h3 class="text-2xl font-semibold text-foreground">{{ problem.title }}</h3>
                    <p class="text-lg text-muted-foreground">{{ problem.desc }}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-32 px-4 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 pointer-events-none" />
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <div
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
              >
                <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-4">Everything You Need</h2>
                <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Powerful features designed for independence and peace of mind</p>
              </div>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div
                v-for="(feature, i) in features"
                :key="feature.title"
                v-motion
                :initial="{ opacity: 0, y: 50 }"
                :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: i * 100 } }"
              >
                <Card class="group relative border-2 hover:border-accent/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden h-full">
                  <CardContent class="pt-8 space-y-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border-2 border-primary/20 group-hover:border-accent/50 transition-all duration-300">
                      <component :is="feature.icon" class="w-7 h-7 text-primary group-hover:text-accent transition-colors duration-300" />
                    </div>
                    <h3 class="text-xl font-bold text-foreground">{{ feature.title }}</h3>
                    <p class="text-muted-foreground leading-relaxed">{{ feature.description }}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section id="how-it-works" class="py-32 px-4 bg-card/50 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 pointer-events-none" />
          <div class="max-w-5xl mx-auto relative z-10">
            <div class="text-center mb-16">
              <h2
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
                class="text-4xl md:text-5xl font-bold text-center text-foreground mb-4"
              >How It Works</h2>
              <p
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: 100 } }"
                class="text-xl text-muted-foreground text-center mb-4 max-w-2xl mx-auto"
              >Four simple steps to start your journey with confidence</p>
            </div>

            <div class="space-y-6">
              <div
                v-for="(step, index) in steps"
                :key="step.number"
                v-motion
                :initial="{ opacity: 0, x: -50 }"
                :visible-once="{ opacity: 1, x: 0, transition: { duration: 500, delay: index * 100 } }"
                :hovered="{ scale: 1.02, x: 10 }"
                class="group relative"
                @mouseenter="hoveredStep = index"
                @mouseleave="hoveredStep = null"
              >
                <div class="flex items-center gap-6 bg-background/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl border-2 border-border shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-500">
                  <div class="w-12 md:w-16 flex items-center justify-center flex-shrink-0">
                    <span class="text-5xl md:text-6xl font-bold text-primary drop-shadow-md group-hover:scale-110 transition-transform duration-300">{{ step.number }}</span>
                  </div>
                  <div class="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border-2 border-primary/30 group-hover:border-accent/50 transition-all duration-300">
                    <component :is="step.icon" class="w-10 h-10 md:w-12 md:h-12 text-primary group-hover:text-accent transition-colors duration-300" :stroke-width="2" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-xl md:text-2xl font-bold text-foreground mb-2 leading-tight">{{ step.title }}</h3>
                    <p class="text-base md:text-lg text-muted-foreground leading-relaxed">{{ step.description }}</p>
                  </div>
                </div>
                <div v-if="index < 3" class="absolute left-10 md:left-12 top-full w-0.5 h-6 bg-gradient-to-b from-border to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <!-- Free Trial CTA Section -->
        <section
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 800 } }"
          class="py-32 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-background relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(74,163,118,0.15),transparent_70%)]" />
          <FloatingParticles />

          <div class="max-w-4xl mx-auto text-center relative z-10">
            <div
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :visible-once="{ opacity: 1, scale: 1, transition: { duration: 600, delay: 200 } }"
              class="space-y-8"
            >
              <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Why Not Give Our Free Trial a Try?
              </h2>
              <p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Witness the impact firsthand. Experience how simple voice commands can transform your daily travel and independence.
              </p>
              <div
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: 400 } }"
                class="pt-6"
              >
                <Button
                  size="lg"
                  class="text-xl px-12 py-8 h-auto rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                  @click="router.push(session ? '/dashboard' : '/register')"
                >
                  {{ session ? "Go to Dashboard" : "Start Your Free Trial" }}
                  <ChevronRight class="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <p class="text-sm text-muted-foreground/70 pt-4">No credit card required • Free to start • Cancel anytime</p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer
          v-motion
          :initial="{ opacity: 0 }"
          :visible-once="{ opacity: 1, transition: { duration: 800 } }"
          class="py-12 px-4 bg-card border-t"
        >
          <div class="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <h3 class="font-semibold text-lg text-foreground mb-3">Contact</h3>
              <p class="text-muted-foreground">info@voicecompanion.com</p>
            </div>
            <div>
              <h3 class="font-semibold text-lg text-foreground mb-3">Legal</h3>
              <div class="space-y-2 text-muted-foreground">
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-lg text-foreground mb-3">Support</h3>
              <div class="space-y-2 text-muted-foreground">
                <p>Accessibility Statement</p>
                <p>FAQ</p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-lg text-foreground mb-3">Follow Us</h3>
              <p class="text-muted-foreground">Social links coming soon</p>
            </div>
          </div>
          <div class="max-w-6xl mx-auto mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>© 2024 Voice Companion. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>
