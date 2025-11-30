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
import { LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        // Only redirect on actual sign in events, not on initial load
        if (event === 'SIGNED_IN' && session) {
          navigate("/dashboard");
        }
      }
    );

    // Check for existing session - verify it's valid
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Verify session is actually valid by checking user
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          setSession(session);
          navigate("/dashboard");
        } else {
          // Session is stale, sign out to clear it
          await supabase.auth.signOut();
          setSession(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid credentials", {
            description: "Please check your email and password.",
          });
        } else {
          toast.error("Login failed", {
            description: error.message,
          });
        }
        return;
      }

      toast.success("Welcome back!", {
        description: "You've successfully logged in.",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-xl relative z-10">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2 animate-in fade-in-0 zoom-in-50 duration-500">
            <LogIn className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  Signing in...
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;
