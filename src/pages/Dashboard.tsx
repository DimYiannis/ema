import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceOrb } from "@/components/VoiceOrb";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useElevenLabs } from "@/hooks/useElevenLabs";
import AIGridBackground from "@/components/3d/AIGridBackground";
import { WebhookConfig } from "@/components/WebhookConfig";
import { sendAudioToWebhook } from "@/utils/audioWebhook";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>("");

  const { isRecording, audioLevel: recordingLevel, tonePitch, startRecording, stopRecording } = useAudioRecorder();
  const { isPlaying, audioLevel: playbackLevel, processAudio, replayLastAudio, hasLastAudio } = useElevenLabs();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/login");
      } else {
        // Fetch user profile
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      } else {
        // Fetch user profile
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, phone")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setFirstName(data.first_name);
      setPhoneNumber(data.phone);
    }
  };

  const handleMainButton = async () => {
    if (isRecording) {
      // Stop recording
      try {
        setIsProcessing(true);
        const audioBlob = await stopRecording();

        toast({
          title: "Processing...",
          description: "Converting your speech to text",
        });

        // Send to webhook if configured
        if (webhookUrl) {
          toast({
            title: "Sending audio...",
            description: "Sending to external webhook",
          });
          
          const webhookResult = await sendAudioToWebhook(audioBlob, webhookUrl, phoneNumber);
          
          if (webhookResult.success) {
            toast({
              title: "Audio sent!",
              description: "Successfully sent to webhook",
            });
          } else {
            toast({
              title: "Webhook error",
              description: webhookResult.error || "Failed to send audio",
              variant: "destructive",
            });
          }
        }

        await processAudio(audioBlob);

        toast({
          title: "Response ready",
          description: "Playing EMA's response",
        });
      } catch (error) {
        console.error("Error processing audio:", error);
        toast({
          title: "Error",
          description: "Failed to process your recording",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start recording
      try {
        await startRecording();
        toast({
          title: "Recording started",
          description: "Speak now...",
        });
      } catch (error) {
        console.error("Error starting recording:", error);
        toast({
          title: "Error",
          description: "Failed to access microphone",
          variant: "destructive",
        });
      }
    }
  };

  const handleReplay = () => {
    if (hasLastAudio) {
      replayLastAudio();
      toast({
        title: "Replaying",
        description: "Playing last response",
      });
    }
  };

  const handleStartJourney = () => {
    setShowVoiceAssistant(true);
    // Scroll to voice assistant section after a brief delay
    setTimeout(() => {
      document.getElementById("voice-assistant")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const audioLevel = isRecording ? recordingLevel : playbackLevel;

  return (
    <main className="min-h-screen bg-background font-sans">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back{firstName ? `, ${firstName}` : ""}!</h1>
            <p className="text-lg text-muted-foreground">Ready to start your journey?</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/subscription')}
            className="hidden sm:flex"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Manage Subscription
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg bg-card p-6">
            <div className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Voice Assistant</h3>
            </div>
            <p className="text-base text-muted-foreground">Ready to help you navigate and plan your trips</p>
          </div>

          <div className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg bg-card p-6">
            <div className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Recent Trips</h3>
            </div>
            <p className="text-base text-muted-foreground">No trips yet. Start your first journey today!</p>
          </div>

          <div className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg bg-card p-6">
            <div className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Upcoming</h3>
            </div>
            <p className="text-base text-muted-foreground">Schedule your next trip with AI guidance</p>
          </div>
        </div>

        {/* Main Action Card */}
        <div className="border-2 shadow-xl rounded-lg bg-card">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Get Started</h2>
            <p className="text-base text-muted-foreground mb-6">
              Begin planning your next journey with voice-powered assistance
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4 p-4 bg-accent/20 rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary-foreground">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Tell us where you want to go</h3>
                <p className="text-muted-foreground">Simply speak or type your destination</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-accent/20 rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary-foreground">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Get personalized directions</h3>
                <p className="text-muted-foreground">Receive step-by-step guidance tailored to your pace</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-accent/20 rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary-foreground">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Travel with confidence</h3>
                <p className="text-muted-foreground">Ask questions anytime during your journey</p>
              </div>
            </div>

            <Button size="lg" className="w-full mt-6 text-lg" onClick={handleStartJourney}>
              Start Your Journey
            </Button>
          </div>

          {/* EMA Voice Assistant Section */}
          {showVoiceAssistant && (
            <div
              id="voice-assistant"
              className="border-2 shadow-xl rounded-lg mb-12 animate-fade-in overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/10 to-background"></div>
              <AIGridBackground />
              <div className="p-8 sm:p-12 relative z-10">
                {/* Webhook Configuration */}
                <WebhookConfig 
                  webhookUrl={webhookUrl}
                  onWebhookChange={setWebhookUrl}
                />

                {/* Reactive Voice Orb */}
                <VoiceOrb
                  audioLevel={audioLevel}
                  isRecording={isRecording}
                  isPlaying={isPlaying}
                  tonePitch={tonePitch}
                />

                {/* Control Buttons */}
                <div className="flex flex-col items-center gap-3 mt-6">
                  <button
                    onClick={handleMainButton}
                    disabled={isProcessing || isPlaying}
                    className={`
                      group relative rounded-full px-6 py-2.5 text-sm font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-300 ease-out
                      ${
                        isRecording
                          ? "bg-gradient-to-br from-destructive/90 to-destructive/70 text-destructive-foreground shadow-[0_0_20px_rgba(239,68,68,0.3),0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4),0_6px_20px_rgba(0,0,0,0.25)]"
                          : "bg-gradient-to-br from-accent/90 to-accent/70 text-accent-foreground shadow-[0_0_15px_rgba(74,163,118,0.25),0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(74,163,118,0.3),0_6px_16px_rgba(0,0,0,0.25)]"
                      }
                      hover:scale-105 active:scale-95
                    `}
                  >
                    <span className="relative z-10">
                      {isProcessing ? "Processing..." : isRecording ? "Stop Recording" : "Talk to Me"}
                    </span>
                  </button>

                  <button
                    onClick={handleReplay}
                    disabled={!hasLastAudio || isRecording || isPlaying}
                    className="
                      group px-5 py-2 rounded-full text-xs font-medium
                      bg-secondary/60 hover:bg-secondary/80 
                      text-secondary-foreground/80 backdrop-blur-sm
                      shadow-[0_2px_10px_rgba(0,0,0,0.15)] 
                      hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]
                      transition-all duration-300 
                      hover:scale-105 active:scale-95
                      disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:scale-100
                      border border-border/20
                    "
                  >
                    <span className="relative z-10">Replay</span>
                  </button>

                  {/* Status Text */}
                  <p className="text-xs text-center text-muted-foreground/70 mt-1">
                    {isRecording && "🎤 Recording..."}
                    {isPlaying && "🔊 Playing..."}
                    {!isRecording && !isPlaying && !isProcessing && "Press to start"}
                    {isProcessing && "⚙️ Processing..."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1.05);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }
      `}</style>
    </main>
  );
};

export default Dashboard;
