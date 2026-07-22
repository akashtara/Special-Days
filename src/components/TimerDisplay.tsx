import React, { useState, useEffect } from 'react';
import { Heart, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateTimeElapsed, cn } from '../lib/utils';
import { AppLogo } from '../assets/icons';
import { SpecialDate } from '../types';
import { format, isPast, isSameDay } from 'date-fns';

interface TimerDisplayProps {
  startDate: string;
  partner1: string;
  partner2: string;
  specialDates?: SpecialDate[];
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ startDate, partner1, partner2, specialDates = [] }) => {
  const [time, setTime] = useState(calculateTimeElapsed(new Date(startDate)));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeElapsed(new Date(startDate)));
    }, 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  const units = [
    { label: 'Years', value: time.years },
    { label: 'Months', value: time.months },
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  // Calculate nearest upcoming date
  const getNearestDate = () => {
    const now = new Date();
    
    // Create a list of all dates to consider
    const allDates = [
      { title: 'Anniversary', date: startDate },
      ...specialDates.map(sd => ({ title: sd.title, date: sd.date }))
    ];

    let nearest: { title: string; date: Date; daysUntil: number } | null = null;

    allDates.forEach(item => {
      const originalDate = new Date(item.date);
      // Next occurrence in current year
      const nextDate = new Date(now.getFullYear(), originalDate.getMonth(), originalDate.getDate());
      
      // If it has already passed this year (and is not today), it's next year
      if (isPast(nextDate) && !isSameDay(nextDate, now)) {
        nextDate.setFullYear(now.getFullYear() + 1);
      }

      // Calculate days until
      const diffTime = nextDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (!nearest || diffDays < nearest.daysUntil) {
        nearest = { title: item.title, date: nextDate, daysUntil: diffDays };
      }
    });

    return nearest;
  };

  const nearestDate = getNearestDate();

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-romantic-pink/10 blur-3xl rounded-full animate-pulse" />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative z-10"
        >
          <Heart className="w-12 h-12 text-romantic-pink/40 fill-romantic-pink/20" />
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {units.map((unit) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 flex flex-col items-center justify-center"
          >
            <span className="text-3xl font-bold font-mono tabular-nums text-romantic-pink drop-shadow-[0_0_10px_rgba(255,77,109,0.2)]">
              {unit.value.toString().padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mt-1">
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>

      {nearestDate && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm glass rounded-2xl p-4 flex items-center justify-between border border-romantic-pink/20 mt-4"
        >
          <div className="flex flex-col">
            <span className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" /> Upcoming
            </span>
            <span className="text-white font-semibold">{nearestDate.title}</span>
            <span className="text-sm text-romantic-pink">{format(nearestDate.date, 'MMMM do, yyyy')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-white tabular-nums">{nearestDate.daysUntil}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest">Days Left</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
