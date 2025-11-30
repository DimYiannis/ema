import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CreditCard, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const PaymentSetup = ({ onComplete, onSkip }: PaymentSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupPayment = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const name = profile 
        ? `${profile.first_name} ${profile.last_name}`.trim() 
        : user.email;

      // Create Mollie customer
      const { data: customerData, error: customerError } = await supabase.functions.invoke(
        'create-mollie-customer',
        {
          body: {
            email: user.email,
            name: name,
          },
        }
      );

      if (customerError) {
        throw customerError;
      }

      // Create payment mandate (card verification)
      const { data: mandateData, error: mandateError } = await supabase.functions.invoke(
        'create-payment-mandate',
        {
          body: {
            customerId: customerData.customerId,
            redirectUrl: `${window.location.origin}/dashboard`,
          },
        }
      );

      if (mandateError) {
        throw mandateError;
      }

      // Redirect to Mollie checkout
      if (mandateData.checkoutUrl) {
        window.location.href = mandateData.checkoutUrl;
      }
    } catch (error) {
      console.error('Payment setup error:', error);
      toast.error('Payment setup failed', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
          <CreditCard className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-3xl font-bold">Add Payment Method</CardTitle>
        <CardDescription className="text-base">
          Start your 14-day free trial. No charge today.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Shield className="w-4 h-4 text-accent" />
            What happens next:
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground ml-6">
            <li>• We'll verify your card with a €0.01 charge (refunded immediately)</li>
            <li>• Your 14-day free trial starts now</li>
            <li>• You'll be charged after your trial ends</li>
            <li>• Cancel anytime during the trial period</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleSetupPayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg font-medium h-12 text-base"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up payment...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Add Payment Method
              </span>
            )}
          </Button>

          {onSkip && (
            <Button
              onClick={onSkip}
              variant="ghost"
              disabled={isLoading}
              className="w-full"
            >
              Skip for now
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment processing by Mollie. Your card details are encrypted and never stored on our servers.
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentSetup;