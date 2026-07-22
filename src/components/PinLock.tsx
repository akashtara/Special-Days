import React, { useState } from 'react';
import { Lock, Unlock, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PinLockProps {
  correctPin: string;
  onUnlock: () => void;
}

export const PinLock: React.FC<PinLockProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumber = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-romantic-dark flex flex-col items-center justify-center p-8">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-romantic-pink/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-romantic-red/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-12 w-full max-w-xs">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-romantic-pink" />
          </div>
          <h2 className="text-2xl font-display italic">Enter PIN</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest">Secure Love Tracker</p>
        </div>

        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-300",
                pin.length > i ? "bg-romantic-pink border-romantic-pink" : "border-white/20"
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map((btn, i) => {
            if (btn === '') return <div key={i} />;
            if (btn === 'delete') {
              return (
                <button
                  key={i}
                  onClick={() => setPin(pin.slice(0, -1))}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <Unlock className="w-5 h-5" />
                </button>
              );
            }
            return (
              <button
                key={i}
                onClick={() => handleNumber(btn)}
                className="w-16 h-16 rounded-full glass flex items-center justify-center text-xl font-bold hover:bg-white/10 transition-colors"
              >
                {btn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
