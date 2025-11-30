import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Phone, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface UsageCardProps {
  minutesUsed: number;
  minutesLimit: number;
  minutesCarriedOver?: number;
  billingPeriodEnd?: string;
  plan?: string;
}

const UsageCard = ({ 
  minutesUsed, 
  minutesLimit, 
  minutesCarriedOver = 0,
  billingPeriodEnd,
  plan 
}: UsageCardProps) => {
  const totalAvailable = minutesLimit + minutesCarriedOver;
  const minutesRemaining = Math.max(0, totalAvailable - minutesUsed);
  const usagePercentage = Math.round((minutesUsed / totalAvailable) * 100);
  
  const getUsageColor = () => {
    if (usagePercentage >= 90) return "text-destructive";
    if (usagePercentage >= 80) return "text-amber-500";
    return "text-accent";
  };

  const getProgressColor = () => {
    if (usagePercentage >= 90) return "bg-destructive";
    if (usagePercentage >= 80) return "bg-amber-500";
    return "bg-accent";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Voice Minutes Usage
            </div>
            {plan && (
              <Badge variant="outline" className="capitalize">
                {plan} Plan
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your monthly voice call allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Usage Display */}
          <div className="text-center space-y-2">
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-4xl font-bold ${getUsageColor()}`}>
                {minutesUsed}
              </span>
              <span className="text-muted-foreground text-lg">
                / {totalAvailable} min
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {minutesRemaining} minutes remaining
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usage</span>
              <span className={`font-medium ${getUsageColor()}`}>
                {usagePercentage}%
              </span>
            </div>
            <div className="relative">
              <Progress value={usagePercentage} className="h-3" />
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Warning for high usage */}
          {usagePercentage >= 80 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {usagePercentage >= 100 
                  ? "You've reached your monthly limit. Upgrade to continue."
                  : `You've used ${usagePercentage}% of your monthly minutes.`}
              </p>
            </div>
          )}

          {/* Carryover Info */}
          {minutesCarriedOver > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
              <TrendingUp className="w-5 h-5 text-accent shrink-0" />
              <p className="text-sm text-accent">
                {minutesCarriedOver} bonus minutes carried over from last month!
              </p>
            </div>
          )}

          {/* Billing Period */}
          {billingPeriodEnd && (
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Resets on</span>
                <span className="font-medium">
                  {new Date(billingPeriodEnd).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UsageCard;
