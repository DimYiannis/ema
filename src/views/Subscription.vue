<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button.vue";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header.vue";
import PricingPlans from "@/components/PricingPlans.vue";
import { toast } from "vue-sonner";
import {
  CreditCard, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  ArrowLeft, Loader2, Shield, Power, PowerOff,
} from "lucide-vue-next";

interface PaymentMethod {
  id: string;
  mollie_customer_id: string | null;
  mollie_mandate_id: string | null;
  mollie_subscription_id: string | null;
  payment_method_type: string | null;
  card_last_four: string | null;
  card_expiry: string | null;
  is_active: boolean;
  trial_end_date: string | null;
  plan: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  subscription_status: string | null;
  created_at: string;
}

interface PaymentHistoryItem {
  id: string;
  mollie_payment_id: string;
  amount: string | null;
  currency: string | null;
  status: string;
  payment_type: string | null;
  description: string | null;
  paid_at: string | null;
  created_at: string;
}

const router = useRouter();
const route = useRoute();

const session = ref<Session | null>(null);
const paymentMethod = ref<PaymentMethod | null>(null);
const paymentHistory = ref<PaymentHistoryItem[]>([]);
const isLoading = ref(true);
const isToggling = ref(false);

let authSubscription: { unsubscribe: () => void } | null = null;

const fetchPaymentData = async (userId: string) => {
  const [pmRes, phRes] = await Promise.all([
    supabase.from("payment_methods").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("payment_history").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
  ]);
  if (!pmRes.error) paymentMethod.value = pmRes.data;
  if (!phRes.error) paymentHistory.value = phRes.data || [];
  isLoading.value = false;
};

const handleToggleSubscription = async () => {
  if (!session.value || !paymentMethod.value) return;
  isToggling.value = true;
  try {
    const action = paymentMethod.value.subscription_status === "active" ? "deactivate" : "activate";
    const { error } = await supabase.functions.invoke("toggle-subscription", {
      body: { userId: session.value.user.id, action },
    });
    if (error) throw error;
    paymentMethod.value = {
      ...paymentMethod.value,
      subscription_status: action === "activate" ? "active" : "inactive",
    };
    toast.success(action === "activate" ? "Subscription activated!" : "Subscription deactivated");
  } catch (err) {
    toast.error("Failed to toggle subscription");
  } finally {
    isToggling.value = false;
  }
};

onMounted(() => {
  const status = route.query.status as string;
  if (status === "paid" || status === "success") {
    toast.success("Subscription activated!", { description: "Your payment was successful." });
    router.replace({ query: {} });
  } else if (status === "failed" || status === "canceled") {
    toast.error("Payment not completed", { description: "Please try again." });
    router.replace({ query: {} });
  }

  const { data } = supabase.auth.onAuthStateChange((_event, s) => {
    session.value = s;
    if (!s) router.push("/login");
  });
  authSubscription = data.subscription;

  supabase.auth.getSession().then(({ data: { session: s } }) => {
    session.value = s;
    if (!s) {
      router.push("/login");
    } else {
      fetchPaymentData(s.user.id);
    }
  });
});

onUnmounted(() => authSubscription?.unsubscribe());

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />
    <main class="pt-4 pb-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4 mb-8">
          <button @click="router.push('/dashboard')" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft class="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        <div v-if="isLoading" class="flex items-center justify-center py-20">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <div v-else class="space-y-6">
          <div v-if="!paymentMethod" class="space-y-6"
            v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }"
          >
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <CreditCard class="w-5 h-5" />
                  No Payment Method
                </CardTitle>
                <CardDescription>Add a payment method to access premium features</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle class="h-4 w-4" />
                  <AlertDescription>You haven't set up a payment method yet. Choose a plan below to get started.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <PricingPlans
              v-if="session"
              :user-id="session.user.id"
              :user-email="session.user.email || ''"
              :user-name="session.user.user_metadata?.full_name || ''"
            />
          </div>

          <template v-else>
            <Card v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0 }">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <CreditCard class="w-5 h-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Your current payment details</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div class="flex items-center gap-3">
                    <Shield class="w-5 h-5 text-accent" />
                    <div>
                      <p class="font-medium">
                        {{ paymentMethod.payment_method_type || "Card" }}
                        <span v-if="paymentMethod.card_last_four">•••• {{ paymentMethod.card_last_four }}</span>
                      </p>
                      <p v-if="paymentMethod.card_expiry" class="text-sm text-muted-foreground">Expires {{ paymentMethod.card_expiry }}</p>
                    </div>
                  </div>
                  <Badge :variant="paymentMethod.is_active ? 'default' : 'secondary'">
                    {{ paymentMethod.is_active ? "Active" : "Inactive" }}
                  </Badge>
                </div>

                <div v-if="paymentMethod.trial_end_date" class="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar class="w-4 h-4" />
                  Trial ends: {{ formatDate(paymentMethod.trial_end_date) }}
                </div>
              </CardContent>
            </Card>

            <Card v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <component :is="paymentMethod.subscription_status === 'active' ? Power : PowerOff" class="w-5 h-5" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Your subscription is currently
                  <span :class="paymentMethod.subscription_status === 'active' ? 'text-accent font-medium' : 'text-muted-foreground font-medium'">
                    {{ paymentMethod.subscription_status === "active" ? "Active" : "Inactive" }}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div class="flex items-center gap-3">
                    <div :class="['w-10 h-10 rounded-full flex items-center justify-center', paymentMethod.subscription_status === 'active' ? 'bg-accent/20' : 'bg-muted']">
                      <CheckCircle v-if="paymentMethod.subscription_status === 'active'" class="w-5 h-5 text-accent" />
                      <XCircle v-else class="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p class="font-medium">{{ paymentMethod.subscription_status === "active" ? "Subscription Active" : "Subscription Inactive" }}</p>
                      <p class="text-sm text-muted-foreground">
                        {{ paymentMethod.subscription_status === "active" ? "You have full access to all features" : "Reactivate to regain access" }}
                      </p>
                    </div>
                  </div>
                  <Badge :class="paymentMethod.subscription_status === 'active' ? 'bg-accent/20 text-accent border-accent/30' : 'bg-muted text-muted-foreground'">
                    {{ paymentMethod.subscription_status === "active" ? "Active" : "Inactive" }}
                  </Badge>
                </div>

                <Button
                  :variant="paymentMethod.subscription_status === 'active' ? 'destructive' : 'default'"
                  @click="handleToggleSubscription"
                  :disabled="isToggling"
                  class="w-full"
                >
                  <Loader2 v-if="isToggling" class="w-4 h-4 mr-2 animate-spin" />
                  <template v-else>
                    <PowerOff v-if="paymentMethod.subscription_status === 'active'" class="w-4 h-4 mr-2" />
                    <Power v-else class="w-4 h-4 mr-2" />
                    {{ paymentMethod.subscription_status === "active" ? "Deactivate Subscription" : "Activate Subscription" }}
                  </template>
                </Button>

                <p class="text-xs text-center text-muted-foreground">
                  {{ paymentMethod.subscription_status === "active"
                    ? "Deactivating will pause your subscription. You can reactivate anytime."
                    : "Activate your subscription to regain access to all features." }}
                </p>
              </CardContent>
            </Card>

            <Card v-if="paymentHistory.length > 0" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Clock class="w-5 h-5" />
                  Payment History
                </CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <div
                    v-for="payment in paymentHistory"
                    :key="payment.id"
                    class="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div class="flex items-center gap-3">
                      <div :class="['w-10 h-10 rounded-full flex items-center justify-center', payment.status === 'paid' ? 'bg-accent/20' : 'bg-destructive/20']">
                        <CheckCircle v-if="payment.status === 'paid'" class="w-5 h-5 text-accent" />
                        <XCircle v-else class="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p class="font-medium text-sm">{{ payment.description || payment.payment_type || "Payment" }}</p>
                        <p class="text-xs text-muted-foreground">
                          {{ new Date(payment.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold">{{ payment.currency?.toUpperCase() }} {{ payment.amount }}</p>
                      <Badge :variant="payment.status === 'paid' ? 'default' : 'destructive'" class="text-xs">{{ payment.status }}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Calendar class="w-5 h-5" />
                  Pricing
                </CardTitle>
                <CardDescription>What you'll be charged after your trial</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div class="flex items-baseline justify-between">
                    <div>
                      <p class="text-3xl font-bold text-foreground">€9.99</p>
                      <p class="text-sm text-muted-foreground">per month</p>
                    </div>
                    <Badge variant="secondary">Standard Plan</Badge>
                  </div>
                  <Separator />
                  <ul class="space-y-2 text-sm">
                    <li v-for="feature in ['Unlimited voice interactions', 'Real-time navigation assistance', 'Daily news briefings', 'Family notifications', 'Priority customer support']" :key="feature" class="flex items-center gap-2">
                      <CheckCircle class="w-4 h-4 text-accent" />
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>
