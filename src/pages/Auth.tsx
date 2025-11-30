import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type AuthFormData = z.infer<typeof authSchema>;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          navigate("/");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isLogin) {
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
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: redirectUrl,
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
          description: "You can now log in with your credentials.",
        });
        setIsLogin(true);
        reset();
      }
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
            {isLogin ? (
              <LogIn className="w-6 h-6 text-primary-foreground" />
            ) : (
              <UserPlus className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-base animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
            {isLogin ? "Sign in to your account" : "Sign up to get started"}
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
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span>{isLogin ? "Sign In" : "Sign Up"}</span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                reset();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <span className="text-primary font-medium">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="text-primary font-medium">Sign in</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
