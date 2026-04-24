<script setup lang="ts">
import { ref } from "vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button.vue";
import { toast } from "vue-sonner";
import { CreditCard, Loader2, Shield } from "lucide-vue-next";
import { supabase } from "@/integrations/supabase/client";

const props = defineProps<{
  onComplete: () => void;
  onSkip?: () => void;
}>();

const isLoading = ref(false);

const handleSetupPayment = async () => {
  isLoading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const name = profile
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : user.email;

    const { data: customerData, error: customerError } = await supabase.functions.invoke(
      "create-mollie-customer",
      { body: { email: user.email, name } }
    );
    if (customerError) throw customerError;

    const { data: mandateData, error: mandateError } = await supabase.functions.invoke(
      "create-payment-mandate",
      { body: { customerId: customerData.customerId, redirectUrl: `${window.location.origin}/dashboard` } }
    );
    if (mandateError) throw mandateError;

    if (mandateData?.checkoutUrl) {
      window.location.href = mandateData.checkoutUrl;
    } else {
      props.onComplete();
    }
  } catch (err) {
    console.error("Payment setup error:", err);
    toast.error("Payment setup failed", { description: "Please try again or skip for now." });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Card class="w-full max-w-md shadow-lg border-border/50 bg-card/50 backdrop-blur-sm relative z-10">
    <CardHeader class="space-y-2 text-center">
      <div class="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
        <CreditCard class="w-6 h-6 text-primary-foreground" />
      </div>
      <CardTitle class="text-2xl font-bold">Set Up Payment</CardTitle>
      <CardDescription>Add a payment method to start your free trial. You won't be charged until the trial ends.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex items-center gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
        <Shield class="w-5 h-5 text-accent flex-shrink-0" />
        <p class="text-sm text-muted-foreground">Your payment info is securely handled by Mollie. No charges during your trial.</p>
      </div>
      <Button @click="handleSetupPayment" :disabled="isLoading" class="w-full">
        <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
        {{ isLoading ? "Setting up..." : "Set Up Payment Method" }}
      </Button>
      <Button v-if="onSkip" @click="onSkip" variant="ghost" class="w-full">Skip for now</Button>
    </CardContent>
  </Card>
</template>
