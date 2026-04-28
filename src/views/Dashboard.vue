<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Header from "@/components/Header.vue";
import { Loader2, Mic, Map, Calendar, Sparkles } from "lucide-vue-next";

const router = useRouter();
const session = ref<Session | null>(null);
const loading = ref(true);
const firstName = ref<string | null>(null);

let authSubscription: { unsubscribe: () => void } | null = null;

const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("first_name").eq("id", userId).maybeSingle();
  if (!error && data) firstName.value = data.first_name;
};

onMounted(() => {
  supabase.auth.getSession().then(({ data: { session: s } }) => {
    session.value = s;
    loading.value = false;
    if (!s) router.push("/login");
    else fetchUserProfile(s.user.id);
  });

  const { data } = supabase.auth.onAuthStateChange((_event, s) => {
    session.value = s;
    if (!s) router.push("/login");
    else fetchUserProfile(s.user.id);
  });
  authSubscription = data.subscription;
});

onUnmounted(() => authSubscription?.unsubscribe());
</script>

<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-background">
    <Loader2 class="h-8 w-8 animate-spin text-primary" />
  </div>

  <main v-else-if="session" class="min-h-screen bg-background font-sans">
    <Header />

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      <!-- Welcome -->
      <div>
        <h1 class="text-3xl font-bold text-foreground">
          Welcome Back{{ firstName ? `, ${firstName}` : "" }}!
        </h1>
        <p class="text-muted-foreground mt-1">Ready to start your journey?</p>
      </div>

      <!-- Voice banner -->
      <div class="flex items-center justify-between bg-card border border-border rounded-xl px-6 py-4 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Mic class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="font-semibold text-foreground">Talk to Your AI Assistant</p>
            <p class="text-sm text-muted-foreground">Speak directly with ema — right in your browser</p>
          </div>
        </div>
        <RouterLink
          to="/voice"
          class="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium text-sm hover:opacity-90 transition-opacity shadow"
        >
          <Mic class="w-4 h-4" />
          Start Talking
        </RouterLink>
      </div>

      <!-- Feature cards -->
      <div class="grid md:grid-cols-3 gap-4">
        <RouterLink to="/voice" class="bg-card border border-border rounded-xl p-6 space-y-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer block">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-primary" />
          </div>
          <h3 class="font-semibold text-foreground">Voice AI</h3>
          <p class="text-sm text-muted-foreground">Start a conversation with your AI assistant</p>
        </RouterLink>

        <div class="bg-card border border-border rounded-xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Map class="w-5 h-5 text-primary" />
          </div>
          <h3 class="font-semibold text-foreground">Recent Trips</h3>
          <p class="text-sm text-muted-foreground">No trips yet. Start your first journey today!</p>
        </div>

        <div class="bg-card border border-border rounded-xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Calendar class="w-5 h-5 text-primary" />
          </div>
          <h3 class="font-semibold text-foreground">Upcoming</h3>
          <p class="text-sm text-muted-foreground">Schedule your next trip with AI guidance</p>
        </div>
      </div>

      <!-- Get Started -->
      <div class="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 pt-6 pb-2">
          <h2 class="text-xl font-bold text-foreground">Get Started</h2>
          <p class="text-sm text-muted-foreground mt-1">Begin planning your next journey with voice-powered assistance</p>
        </div>
        <div class="px-6 pb-6 mt-4 space-y-3">
          <div v-for="(step, i) in [
            { n: 1, title: 'Tell us where you want to go', desc: 'Simply speak or type your destination' },
            { n: 2, title: 'Get personalized directions', desc: 'Receive step-by-step guidance tailored to your pace' },
            { n: 3, title: 'Travel with confidence', desc: 'Ask questions anytime during your journey' },
          ]" :key="i" class="flex items-start gap-4 p-4 bg-accent/10 rounded-lg">
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-bold text-primary-foreground">{{ step.n }}</span>
            </div>
            <div>
              <p class="font-semibold text-foreground text-sm">{{ step.title }}</p>
              <p class="text-muted-foreground text-sm">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>
