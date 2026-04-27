<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Header from "@/components/Header.vue";
import { Loader2, Check, Zap, Crown } from "lucide-vue-next";

const router = useRouter();
const session = ref<Session | null>(null);
const loading = ref(true);
const billing = ref<"monthly" | "6months" | "annual">("monthly");

let authSub: { unsubscribe: () => void } | null = null;

onMounted(() => {
  supabase.auth.getSession().then(({ data: { session: s } }) => {
    session.value = s;
    loading.value = false;
  });
  const { data } = supabase.auth.onAuthStateChange((_e, s) => {
    session.value = s;
  });
  authSub = data.subscription;
});

onUnmounted(() => authSub?.unsubscribe());

const prices = {
  basic:   { monthly: 9.99,  "6months": 8.49,  annual: 7.49  },
  premium: { monthly: 19.99, "6months": 16.99, annual: 14.99 },
};

const basicPrice   = computed(() => prices.basic[billing.value].toFixed(2));
const premiumPrice = computed(() => prices.premium[billing.value].toFixed(2));

const basicFeatures = [
  "AI Voice Assistant",
  "300 minutes of voice calls/month",
  "Standard support",
  "Basic analytics",
];

const premiumFeatures = [
  "Everything in Basic",
  "1000 minutes of voice calls/month",
  "Priority support",
  "Advanced analytics",
  "Unused minutes carryover (annual)",
  "Custom voice options",
];
</script>

<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-background">
    <Loader2 class="h-8 w-8 animate-spin text-primary" />
  </div>

  <div v-else class="min-h-screen bg-background">
    <Header />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p class="text-muted-foreground mt-1">Upgrade or change your subscription plan</p>
      </div>

      <!-- Billing toggle -->
      <div class="flex justify-center mb-10">
        <div class="inline-flex bg-card border border-border rounded-full p-1 gap-1">
          <button
            v-for="opt in [{ key: 'monthly', label: 'Monthly' }, { key: '6months', label: '6 Months' }, { key: 'annual', label: 'Annual' }]"
            :key="opt.key"
            @click="billing = opt.key as any"
            :class="['px-5 py-2 rounded-full text-sm font-medium transition-all', billing === opt.key ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground']"
          >{{ opt.label }}</button>
        </div>
      </div>

      <!-- Plans -->
      <div class="grid md:grid-cols-2 gap-6">

        <!-- Basic -->
        <div class="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Zap class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-foreground">Basic</h2>
              <p class="text-sm text-muted-foreground">Perfect for getting started</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-muted-foreground mb-1">300 minutes/month</p>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold text-foreground">€{{ basicPrice }}</span>
              <span class="text-muted-foreground text-sm">/ per month</span>
            </div>
          </div>

          <ul class="space-y-3">
            <li v-for="f in basicFeatures" :key="f" class="flex items-center gap-3 text-sm text-foreground">
              <Check class="w-4 h-4 text-primary flex-shrink-0" />
              {{ f }}
            </li>
          </ul>

          <button class="w-full py-3 rounded-full border border-border text-foreground font-medium text-sm hover:bg-accent/10 transition-colors">
            Get Started
          </button>
        </div>

        <!-- Premium -->
        <div class="bg-card border-2 border-primary/50 rounded-2xl p-8 space-y-6 relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span class="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Crown class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-foreground">Premium</h2>
              <p class="text-sm text-muted-foreground">For power users who need more</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-muted-foreground mb-1">1000 minutes/month</p>
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold text-foreground">€{{ premiumPrice }}</span>
              <span class="text-muted-foreground text-sm">/ per month</span>
            </div>
          </div>

          <ul class="space-y-3">
            <li v-for="f in premiumFeatures" :key="f" class="flex items-center gap-3 text-sm text-foreground">
              <Check class="w-4 h-4 text-primary flex-shrink-0" />
              {{ f }}
            </li>
          </ul>

          <button class="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
