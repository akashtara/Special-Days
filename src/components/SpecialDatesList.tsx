import React from 'react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { motion } from 'motion/react';
import { SpecialDate } from '../types';

interface SpecialDatesListProps {
  dates: SpecialDate[];
  onAdd: () => void;
}

export const SpecialDatesList: React.FC<SpecialDatesListProps> = ({ dates, onAdd }) => {
  const sortedDates = [...dates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display italic">Special Moments</h2>
        <button
          onClick={onAdd}
          className="text-xs uppercase tracking-widest text-romantic-pink hover:text-romantic-red transition-colors"
        >
          + Add Moment
        </button>
      </div>

      <div className="space-y-4">
        {sortedDates.map((item, index) => {
          const dateObj = new Date(item.date);
          const past = isPast(dateObj);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl overflow-hidden group cursor-pointer hover:bg-white/10 transition-all"
            >
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-32 object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-romantic-pink/10 flex items-center justify-center text-romantic-pink shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white/90 truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    <span>{format(dateObj, 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={past ? "text-white/40 text-[10px]" : "text-romantic-pink text-[10px] font-bold"}>
                    {past ? "Passed" : "Upcoming"}
                  </p>
                  <p className="text-xs font-mono font-medium">
                    {formatDistanceToNow(dateObj, { addSuffix: true })}
                  </p>
                </div>
                
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-romantic-pink transition-colors shrink-0" />
              </div>
            </motion.div>
          );
        })}

        {dates.length === 0 && (
          <div className="text-center py-12 text-white/20 italic">
            No special moments added yet.
          </div>
        )}
      </div>
    </div>
  );
};
