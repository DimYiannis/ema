<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Button from "@/components/ui/button.vue";
import Header from "@/components/Header.vue";
import { Loader2 } from "lucide-vue-next";

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
    if (!s) {
      router.push("/login");
    } else {
      setTimeout(() => fetchUserProfile(s.user.id), 0);
    }
  });

  const { data } = supabase.auth.onAuthStateChange((_event, s) => {
    session.value = s;
    if (!s) {
      router.push("/login");
    } else {
      setTimeout(() => fetchUserProfile(s.user.id), 0);
    }
  });
  authSubscription = data.subscription;
});

onUnmounted(() => authSubscription?.unsubscribe());
</script>

<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <Loader2 class="h-8 w-8 animate-spin text-primary" />
  </div>

  <main v-else-if="session" class="min-h-screen bg-background font-sans">
    <Header />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-foreground">
          Welcome back{{ firstName ? `, ${firstName}` : "" }}! 👋
        </h1>
        <p class="text-muted-foreground mt-2">Your AI companion is ready to help you navigate your day.</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg bg-card p-6">
          <div class="pb-3">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Recent Trips</h3>
          </div>
          <p class="text-base text-muted-foreground">No trips yet. Start your first journey today!</p>
        </div>

        <div class="border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg bg-card p-6">
          <div class="pb-3">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Upcoming</h3>
          </div>
          <p class="text-base text-muted-foreground">Schedule your next trip with AI guidance</p>
        </div>
      </div>

      <div class="border-2 shadow-xl rounded-lg bg-card">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-2">Get Started</h2>
          <p class="text-base text-muted-foreground mb-6">Begin planning your next journey with voice-powered assistance</p>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-start gap-4 p-4 bg-accent/20 rounded-lg">
            <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg font-bold text-primary-foreground">1</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-1">Tell us where you want to go</h3>
              <p class="text-muted-foreground">Simply speak or type your destination</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 bg-accent/20 rounded-lg">
            <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg font-bold text-primary-foreground">2</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-1">Get personalized directions</h3>
              <p class="text-muted-foreground">Receive step-by-step guidance tailored to your pace</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 bg-accent/20 rounded-lg">
            <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg font-bold text-primary-foreground">3</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-1">Travel with confidence</h3>
              <p class="text-muted-foreground">Ask questions anytime during your journey</p>
            </div>
          </div>

          <div class="pt-4 text-center">
            <p class="text-muted-foreground text-sm">Voice AI integration coming soon (Mistral)</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
