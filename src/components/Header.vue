<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Menu, X, Moon, Sun, LogOut } from "lucide-vue-next";
import Button from "@/components/ui/button.vue";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "vue-sonner";
import type { Session } from "@supabase/supabase-js";

const router = useRouter();
const isMenuOpen = ref(false);
const isDark = ref(false);
const session = ref<Session | null>(null);
const activeSection = ref("");

let authSubscription: { unsubscribe: () => void } | null = null;
let observer: IntersectionObserver | null = null;

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
  isDark.value = shouldBeDark;
  if (shouldBeDark) document.documentElement.classList.add("dark");

  const { data } = supabase.auth.onAuthStateChange((_event, s) => {
    session.value = s;
  });
  authSubscription = data.subscription;

  supabase.auth.getSession().then(({ data: { session: s } }) => {
    session.value = s;
  });

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px",
    threshold: 0,
  };
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activeSection.value = entry.target.id;
    });
  }, observerOptions);

  const sections = document.querySelectorAll("#features, #how-it-works");
  sections.forEach((s) => observer!.observe(s));
});

onUnmounted(() => {
  authSubscription?.unsubscribe();
  observer?.disconnect();
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
  } catch {}
  session.value = null;
  toast.success("Logged out", { description: "You've been successfully logged out." });
  router.push("/");
};
</script>

<template>
  <header class="sticky top-0 z-[999] pt-3 sm:pt-4 pb-2 sm:pb-4 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-16 backdrop-blur-md border border-white/10 rounded-full px-4 sm:px-6 shadow-lg bg-gradient-to-br from-background via-accent/20 to-background">
        <div class="flex items-center min-w-0">
          <RouterLink to="/" class="flex items-center">
            <span class="text-2xl sm:text-3xl font-bold text-foreground drop-shadow-lg">ema.</span>
          </RouterLink>
        </div>

        <nav class="hidden md:flex items-center gap-2">
          <a
            href="/#features"
            :class="['text-sm font-medium rounded-full px-4 py-2 transition-all', activeSection === 'features' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/60']"
          >Features</a>
          <a
            href="/#how-it-works"
            :class="['text-sm font-medium rounded-full px-4 py-2 transition-all', activeSection === 'how-it-works' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/60']"
          >How It Works</a>
          <RouterLink to="/articles" class="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">Evidence</RouterLink>
          <template v-if="session">
            <RouterLink to="/dashboard" class="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">Dashboard</RouterLink>
            <RouterLink to="/subscription" class="text-sm font-medium hover:bg-muted/60 rounded-full px-4 py-2 transition-all">Subscription</RouterLink>
          </template>
        </nav>

        <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button @click="toggleTheme" class="p-1.5 sm:p-2 rounded-full hover:bg-muted/60 transition-all" aria-label="Toggle theme">
            <Sun v-if="isDark" class="h-4 w-4 sm:h-5 sm:w-5" />
            <Moon v-else class="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <template v-if="session">
            <Button @click="handleLogout" variant="outline" size="lg" class="hidden md:flex gap-2 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full">
              <LogOut class="h-4 w-4" />
              Logout
            </Button>
          </template>
          <template v-else>
            <RouterLink to="/login">
              <Button variant="outline" size="lg" class="hidden md:flex gap-2 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full">Login</Button>
            </RouterLink>
          </template>

          <button class="md:hidden p-1.5 sm:p-2" @click="isMenuOpen = !isMenuOpen" aria-label="Toggle menu">
            <X v-if="isMenuOpen" class="h-5 w-5 sm:h-6 sm:w-6" />
            <Menu v-else class="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>

      <div v-if="isMenuOpen" class="md:hidden mt-2 py-4 bg-card/95 backdrop-blur-lg border border-border rounded-2xl px-4 shadow-xl animate-fade-in">
        <nav class="flex flex-col gap-4">
          <a href="/#features" :class="['text-sm font-medium transition-colors px-3 py-2 rounded-lg', activeSection === 'features' ? 'bg-primary text-primary-foreground' : 'hover:text-accent']">Features</a>
          <a href="/#how-it-works" :class="['text-sm font-medium transition-colors px-3 py-2 rounded-lg', activeSection === 'how-it-works' ? 'bg-primary text-primary-foreground' : 'hover:text-accent']">How It Works</a>
          <RouterLink to="/articles" class="text-sm font-medium hover:text-accent transition-colors px-3 py-2 rounded-lg">Evidence</RouterLink>
          <template v-if="session">
            <RouterLink to="/dashboard" class="text-sm font-medium hover:text-accent transition-colors px-3 py-2 rounded-lg">Dashboard</RouterLink>
            <RouterLink to="/subscription" class="text-sm font-medium hover:text-accent transition-colors px-3 py-2 rounded-lg">Subscription</RouterLink>
            <Button @click="handleLogout" variant="outline" class="w-full rounded-full gap-2">
              <LogOut class="h-4 w-4" />
              Logout
            </Button>
          </template>
          <template v-else>
            <RouterLink to="/login">
              <Button variant="outline" class="w-full rounded-full">Login</Button>
            </RouterLink>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>
