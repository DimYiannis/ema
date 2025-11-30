import { useEffect, useState } from 'react';

interface AudioWavesProps {
  isActive: boolean;
  audioLevel: number;
  isRecording: boolean;
}

export const AudioWaves = ({ isActive, audioLevel, isRecording }: AudioWavesProps) => {
  const [scale1, setScale1] = useState(1);
  const [scale2, setScale2] = useState(1);
  const [scale3, setScale3] = useState(1);

  useEffect(() => {
    if (isActive) {
      const level = audioLevel / 100;
      setScale1(1 + level * 0.3);
      setScale2(1 + level * 0.5);
      setScale3(1 + level * 0.7);
    } else {
      setScale1(1);
      setScale2(1);
      setScale3(1);
    }
  }, [audioLevel, isActive]);

  const waveColor = isRecording 
    ? 'rgba(239, 68, 68, 0.2)' // red for recording
    : 'rgba(59, 130, 246, 0.2)'; // blue for playback

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute rounded-full transition-transform duration-300 ease-out"
        style={{
          width: '280px',
          height: '280px',
          border: `2px solid ${waveColor}`,
          transform: `scale(${scale1})`,
        }}
      />
      <div
        className="absolute rounded-full transition-transform duration-300 ease-out"
        style={{
          width: '320px',
          height: '320px',
          border: `2px solid ${waveColor}`,
          transform: `scale(${scale2})`,
        }}
      />
      <div
        className="absolute rounded-full transition-transform duration-300 ease-out"
        style={{
          width: '360px',
          height: '360px',
          border: `2px solid ${waveColor}`,
          transform: `scale(${scale3})`,
        }}
      />
    </div>
  );
};
