import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface CoupleFrameProps {
  profile: UserProfile;
}

export const CoupleFrame: React.FC<CoupleFrameProps> = ({ profile }) => {
  const imageUrl = profile.coupleImageUrl || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=600";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6"
    >
      <div className="relative group mx-auto w-48 h-48">
        {/* Animated Glow Backdrops */}
        <div className="absolute inset-0 bg-romantic-pink/30 blur-3xl rounded-full -z-10 animate-pulse" />
        <div className="absolute inset-0 bg-romantic-pink/10 blur-xl rounded-full -z-10 scale-125" />
        
        {/* The Frame */}
        <div className="relative w-full h-full p-2 rounded-full bg-gradient-to-tr from-romantic-pink via-white/20 to-romantic-pink/40 backdrop-blur-sm shadow-2xl">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/50 shadow-inner">
            <img 
              src={imageUrl} 
              alt="Our Story" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
          
          {/* Decorative Hearts */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-1 -right-1 bg-romantic-pink p-1.5 rounded-full shadow-lg border border-white/30"
          >
            <Heart className="w-4 h-4 text-white fill-white" />
          </motion.div>
          
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              y: [0, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-2 -left-2 bg-romantic-dark/80 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-romantic-pink/30"
          >
            <span className="text-[10px] font-bold text-romantic-pink uppercase tracking-widest">Forever</span>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 text-center space-y-1">
        <h2 className="text-2xl font-display italic text-white drop-shadow-md">
          {profile.partner1Name} <span className="text-romantic-pink">&</span> {profile.partner2Name}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Our Love Story</p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>
    </motion.div>
  );
};
