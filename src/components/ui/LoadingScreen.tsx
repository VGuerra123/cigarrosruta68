// src/components/ui/LoadingScreen.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10 + 5); // suma entre 5 y 15
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center z-50">
      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-xl p-8 flex flex-col items-center shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src="/assets/prontin-fumador.webp"
          alt="Prontin"
          className="w-20 h-20 mb-4 drop-shadow-lg"
        />

        <h1 className="text-white text-lg font-semibold mb-2 tracking-wide">
          Cargando sistema...
        </h1>

        <div className="w-64 h-4 bg-white/20 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 to-blue-400"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          />
        </div>

        <div className="text-white/70 text-sm mt-2 font-mono tracking-widest">
          {progress}%
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
