import { useState, useCallback } from "react";
import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
import { VoiceOrb } from "@/components/VoiceOrb";
import AIGridBackground from "@/components/3d/AIGridBackground";
import { toast } from "sonner";

export interface VoiceChatAgentProps {
  /** Your ElevenLabs Agent ID */
  agentId: string;
  /** Optional callback when receiving messages from the agent */
  onMessage?: (message: unknown) => void;
  /** Optional callback when an error occurs */
  onError?: (error: string) => void;
  /** Optional callback when conversation starts */
  onConversationStart?: (conversationId: string) => void;
  /** Optional callback when conversation ends */
  onConversationEnd?: () => void;
  /** Show background effects (default: true) */
  showBackground?: boolean;
  /** Custom class name for the container */
  className?: string;
}

export interface VoiceChatAgentState {
  isConnecting: boolean;
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
}

/**
 * VoiceChatAgent - A reusable voice conversation component powered by ElevenLabs
 * 
 * @example
 * ```tsx
 * <VoiceChatAgent
 *   agentId="your-agent-id"
 *   onMessage={(msg) => console.log('Agent:', msg)}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 */
export function VoiceChatAgent({
  agentId,
  onMessage,
  onError,
  onConversationStart,
  onConversationEnd,
  showBackground = true,
  className = "",
}: VoiceChatAgentProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleError = useCallback((error: string) => {
    toast.error(error);
    onError?.(error);
  }, [onError]);

  const { 
    startConversation, 
    endConversation, 
    isConnecting, 
    status, 
    isSpeaking 
  } = useElevenLabsConversation({
    agentId,
    onMessage: (message) => {
      console.log('VoiceChatAgent message:', message);
      onMessage?.(message);
    },
    onError: handleError,
  });

  const isConnected = status === 'connected';
  const isListening = isConnected && !isSpeaking;

  // Simulate audio level based on speaking state
  const audioLevel = isSpeaking ? 60 : (isConnected ? 20 : 0);

  const handleToggleConversation = async () => {
    if (isConnected) {
      await endConversation();
      setConversationId(null);
      onConversationEnd?.();
    } else {
      try {
        const id = await startConversation();
        if (id) {
          setConversationId(id);
          onConversationStart?.(id);
        }
      } catch (error) {
        console.error("Error starting conversation:", error);
      }
    }
  };

  const getStatusText = () => {
    if (isConnecting) return "⏳ Connecting...";
    if (isConnected && isSpeaking) return "🔊 Agent speaking...";
    if (isConnected && !isSpeaking) return "🎤 Listening...";
    return "Press to start conversation";
  };

  const getButtonText = () => {
    if (isConnecting) return "Connecting...";
    if (isConnected) return "End Conversation";
    return "Start Conversation";
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Background Effects */}
      {showBackground && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/10 to-background" />
          <AIGridBackground />
        </>
      )}

      <div className="relative z-10 p-8 sm:p-12">
        {/* Voice Orb Visualization */}
        <VoiceOrb
          audioLevel={audioLevel}
          isRecording={isListening}
          isPlaying={isSpeaking}
          tonePitch={0.5}
        />

        {/* Control Buttons */}
        <div className="flex flex-col items-center gap-3 mt-6">
          <button
            onClick={handleToggleConversation}
            disabled={isConnecting}
            className={`
              group relative rounded-full px-8 py-3 text-sm font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 ease-out
              ${
                isConnected
                  ? "bg-gradient-to-br from-destructive/90 to-destructive/70 text-destructive-foreground shadow-[0_0_20px_rgba(239,68,68,0.3),0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4),0_6px_20px_rgba(0,0,0,0.25)]"
                  : "bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground shadow-[0_0_15px_rgba(74,163,118,0.25),0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(74,163,118,0.3),0_6px_16px_rgba(0,0,0,0.25)]"
              }
              hover:scale-105 active:scale-95
            `}
          >
            <span className="relative z-10">{getButtonText()}</span>
          </button>

          {/* Status Text */}
          <p className="text-sm text-center text-muted-foreground mt-2">
            {getStatusText()}
          </p>

          {/* Conversation ID (for debugging) */}
          {conversationId && (
            <p className="text-xs text-muted-foreground/50 font-mono">
              ID: {conversationId.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// State type is already exported via the interface above
