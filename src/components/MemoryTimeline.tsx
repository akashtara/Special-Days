import React, { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Memory } from '../types';
import { Image as ImageIcon, Plus, Send, Search } from 'lucide-react';

interface MemoryTimelineProps {
  memories: Memory[];
  onAdd: () => void;
  onAddNote?: (note: string) => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ memories, onAdd, onAddNote }) => {
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMemories = memories.filter((memory) => {
    const query = searchQuery.toLowerCase();
    return (
      memory.title.toLowerCase().includes(query) ||
      memory.description.toLowerCase().includes(query)
    );
  });

  const sortedMemories = [...filteredMemories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddNote = () => {
    if (note.trim() && onAddNote) {
      onAddNote(note.trim());
      setNote('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display italic">Our Timeline</h2>
        <motion.button
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          onClick={onAdd}
          className="p-2 rounded-full bg-romantic-pink/20 text-romantic-pink hover:bg-romantic-pink/30 transition-all"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="glass rounded-2xl p-3 flex gap-3 items-center">
        <Search className="w-4 h-4 text-white/40 ml-2" />
        <input 
          type="text" 
          placeholder="Search memories..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm"
        />
      </div>

      <div className="glass rounded-2xl p-4 flex gap-3 items-center">
        <input 
          type="text" 
          placeholder="Write a daily love note..." 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm"
        />
        <motion.button 
          animate={note.trim() ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          onClick={handleAddNote}
          disabled={!note.trim()}
          className="p-2 rounded-full bg-romantic-pink text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="relative space-y-12">
        {/* Timeline Line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-romantic-pink/50 via-romantic-pink/20 to-transparent" />

        {sortedMemories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-12"
          >
            {/* Dot */}
            <div className="absolute left-[13px] top-2 w-2.5 h-2.5 rounded-full bg-romantic-pink shadow-[0_0_10px_rgba(255,77,109,0.5)]" />
            
            <div className="glass rounded-3xl overflow-hidden">
              {memory.imageUrl ? (
                <img 
                  src={memory.imageUrl} 
                  alt={memory.title}
                  className="w-full h-48 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : memory.title !== "Daily Love Note" ? (
                <div className="w-full h-24 bg-white/5 flex items-center justify-center text-white/10">
                  <ImageIcon className="w-8 h-8" />
                </div>
              ) : null}
              
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{memory.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    {format(new Date(memory.date), 'MMM yyyy')}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {memory.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {memories.length === 0 && (
          <div className="text-center py-20 text-white/20 italic pl-12">
            Start building your timeline of memories.
          </div>
        )}
      </div>
    </div>
  );
};
