import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function FuturisticHUD() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top left corner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 left-8 text-xs font-mono text-accent/60 space-y-1"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>
        <div>{time.toLocaleTimeString()}</div>
      </motion.div>

      {/* Top right corner */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 right-8 text-xs font-mono text-accent/60"
      >
        <div className="text-right space-y-1">
          <div>AI STATUS: ACTIVE</div>
          <div>LATENCY: 12ms</div>
        </div>
      </motion.div>

      {/* Corner decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-accent/20"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-accent/20"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-accent/20"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-accent/20"
      />
    </div>
  );
}
