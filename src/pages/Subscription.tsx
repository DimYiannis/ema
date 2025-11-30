import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  Shield
} from "lucide-react";
import Header from "@/components/Header";
import PricingPlans from "@/components/PricingPlans";
import { motion } from "framer-motion";

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

const Subscription = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/login");
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchPaymentMethod();
      fetchPaymentHistory();
    }
  }, [session]);

  const fetchPaymentMethod = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', session?.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching payment method:', error);
        toast.error('Failed to load subscription info');
        return;
      }

      setPaymentMethod(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching payment history:', error);
        return;
      }

      setPaymentHistory(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getTrialStatus = () => {
    if (!paymentMethod?.trial_end_date) {
      return { status: 'no_trial', daysLeft: 0, isActive: false };
    }

    const trialEnd = new Date(paymentMethod.trial_end_date);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      status: daysLeft > 0 ? 'active' : 'expired',
      daysLeft: Math.max(0, daysLeft),
      isActive: daysLeft > 0,
      endDate: trialEnd
    };
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features after your trial ends.')) {
      return;
    }

    setIsCanceling(true);
    try {
      // Update payment method to inactive
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('user_id', session?.user.id);

      if (error) throw error;

      toast.success('Subscription canceled', {
        description: 'You will retain access until your trial ends.',
      });

      fetchPaymentMethod();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    setIsLoading(true);
    try {
      if (!session?.user) {
        toast.error('Please log in first');
        navigate('/login');
        return;
      }

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .maybeSingle();

      const name = profile 
        ? `${profile.first_name} ${profile.last_name}`.trim() 
        : session.user.email;

      toast.info('Redirecting to payment page...', {
        description: 'You will be redirected to Mollie secure checkout',
      });

      // Create Mollie customer
      const { data: customerData, error: customerError } = await supabase.functions.invoke(
        'create-mollie-customer',
        {
          body: {
            email: session.user.email,
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
            redirectUrl: `${window.location.origin}/subscription`,
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
      toast.error('Failed to setup payment', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
      setIsLoading(false);
    }
  };

  const trialStatus = getTrialStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-2">Subscription Management</h1>
            <p className="text-muted-foreground">Manage your subscription and payment settings</p>
          </motion.div>

          {/* Trial Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Trial Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!paymentMethod ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No payment method on file. Add a payment method to start your free trial.
                    </AlertDescription>
                  </Alert>
                ) : trialStatus.isActive ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Trial Period</p>
                        <p className="text-2xl font-bold text-foreground">
                          {trialStatus.daysLeft} {trialStatus.daysLeft === 1 ? 'day' : 'days'} remaining
                        </p>
                      </div>
                      <Badge className="bg-accent/20 text-accent border-accent/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active Trial
                      </Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Trial Started</p>
                        <p className="font-medium">
                          {new Date(paymentMethod.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Trial Ends</p>
                        <p className="font-medium">
                          {trialStatus.endDate?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {trialStatus.daysLeft <= 3 && (
                      <Alert className="border-amber-500/50 bg-amber-500/10">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                          Your trial is ending soon. Your card will be charged automatically unless you cancel.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Trial Status</p>
                        <p className="text-2xl font-bold text-foreground">Expired</p>
                      </div>
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Trial Ended
                      </Badge>
                    </div>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your trial has ended. Subscribe now to continue using premium features.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Plan Selection - Show when no payment method */}
          {!paymentMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Plan</CardTitle>
                  <CardDescription>Select a plan to start your 14-day free trial</CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingPlans
                    userId={session?.user.id || ""}
                    userEmail={session?.user.email || ""}
                    userName={session?.user.user_metadata?.first_name 
                      ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ""}`.trim()
                      : session?.user.email || ""}
                    onSubscriptionCreated={() => {
                      fetchPaymentMethod();
                      fetchPaymentHistory();
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payment Method Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Manage your payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethod ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {paymentMethod.card_last_four 
                              ? `•••• ${paymentMethod.card_last_four}`
                              : 'No card verified yet'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {paymentMethod.card_last_four 
                              ? `${paymentMethod.payment_method_type || 'Credit Card'}${paymentMethod.card_expiry ? ` • Expires ${paymentMethod.card_expiry}` : ''}`
                              : 'Complete card verification to activate'}
                          </p>
                          {paymentMethod.plan && (
                            <p className="text-sm font-medium text-primary mt-1">
                              Plan: {paymentMethod.plan}
                            </p>
                          )}
                        </div>
                      </div>
                      {paymentMethod.card_last_four && paymentMethod.mollie_mandate_id ? (
                        paymentMethod.is_active ? (
                          <Badge className="bg-accent/20 text-accent border-accent/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Inactive
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    
                    {paymentMethod.mollie_subscription_id && (
                      <div className="p-4 border rounded-lg bg-background/50 space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Subscription Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`ml-2 font-medium ${
                              paymentMethod.subscription_status === 'active' 
                                ? 'text-accent' 
                                : 'text-muted-foreground'
                            }`}>
                              {paymentMethod.subscription_status || 'inactive'}
                            </span>
                          </div>
                          {paymentMethod.subscription_start && (
                            <div>
                              <span className="text-muted-foreground">Started:</span>
                              <span className="ml-2 font-medium">
                                {new Date(paymentMethod.subscription_start).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {paymentMethod.subscription_end && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Ends:</span>
                              <span className="ml-2 font-medium">
                                {new Date(paymentMethod.subscription_end).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Secured by Mollie payment processing</span>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Actions */}
          {paymentMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Actions</CardTitle>
                  <CardDescription>Manage your subscription settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paymentMethod.is_active ? (
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                      className="w-full"
                    >
                      {isCanceling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Canceling...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAddPaymentMethod}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reactivate Subscription
                        </>
                      )}
                    </Button>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    You can cancel anytime. Access continues until trial end.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Payment History
                  </CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            payment.status === 'paid' 
                              ? 'bg-accent/20' 
                              : 'bg-destructive/20'
                          }`}>
                            {payment.status === 'paid' ? (
                              <CheckCircle className="w-5 h-5 text-accent" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {payment.description || payment.payment_type || 'Payment'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {payment.currency?.toUpperCase()} {payment.amount}
                          </p>
                          <Badge 
                            variant={payment.status === 'paid' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Pricing Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Pricing
                </CardTitle>
                <CardDescription>What you'll be charged after your trial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-3xl font-bold text-foreground">€9.99</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                    <Badge variant="secondary">Standard Plan</Badge>
                  </div>
                  <Separator />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Unlimited voice interactions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Real-time navigation assistance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Daily news briefings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Family notifications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Priority customer support</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Subscription;