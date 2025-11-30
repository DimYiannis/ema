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
  onSubscriptionCreated?: () => void;
}

const PLANS = {
  basic: {
    name: "Basic",
    icon: Zap,
    description: "Perfect for getting started",
    features: [
      "AI Voice Assistant",
      "Up to 100 conversations/month",
      "Standard support",
      "Basic analytics",
    ],
    pricing: {
      monthly: { amount: "9.99", label: "€9.99/month" },
      "6-month": { amount: "49.99", label: "€49.99/6 months", savings: "Save €10" },
      annual: { amount: "89.99", label: "€89.99/year", savings: "Save €30" },
    },
  },
  premium: {
    name: "Premium",
    icon: Sparkles,
    description: "For power users who need more",
    features: [
      "Everything in Basic",
      "Unlimited conversations",
      "Priority support",
      "Advanced analytics",
      "Custom voice options",
      "API access",
    ],
    pricing: {
      monthly: { amount: "19.99", label: "€19.99/month" },
      "6-month": { amount: "99.99", label: "€99.99/6 months", savings: "Save €20" },
      annual: { amount: "179.99", label: "€179.99/year", savings: "Save €60" },
    },
  },
};

type PlanType = "basic" | "premium";
type PlanDuration = "monthly" | "6-month" | "annual";

const PricingPlans = ({ userId, userEmail, userName, onSubscriptionCreated }: PricingPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("basic");
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      toast.info("Setting up your subscription...", {
        description: "You'll be redirected to complete payment setup",
      });

      const { data, error } = await supabase.functions.invoke("create-mollie-subscription", {
        body: {
          userId,
          userName,
          userEmail,
          planType: selectedPlan,
          planDuration: selectedDuration,
        },
      });

      if (error) throw error;

      if (data.paymentUrl) {
        // Redirect to Mollie checkout for card verification
        window.location.href = data.paymentUrl;
      } else if (data.subscriptionId) {
        toast.success("Subscription created!", {
          description: `Your ${selectedPlan} plan is now active with a 14-day free trial.`,
        });
        onSubscriptionCreated?.();
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to create subscription", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <div className="flex justify-center">
        <RadioGroup
          value={selectedDuration}
          onValueChange={(v) => setSelectedDuration(v as PlanDuration)}
          className="flex gap-2 p-1 bg-muted rounded-lg"
        >
          {(["monthly", "6-month", "annual"] as PlanDuration[]).map((duration) => (
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

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {(Object.entries(PLANS) as [PlanType, typeof PLANS.basic][]).map(([planKey, plan], index) => {
          const pricing = plan.pricing[selectedDuration];
          const isSelected = selectedPlan === planKey;
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
                onClick={() => setSelectedPlan(planKey)}
              >
                {planKey === "premium" && (
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
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">
                      €{pricing.amount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedDuration === "monthly"
                        ? "per month"
                        : selectedDuration === "6-month"
                        ? "every 6 months"
                        : "per year"}
                    </div>
                    {"savings" in pricing && pricing.savings && (
                      <Badge variant="secondary" className="mt-2 bg-accent/20 text-accent">
                        {pricing.savings}
                      </Badge>
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
        <p className="text-sm text-muted-foreground">
          Start with a <span className="font-medium text-foreground">14-day free trial</span>.
          Cancel anytime before it ends and you won't be charged.
        </p>

        <Button
          size="lg"
          onClick={handleSubscribe}
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Start Free Trial - {PLANS[selectedPlan].name} Plan
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          You'll be redirected to securely add your payment method
        </p>
      </div>
    </div>
  );
};

export default PricingPlans;
