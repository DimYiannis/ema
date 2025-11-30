import HeroScene from "@/components/3d/HeroScene";
import AIGridBackground from "@/components/3d/AIGridBackground";
import FloatingParticles from "@/components/FloatingParticles";
import { Phone, MessageSquare, MapPin, Bell } from "lucide-react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDown,
  Navigation,
  Calendar,
  Footprints,
  Brain,
  Shield,
  Newspaper,
  Bus,
  Heart,
  Users,
  ChevronRight,
  MessageCircle,
  CheckCircle,
  LogOut,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-phone-call.png";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out", {
      description: "You've been successfully logged out.",
    });
  };

  const scrollToContent = () => {
    const contentSection = document.getElementById("content");
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Header */}
      <Header />
      
      <main className="relative w-full overflow-x-hidden bg-background">
        {/* Hero Cover Section with 3D Orb */}
        <section className="h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/10 to-background"></div>
        <AIGridBackground />
        <HeroScene />

        <div className="relative z-20 text-center text-foreground px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-sans font-light mb-6">ema.</h1>
            <p className="opacity-60 text-lg md:text-xl tracking-widest font-sans font-normal mb-12">
              Real-Time Voice Intelligence
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {session ? (
                <>
                  <Button size="lg" className="rounded-full px-8" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="rounded-full px-8" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8" onClick={scrollToContent}>
                    Learn More
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          onClick={scrollToContent}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-20"
        >
          <span className="text-xs uppercase tracking-ultra-wide font-sans font-normal">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </section>

      {/* Main Content Section - Info Page Content */}
      <div id="content">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex items-center justify-center px-4 pb-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/20 to-background"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(140,120,100,0.1),transparent_50%)]"></div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight drop-shadow-lg">
                Call and Connect with Your AI Companion
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed drop-shadow-md">
                Plan trips, get directions, and stay connected — all by speaking naturally.
              </p>
              <Button
                size="lg"
                className="text-lg px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/dashboard")}
              >
                Try It Today
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center"
            >
              <div className="relative w-full aspect-square max-w-lg">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"></div>
                <img
                  src={heroImage}
                  alt="Older adults using AI voice companion for navigation assistance"
                  className="relative rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] transition-all duration-500 hover:scale-105 border border-border/50 object-cover w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Problem Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-24 px-4 bg-card"
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16"
            >
              Travel Shouldn't Be Hard at Any Age
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
                    <Phone className="w-10 h-10 text-primary drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Digital Barriers</h3>
                  <p className="text-lg text-muted-foreground">Complex apps are confusing and hard to navigate</p>
                </CardContent>
              </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
              <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
                    <Footprints className="w-10 h-10 text-primary drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Physical Barriers</h3>
                  <p className="text-lg text-muted-foreground">Walking, boarding, and navigation is challenging</p>
                </CardContent>
              </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
              <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
                    <Calendar className="w-10 h-10 text-primary drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Social Barriers</h3>
                  <p className="text-lg text-muted-foreground">
                    Missing errands and social events due to travel difficulty
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Solution Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-24 px-4 bg-background"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-2 bg-accent/30 rounded-3xl blur-xl"></div>
              <div className="relative bg-accent/50 rounded-3xl p-12 space-y-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-border/50">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Phone className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <ChevronRight className="w-8 h-8 text-muted-foreground" />
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Brain className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <ChevronRight className="w-8 h-8 text-muted-foreground" />
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Navigation className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <p className="text-center text-xl font-semibold text-foreground drop-shadow-sm">
                  Phone/App → AI → Spoken Directions
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Simple Voice-Powered Navigation</h2>
              <ul className="space-y-4 text-lg text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span>Speak naturally to get route guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span>Step-by-step spoken directions tailored to your pace</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <span>Ask follow-up questions anytime during your journey</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        {/* MVP Features */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          id="features" 
          className="py-24 px-4 bg-card scroll-mt-20"
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16"
            >
              What You Can Do Right Now
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
              <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
                    <Bus className="w-10 h-10 text-primary drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Route Planning</h3>
                  <p className="text-lg text-muted-foreground">Public transport and ride options tailored for you</p>
                </CardContent>
              </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
              <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
                    <Navigation className="w-10 h-10 text-primary drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Spoken Guidance</h3>
                  <p className="text-lg text-muted-foreground">Clear, step-by-step voice instructions</p>
                </CardContent>
              </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
              <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="w-10 h-10 text-primary drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Family Verification</h3>
                  <p className="text-lg text-muted-foreground">Optional caregiver confirmation for peace of mind</p>
                </CardContent>
              </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
              <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
                    <Newspaper className="w-10 h-10 text-primary drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">Daily News Briefings</h3>
                  <p className="text-lg text-muted-foreground">Stay informed with personalized news updates</p>
                </CardContent>
              </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Future Features */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-24 px-4 bg-background"
        >
          <div className="max-w-6xl mx-auto text-center space-y-12">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              Coming Soon
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 bg-card p-6 rounded-lg border shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                <Bell className="w-10 h-10 text-primary drop-shadow-md" />
                <span className="text-lg font-medium text-foreground">Personalized Reminders</span>
              </div>
              <div className="flex items-center gap-4 bg-card p-6 rounded-lg border shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                <Bus className="w-10 h-10 text-primary drop-shadow-md" />
                <span className="text-lg font-medium text-foreground">Expanded Transport Options</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Who It's For */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-24 px-4 bg-muted/30 relative overflow-hidden"
        >
          {/* Background gradient and particles */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(140,188,140,0.08),transparent_70%)]"></div>
          <FloatingParticles />
          
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Section Header */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Who It's For
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Empowering independence, safety, and confidence for every user
              </p>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Older Adults Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 h-full relative overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardContent className="pt-8 space-y-6 relative z-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <Heart className="w-10 h-10 text-primary drop-shadow-md" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">For Older Adults</h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      Maintain your independence with simple voice interactions. Travel confidently knowing you have a
                      companion guiding you every step of the way.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Families & Caregivers Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 h-full relative overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardContent className="pt-8 space-y-6 relative z-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <Users className="w-10 h-10 text-primary drop-shadow-md" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">For Families & Caregivers</h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      Peace of mind knowing your loved ones can travel safely and independently, with optional notifications
                      to keep you informed.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Visually Impaired Users Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="border-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 h-full relative overflow-hidden bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                  <CardContent className="pt-8 space-y-6 relative z-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <Eye className="w-10 h-10 text-primary drop-shadow-md" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">For Visually Impaired Users</h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      Voice-first navigation makes travel truly accessible. No screens required — just speak naturally and 
                      receive clear, step-by-step spoken guidance.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Value Proposition */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-24 px-4 bg-background"
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16"
            >
              Why Choose Our Voice Companion
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
              <Card className="border-2 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">For Older Adults</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0 drop-shadow-md" />
                      <span>Easy travel planning without complex apps</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0 drop-shadow-md" />
                      <span>Maintain independence and confidence</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0 drop-shadow-md" />
                      <span>Simple voice interaction - just speak naturally</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
              <Card className="border-2 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.18)] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                <CardContent className="pt-8 space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">For Families & Caregivers</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0 drop-shadow-md" />
                      <span>Peace of mind knowing they travel safely</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0 drop-shadow-md" />
                      <span>Reduced stress and fewer emergency calls</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0 drop-shadow-md" />
                      <span>Easy setup with optional notifications</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          id="how-it-works" 
          className="py-24 px-4 bg-card scroll-mt-20 relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(140,188,140,0.08),transparent_70%)]"></div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-center text-foreground mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto"
            >
              Four simple steps to start your journey with confidence
            </motion.p>
            
            <div className="space-y-6">
              {[
                { 
                  number: 1, 
                  icon: Phone, 
                  title: "Call or open the app on your phone",
                  description: "Tap or answer call—no setup needed. Just pick up and start."
                },
                { 
                  number: 2, 
                  icon: MessageSquare, 
                  title: "Ask where you want to go in your own words",
                  description: "Speak naturally and the voice assistant listens and understands."
                },
                { 
                  number: 3, 
                  icon: MapPin, 
                  title: "Receive clear, spoken directions step by step",
                  description: "Voice output gives you turn-by-turn instructions as you travel."
                },
                { 
                  number: 4, 
                  icon: Bell, 
                  title: "Optional: Family or caregiver gets notified",
                  description: "Optional alert to family for added safety and peace of mind."
                },
              ].map((step, index) => {
                const IconComponent = step.icon;
                return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onHoverStart={() => setHoveredStep(index)}
                  onHoverEnd={() => setHoveredStep(null)}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="group relative"
                >
                  <div className="flex items-center gap-6 bg-background/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl border-2 border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(140,188,140,0.2)] hover:border-accent/30 transition-all duration-500">
                    {/* Step Number - No box, just the number */}
                    <div className="w-12 md:w-16 flex items-center justify-center flex-shrink-0">
                      <span className="text-5xl md:text-6xl font-bold text-primary drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                        {step.number}
                      </span>
                    </div>
                    
                    {/* 2D Icon */}
                    <div className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border-2 border-primary/30 group-hover:border-accent/50 transition-all duration-300">
                      <IconComponent 
                        className="w-10 h-10 md:w-12 md:h-12 text-primary group-hover:text-accent transition-colors duration-300" 
                        strokeWidth={2}
                      />
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Connecting line to next step */}
                  {index < 3 && (
                    <div className="absolute left-10 md:left-12 top-full w-0.5 h-6 bg-gradient-to-b from-border to-transparent" />
                  )}
                 </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Free Trial CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-32 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-background relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(74,163,118,0.15),transparent_70%)]"></div>
          <FloatingParticles />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Why Not Give Our Free Trial a Try?
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Witness the impact firsthand. Experience how simple voice commands can transform your daily travel and independence.
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-6"
              >
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 h-auto rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 group"
                  onClick={() => navigate(session ? "/dashboard" : "/register")}
                >
                  {session ? "Go to Dashboard" : "Start Your Free Trial"}
                  <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-sm text-muted-foreground/70 pt-4"
              >
                No credit card required • Free to start • Cancel anytime
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-12 px-4 bg-card border-t"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Contact</h3>
              <p className="text-muted-foreground">info@voicecompanion.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Legal</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Support</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Accessibility Statement</p>
                <p>FAQ</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Follow Us</h3>
              <p className="text-muted-foreground">Social links coming soon</p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>© 2024 Voice Companion. All rights reserved.</p>
          </div>
        </motion.footer>
      </div>
    </main>
    </>
  );
}
