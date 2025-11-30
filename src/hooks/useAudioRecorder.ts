import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [tonePitch, setTonePitch] = useState(0.5); // 0 = low, 0.5 = mid, 1 = high
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context and analyser for level visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);

          // Analyze tone/pitch by looking at frequency distribution
          const third = Math.floor(dataArray.length / 3);
          const lowFreqs = dataArray.slice(0, third);
          const midFreqs = dataArray.slice(third, third * 2);
          const highFreqs = dataArray.slice(third * 2);

          const lowAvg = lowFreqs.reduce((a, b) => a + b, 0) / lowFreqs.length;
          const midAvg = midFreqs.reduce((a, b) => a + b, 0) / midFreqs.length;
          const highAvg = highFreqs.reduce((a, b) => a + b, 0) / highFreqs.length;

          // Normalize pitch: 0 = more low frequencies, 1 = more high frequencies
          const totalEnergy = lowAvg + midAvg + highAvg;
          if (totalEnergy > 0) {
            const pitch = (midAvg * 0.5 + highAvg * 1.0) / totalEnergy;
            setTonePitch(pitch);
          }

          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error('No media recorder'));
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Clean up
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        
        setIsRecording(false);
        setAudioLevel(0);
        setTonePitch(0.5);
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    });
  }, []);

  return {
    isRecording,
    audioLevel,
    tonePitch,
    startRecording,
    stopRecording,
  };
};
