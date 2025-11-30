import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { elevenLabsConfig } from '@/config/elevenlabs';

export const useElevenLabs = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastAudioRef = useRef<HTMLAudioElement | null>(null);

  const convertAudioToText = async (audioBlob: Blob): Promise<string> => {
    // For demo purposes, we'll simulate transcription
    // In production, you'd use a speech-to-text service
    return "Hello, how can I help you today?";
  };

  const generateSpeech = async (text: string, voiceId?: string): Promise<Blob> => {
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: {
        text,
        voiceId: voiceId || elevenLabsConfig.defaultVoiceId,
        model: elevenLabsConfig.defaultModel,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to generate speech');
    }

    if (!data?.audio) {
      throw new Error('No audio data returned');
    }

    // Convert base64 to blob
    const binaryString = atob(data.audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: data.mimeType || 'audio/mpeg' });
  };

  const playAudio = useCallback(async (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    lastAudioRef.current = audio;

    // Set up audio context and analyser for level visualization
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    const source = audioContextRef.current.createMediaElementSource(audio);
    analyserRef.current = audioContextRef.current.createAnalyser();
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    analyserRef.current.fftSize = 256;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        if (!audio.paused) {
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      }
    };

    audio.onplay = () => {
      setIsPlaying(true);
      updateLevel();
    };

    audio.onended = () => {
      setIsPlaying(false);
      setAudioLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    await audio.play();
  }, []);

  const replayLastAudio = useCallback(() => {
    if (lastAudioRef.current) {
      lastAudioRef.current.currentTime = 0;
      lastAudioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const processAudio = async (audioBlob: Blob) => {
    // Convert audio to text (simulated)
    const text = await convertAudioToText(audioBlob);
    
    // Generate speech response
    const speechBlob = await generateSpeech(text);
    
    // Play the audio
    await playAudio(speechBlob);
  };

  return {
    isPlaying,
    audioLevel,
    processAudio,
    generateSpeech,
    playAudio,
    replayLastAudio,
    hasLastAudio: !!lastAudioRef.current,
  };
};
