import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const userInfoSchema = z.object({
  name: z.string().trim().nonempty({ message: "Name is required" }).max(50, { message: "Name must be less than 50 characters" }),
  lastname: z.string().trim().nonempty({ message: "Last name is required" }).max(50, { message: "Last name must be less than 50 characters" }),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number" }),
});

const cardDetailsSchema = z.object({
  cardholderName: z.string().trim().nonempty({ message: "Cardholder name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  cardNumber: z.string().trim().regex(/^\d{13,19}$/, { message: "Please enter a valid card number (13-19 digits)" }),
  expiryDate: z.string().trim().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Please enter date in MM/YY format" }),
  cvv: z.string().trim().regex(/^\d{3,4}$/, { message: "Please enter a valid CVV (3-4 digits)" }),
});

const registrationSchema = userInfoSchema.merge(cardDetailsSchema);

type UserInfoData = z.infer<typeof userInfoSchema>;
type CardDetailsData = z.infer<typeof cardDetailsSchema>;
type RegistrationFormData = z.infer<typeof registrationSchema>;

export const RegistrationForm = () => {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(step === 'info' ? userInfoSchema : step === 'payment' ? cardDetailsSchema : registrationSchema),
  });

  const onUserInfoSubmit = async (data: UserInfoData) => {
    setUserInfo(data);
    setStep('payment');
  };

  const onPaymentSubmit = async (data: CardDetailsData) => {
    try {
      const completeData = { ...userInfo, ...data };
      
      // Create Mollie payment
      const { data: paymentData, error } = await supabase.functions.invoke('create-mollie-payment', {
        body: {
          amount: '10.00', // Payment amount in EUR
          description: 'Registration Payment',
          redirectUrl: `${window.location.origin}/payment-success`,
          userInfo: {
            name: userInfo?.name,
            lastname: userInfo?.lastname,
            phone: userInfo?.phone,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (paymentData?.checkoutUrl) {
        // Redirect to Mollie checkout
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment failed", {
        description: "Please try again later.",
      });
    }
  };

  const handleBack = () => {
    setStep('info');
  };

  return (
    <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2 animate-in fade-in-0 zoom-in-50 duration-500">
          <UserPlus className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          Create Account
        </CardTitle>
        <CardDescription className="text-base animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
          Fill in your details to get started
        </CardDescription>
      </CardHeader>
      
      <CardContent className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        {step === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in-50 fade-in-0 duration-500">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary animate-in zoom-in-50 duration-500 delay-200" />
            </div>
            <p className="text-lg font-medium text-foreground">Registration Complete!</p>
            <p className="text-sm text-muted-foreground text-center">Thank you for registering with us.</p>
          </div>
        ) : step === 'info' ? (
          <form onSubmit={handleSubmit(onUserInfoSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John"
                {...register("name")}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastname"
                type="text"
                placeholder="Doe"
                {...register("lastname")}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
              />
              {errors.lastname && (
                <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  {errors.lastname.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                {...register("phone")}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onPaymentSubmit)} className="space-y-5">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-4"
            >
              ← Back to info
            </button>

            <div className="space-y-2">
              <Label htmlFor="cardholderName" className="text-sm font-medium">
                Cardholder Name
              </Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="John Doe"
                {...register("cardholderName")}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
              />
              {errors.cardholderName && (
                <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  {errors.cardholderName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-sm font-medium">
                Card Number
              </Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                {...register("cardNumber")}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  {errors.cardNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-sm font-medium">
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  {...register("expiryDate")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                  maxLength={5}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-sm font-medium">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  {...register("cvv")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                    {errors.cvv.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
