import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import PaymentSetup from "@/components/PaymentSetup";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }).max(50, { message: "First name must be less than 50 characters" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }).max(50, { message: "Last name must be less than 50 characters" }),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number (e.g., +31636345484)" }),
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        // Only redirect if not on payment step
        if (session && !showPaymentStep) {
          navigate("/");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && !showPaymentStep) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, showPaymentStep]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Account exists", {
            description: "This email is already registered. Please login instead.",
          });
        } else {
          toast.error("Signup failed", {
            description: error.message,
          });
        }
        return;
      }

      toast.success("Account created!", {
        description: "Now let's set up your payment method for the trial.",
      });
      
      // Show payment setup step
      setShowPaymentStep(true);
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    }
  };

  const handlePaymentComplete = () => {
    toast.success("Payment method added!", {
      description: "Your free trial has started. Enjoy!",
    });
    navigate("/dashboard");
  };

  const handleSkipPayment = () => {
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      {showPaymentStep ? (
        <PaymentSetup onComplete={handlePaymentComplete} onSkip={handleSkipPayment} />
      ) : (
        <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-xl relative z-10">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2 animate-in fade-in-0 zoom-in-50 duration-500">
            <UserPlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            Create Account
          </CardTitle>
          <CardDescription className="text-base animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
            Sign up to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+31636345484"
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

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  {errors.password.message}
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
                  Creating account...
                </span>
              ) : (
                <span>Sign Up</span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      )}
    </main>
  );
};

export default Register;
