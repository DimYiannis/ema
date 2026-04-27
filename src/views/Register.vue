<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button.vue";
import Input from "@/components/ui/input.vue";
import Label from "@/components/ui/label.vue";
import { toast } from "vue-sonner";
import { UserPlus } from "lucide-vue-next";
import { supabase } from "@/integrations/supabase/client";

const router = useRouter();

const schema = toTypedSchema(
  z.object({
    firstName: z.string().trim().min(1, { message: "First name is required" }).max(50),
    lastName: z.string().trim().min(1, { message: "Last name is required" }).max(50),
    email: z.string().trim().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
);

const { handleSubmit, defineField, errors, isSubmitting } = useForm({ validationSchema: schema });
const [firstName, firstNameAttrs] = defineField("firstName");
const [lastName, lastNameAttrs] = defineField("lastName");
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

const onSubmit = handleSubmit(async (values) => {
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        first_name: values.firstName,
        last_name: values.lastName,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      toast.error("Account exists", { description: "This email is already registered. Please login instead." });
    } else {
      toast.error("Signup failed", { description: error.message });
    }
    return;
  }

  toast.success("Account created!", { description: "Welcome! You're all set." });
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
          <UserPlus class="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle class="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Create Account</CardTitle>
        <CardDescription class="text-base">Sign up to get started</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit="onSubmit" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="firstName">First Name</Label>
              <Input id="firstName" type="text" placeholder="John" v-model="firstName" v-bind="firstNameAttrs" :disabled="isSubmitting" />
              <p v-if="errors.firstName" class="text-sm text-destructive">{{ errors.firstName }}</p>
            </div>
            <div class="space-y-2">
              <Label for="lastName">Last Name</Label>
              <Input id="lastName" type="text" placeholder="Doe" v-model="lastName" v-bind="lastNameAttrs" :disabled="isSubmitting" />
              <p v-if="errors.lastName" class="text-sm text-destructive">{{ errors.lastName }}</p>
            </div>
          </div>

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
              Creating account...
            </span>
            <span v-else>Sign Up</span>
          </Button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-muted-foreground">
            Already have an account?
            <RouterLink to="/login" class="text-primary font-medium hover:underline ml-1">Sign in</RouterLink>
          </p>
        </div>
      </CardContent>
    </Card>
  </main>
</template>
