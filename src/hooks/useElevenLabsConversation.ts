import { useConversation } from '@11labs/react';
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseElevenLabsConversationProps {
  agentId: string;
  onMessage?: (message: unknown) => void;
  onError?: (error: string) => void;
}

export const useElevenLabsConversation = ({
  agentId,
  onMessage,
  onError,
}: UseElevenLabsConversationProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs conversation connected');
      setIsConnecting(false);
      toast.success('Voice assistant connected');
    },
    onDisconnect: () => {
      console.log('ElevenLabs conversation disconnected');
      toast.info('Voice assistant disconnected');
    },
    onMessage: (message) => {
      console.log('ElevenLabs message:', message);
      onMessage?.(message);
    },
    onError: (error: unknown) => {
      console.error('ElevenLabs error:', error);
      setIsConnecting(false);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? String((error as { message: string }).message) 
        : 'Connection error';
      toast.error(errorMessage);
      onError?.(errorMessage);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setIsConnecting(true);

      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-signed-url', {
        body: { agentId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get signed URL');
      }

      if (!data?.signedUrl) {
        throw new Error('No signed URL returned');
      }

      // Start the conversation with the signed URL
      const conversationId = await conversation.startSession({
        signedUrl: data.signedUrl,
      });

      console.log('Conversation started:', conversationId);
      return conversationId;
    } catch (err) {
      setIsConnecting(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      console.error('Error starting conversation:', errorMessage);
      toast.error(errorMessage);
      onError?.(errorMessage);
      throw err;
    }
  }, [agentId, conversation, onError]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error('Error ending conversation:', err);
    }
  }, [conversation]);

  return {
    startConversation,
    endConversation,
    isConnecting,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
  };
};
