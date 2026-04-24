<script setup lang="ts">
import { ref, computed } from "vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button.vue";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Label from "@/components/ui/label.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Loader2, Sparkles, X, Zap } from "lucide-vue-next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "vue-sonner";

type PlanDuration = "monthly" | "6-month" | "annual";

const props = withDefaults(
  defineProps<{
    userId: string;
    userEmail: string;
    userName: string;
    currentPlan?: string | null;
    currentDuration?: string | null;
    isUpgrade?: boolean;
    onSubscriptionCreated?: () => void;
  }>(),
  { isUpgrade: false }
);

const PLANS = {
  basic: {
    name: "Basic",
    icon: Zap,
    description: "Perfect for getting started",
    minutes: 300,
    features: ["AI Voice Assistant", "300 minutes of voice calls/month", "Standard support", "Basic analytics"],
    availableDurations: ["monthly"] as PlanDuration[],
    pricing: {
      monthly: { amount: "9.99", label: "€9.99/month" },
    } as Record<string, { amount: string; label: string; savings?: string }>,
  },
  premium: {
    name: "Premium",
    icon: Sparkles,
    description: "For power users who need more",
    minutes: 1000,
    features: ["Everything in Basic", "1000 minutes of voice calls/month", "Priority support", "Advanced analytics", "Unused minutes carryover (annual)", "Custom voice options"],
    availableDurations: ["monthly", "6-month", "annual"] as PlanDuration[],
    pricing: {
      monthly: { amount: "19.99", label: "€19.99/month" },
      "6-month": { amount: "99.99", label: "€99.99/6 months", savings: "Save €20" },
      annual: { amount: "179.99", label: "€179.99/year", savings: "Save €60" },
    } as Record<string, { amount: string; label: string; savings?: string }>,
  },
};

const selectedPlan = ref<keyof typeof PLANS>("basic");
const selectedDuration = ref<PlanDuration>("monthly");
const isLoading = ref(false);

const planEntries = computed(() =>
  Object.entries(PLANS) as [keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]][]
);

const currentPlanData = computed(() => PLANS[selectedPlan.value]);
const currentPricing = computed(() => currentPlanData.value.pricing[selectedDuration.value]);

const comparisonFeatures = [
  { feature: "AI Voice Assistant", basic: true, premium: true },
  { feature: "Minutes/month", basic: "300", premium: "1000" },
  { feature: "Standard support", basic: true, premium: true },
  { feature: "Priority support", basic: false, premium: true },
  { feature: "Advanced analytics", basic: false, premium: true },
  { feature: "Custom voice options", basic: false, premium: true },
  { feature: "Minutes carryover", basic: false, premium: "Annual only" },
];

const handleSubscribe = async () => {
  isLoading.value = true;
  try {
    const pricing = currentPricing.value;
    const { data, error } = await supabase.functions.invoke("create-mollie-subscription", {
      body: {
        userId: props.userId,
        userEmail: props.userEmail,
        userName: props.userName,
        plan: selectedPlan.value,
        duration: selectedDuration.value,
        amount: pricing.amount,
        redirectUrl: `${window.location.origin}/subscription?status=paid`,
      },
    });
    if (error) throw error;
    if (data?.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      toast.success("Subscription created!", { description: "Your subscription is now active." });
      props.onSubscriptionCreated?.();
    }
  } catch (err) {
    console.error("Subscription error:", err);
    toast.error("Subscription failed", { description: "Please try again later." });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="space-y-8">
    <div class="grid md:grid-cols-2 gap-6">
      <Card
        v-for="[key, plan] in planEntries"
        :key="key"
        :class="['relative cursor-pointer transition-all duration-300 hover:shadow-xl border-2', selectedPlan === key ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50']"
        @click="selectedPlan = key; selectedDuration = plan.availableDurations[0]"
      >
        <div v-if="currentPlan === key" class="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge class="bg-accent text-accent-foreground">Current Plan</Badge>
        </div>
        <CardHeader class="pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <component :is="plan.icon" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle class="text-xl">{{ plan.name }}</CardTitle>
              <CardDescription>{{ plan.description }}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="text-3xl font-bold">
            {{ plan.pricing[plan.availableDurations[0]].label }}
          </div>
          <ul class="space-y-2">
            <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-2 text-sm">
              <Check class="w-4 h-4 text-accent flex-shrink-0" />
              {{ feature }}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <div v-if="selectedPlan === 'premium'" class="space-y-3">
      <p class="font-medium text-sm text-muted-foreground uppercase tracking-wide">Billing Period</p>
      <RadioGroup v-model="selectedDuration" class="grid grid-cols-3 gap-3">
        <div v-for="dur in PLANS.premium.availableDurations" :key="dur" class="relative">
          <RadioGroupItem :value="dur" :id="`dur-${dur}`" class="sr-only" />
          <Label
            :for="`dur-${dur}`"
            :class="['flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all', selectedDuration === dur ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50']"
          >
            <span class="font-medium text-sm">{{ PLANS.premium.pricing[dur].label }}</span>
            <span v-if="PLANS.premium.pricing[dur].savings" class="text-xs text-accent">{{ PLANS.premium.pricing[dur].savings }}</span>
          </Label>
        </div>
      </RadioGroup>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Plan Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead class="text-center">Basic</TableHead>
              <TableHead class="text-center">Premium</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in comparisonFeatures" :key="row.feature">
              <TableCell class="font-medium">{{ row.feature }}</TableCell>
              <TableCell class="text-center">
                <Check v-if="row.basic === true" class="w-4 h-4 text-accent mx-auto" />
                <X v-else-if="row.basic === false" class="w-4 h-4 text-muted-foreground mx-auto" />
                <span v-else class="text-sm">{{ row.basic }}</span>
              </TableCell>
              <TableCell class="text-center">
                <Check v-if="row.premium === true" class="w-4 h-4 text-accent mx-auto" />
                <X v-else-if="row.premium === false" class="w-4 h-4 text-muted-foreground mx-auto" />
                <span v-else class="text-sm">{{ row.premium }}</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Button
      @click="handleSubscribe"
      :disabled="isLoading || currentPlan === selectedPlan"
      size="lg"
      class="w-full"
    >
      <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
      <template v-else>
        {{ isUpgrade ? "Upgrade Plan" : "Subscribe Now" }} — {{ currentPricing?.label }}
      </template>
    </Button>
  </div>
</template>
