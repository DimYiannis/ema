import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingPlansProps {
  userId: string;
  userEmail: string;
  userName: string;
  currentPlan?: string | null;
  currentDuration?: string | null;
  isUpgrade?: boolean;
  onSubscriptionCreated?: () => void;
}

const PLANS = {
  basic: {
    name: "Basic",
    icon: Zap,
    description: "Perfect for getting started",
    minutes: 300,
    features: [
      "AI Voice Assistant",
      "300 minutes of voice calls/month",
      "Standard support",
      "Basic analytics",
    ],
    availableDurations: ["monthly"] as PlanDuration[],
    pricing: {
      monthly: { amount: "9.99", label: "€9.99/month" },
    },
  },
  premium: {
    name: "Premium",
    icon: Sparkles,
    description: "For power users who need more",
    minutes: 1000,
    features: [
      "Everything in Basic",
      "1000 minutes of voice calls/month",
      "Priority support",
      "Advanced analytics",
      "Unused minutes carryover (annual)",
      "Custom voice options",
    ],
    availableDurations: ["monthly", "6-month", "annual"] as PlanDuration[],
    pricing: {
      monthly: { amount: "19.99", label: "€19.99/month" },
      "6-month": { amount: "99.99", label: "€99.99/6 months", savings: "Save €20" },
      annual: { amount: "179.99", label: "€179.99/year", savings: "Save €60" },
    },
  },
};

const TRIAL_DAYS = 7;

type PlanType = "basic" | "premium";
type PlanDuration = "monthly" | "6-month" | "annual";

const getDurationsForPlan = (planType: PlanType): PlanDuration[] => {
  return PLANS[planType].availableDurations;
};

const PricingPlans = ({ 
  userId, 
  userEmail, 
  userName, 
  currentPlan,
  currentDuration,
  isUpgrade = false,
  onSubscriptionCreated 
}: PricingPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    (currentPlan as PlanType) || "basic"
  );
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>(
    (currentDuration as PlanDuration) || "monthly"
  );
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentPlan = isUpgrade && selectedPlan === currentPlan && selectedDuration === currentDuration;
  const availableDurations = getDurationsForPlan(selectedPlan);

  // Reset duration when switching plans if current duration isn't available
  const handlePlanSelect = (planKey: PlanType) => {
    setSelectedPlan(planKey);
    const planDurations = getDurationsForPlan(planKey);
    if (!planDurations.includes(selectedDuration)) {
      setSelectedDuration("monthly");
    }
  };

  const handleSubscribe = async () => {
    if (isCurrentPlan) {
      toast.info("This is your current plan");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isUpgrade ? "update-mollie-subscription" : "create-mollie-subscription";
      const body = isUpgrade 
        ? {
            userId,
            newPlanType: selectedPlan,
            newPlanDuration: selectedDuration,
          }
        : {
            userId,
            userName,
            userEmail,
            planType: selectedPlan,
            planDuration: selectedDuration,
          };

      toast.info(isUpgrade ? "Updating your plan..." : "Setting up your subscription...", {
        description: isUpgrade ? "Please wait while we update your subscription" : "You'll be redirected to complete payment setup",
      });

      const { data, error } = await supabase.functions.invoke(endpoint, { body });

      if (error) throw error;

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.success || data.subscriptionId) {
      toast.success(isUpgrade ? "Plan updated!" : "Subscription created!", {
          description: isUpgrade 
            ? `Your plan has been changed to ${selectedPlan} (${selectedDuration}).`
            : `Your ${selectedPlan} plan is now active with a ${TRIAL_DAYS}-day free trial.`,
        });
        onSubscriptionCreated?.();
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(isUpgrade ? "Failed to update plan" : "Failed to create subscription", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Duration Selection - Only show if Premium is selected */}
      {selectedPlan === "premium" && (
        <div className="flex justify-center">
          <RadioGroup
            value={selectedDuration}
            onValueChange={(v) => setSelectedDuration(v as PlanDuration)}
            className="flex gap-2 p-1 bg-muted rounded-lg"
          >
            {availableDurations.map((duration) => (
              <div key={duration}>
                <RadioGroupItem value={duration} id={duration} className="sr-only peer" />
                <Label
                  htmlFor={duration}
                  className="px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-all peer-data-[state=checked]:bg-background peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-foreground text-muted-foreground hover:text-foreground"
                >
                  {duration === "monthly" ? "Monthly" : duration === "6-month" ? "6 Months" : "Annual"}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {(Object.entries(PLANS) as [PlanType, typeof PLANS.basic][]).map(([planKey, plan], index) => {
          // Use the selected duration for premium, always monthly for basic
          const displayDuration = planKey === "basic" ? "monthly" : selectedDuration;
          const pricing = plan.pricing[displayDuration as keyof typeof plan.pricing];
          const isSelected = selectedPlan === planKey;
          const isCurrentUserPlan = isUpgrade && planKey === currentPlan && selectedDuration === currentDuration;
          const Icon = plan.icon;

          return (
            <motion.div
              key={planKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handlePlanSelect(planKey)}
              >
                {isCurrentUserPlan ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                    Current Plan
                  </Badge>
                ) : planKey === "premium" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <p className="text-sm font-medium text-primary mt-1">{plan.minutes} minutes/month</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center">
                    {pricing && (
                      <>
                        <div className="text-3xl font-bold text-foreground">
                          €{pricing.amount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {displayDuration === "monthly"
                            ? "per month"
                            : displayDuration === "6-month"
                            ? "every 6 months"
                            : "per year"}
                        </div>
                        {"savings" in pricing && (pricing as { savings?: string }).savings && (
                          <Badge variant="secondary" className="mt-2 bg-accent/20 text-accent">
                            {(pricing as { savings?: string }).savings}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Selection Indicator */}
                  <div
                    className={`w-full h-1 rounded-full transition-colors ${
                      isSelected ? "bg-primary" : "bg-muted"
                    }`}
                  />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Trial Info & Subscribe Button */}
      <div className="text-center space-y-4">
        {!isUpgrade && (
          <p className="text-sm text-muted-foreground">
            Start with a <span className="font-medium text-foreground">{TRIAL_DAYS}-day free trial</span>.
            Cancel anytime before it ends and you won't be charged.
          </p>
        )}

        {isUpgrade && isCurrentPlan && (
          <p className="text-sm text-muted-foreground">
            This is your current plan. Select a different plan or duration to make changes.
          </p>
        )}

        <Button
          size="lg"
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan}
          className="px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isUpgrade ? "Updating..." : "Setting up..."}
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : isUpgrade ? (
            `Change to ${PLANS[selectedPlan].name} Plan`
          ) : (
            `Start Free Trial - ${PLANS[selectedPlan].name} Plan`
          )}
        </Button>

        {!isUpgrade && (
          <p className="text-xs text-muted-foreground">
            You'll be redirected to securely add your payment method
          </p>
        )}
      </div>
    </div>
  );
};

export default PricingPlans;
