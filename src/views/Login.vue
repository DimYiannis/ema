<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button.vue";
import Input from "@/components/ui/input.vue";
import Label from "@/components/ui/label.vue";
import { toast } from "vue-sonner";
import { LogIn, Sparkles } from "lucide-vue-next";
import { supabase } from "@/integrations/supabase/client";

const DEMO_EMAIL = "demo@ema.ai";
const DEMO_PASSWORD = "Demo1234!";

const router = useRouter();

const schema = toTypedSchema(
  z.object({
    email: z.string().trim().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
);

const { handleSubmit, defineField, errors, isSubmitting } = useForm({ validationSchema: schema });
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

let authSubscription: { unsubscribe: () => void } | null = null;

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) router.push("/dashboard");
  });
  authSubscription = data.subscription;

  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        router.push("/dashboard");
      } else {
        await supabase.auth.signOut();
      }
    }
  });
});

onUnmounted(() => authSubscription?.unsubscribe());

const isDemoLoading = ref(false);

const loginAsDemo = async () => {
  isDemoLoading.value = true;
  const { error } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  isDemoLoading.value = false;
  if (error) {
    toast.error("Demo unavailable", { description: "Demo account not set up yet." });
    return;
  }
  toast.success("Welcome to the demo!", { description: "You're exploring ema. as a demo user." });
};

const onSubmit = handleSubmit(async (values) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });
  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      toast.error("Invalid credentials", { description: "Please check your email and password." });
    } else {
      toast.error("Login failed", { description: error.message });
    }
    return;
  }
  toast.success("Welcome back!", { description: "You've successfully logged in." });
});
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4 relative overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style="animation-duration: 8s" />
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style="animation-duration: 10s; animation-delay: 1s" />
    </div>

    <Card class="w-full max-w-md shadow-lg border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500 relative z-10">
      <CardHeader class="space-y-2 text-center">
        <div class="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
          <LogIn class="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle class="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription class="text-base">Sign in to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit="onSubmit" class="space-y-5">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" v-model="email" v-bind="emailAttrs" :disabled="isSubmitting" />
            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" v-model="password" v-bind="passwordAttrs" :disabled="isSubmitting" />
            <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
          </div>

          <Button type="submit" class="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </Button>
        </form>

        <div class="mt-5 relative flex items-center gap-3">
          <div class="flex-1 h-px bg-border" />
          <span class="text-xs text-muted-foreground shrink-0">or</span>
          <div class="flex-1 h-px bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          class="w-full mt-4 gap-2 border-dashed"
          :disabled="isDemoLoading || isSubmitting"
          @click="loginAsDemo"
        >
          <span v-if="isDemoLoading" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            Loading demo...
          </span>
          <span v-else class="flex items-center gap-2">
            <Sparkles class="w-4 h-4" />
            Try Demo Account
          </span>
        </Button>

        <div class="mt-5 text-center">
          <p class="text-sm text-muted-foreground">
            Don't have an account?
            <RouterLink to="/register" class="text-primary font-medium hover:underline ml-1">Sign up</RouterLink>
          </p>
        </div>
      </CardContent>
    </Card>
  </main>
</template>
