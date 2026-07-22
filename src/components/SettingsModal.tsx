import React, { useState, useRef } from 'react';
import { X, Save, Heart, Calendar, User, Shield, Trash2, Download, Sparkles, Music, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { SecurityLogo } from '../assets/icons';

interface SettingsModalProps {
  profile: UserProfile;
  userId?: string;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
  onDeleteAccount: () => void;
  onGenerateAiBackground: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  profile, 
  userId,
  onSave, 
  onClose, 
  onDeleteAccount,
  onGenerateAiBackground
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Basic check for size (Firestore limit is 1MB total doc size)
      if (base64.length > 800000) {
        alert("Image is too large. Please select a smaller photo.");
        return;
      }
      setFormData({ ...formData, coupleImageUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const data = JSON.stringify(profile, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-love-data.json';
    a.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass w-full max-w-md rounded-[2.5rem] overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-display italic">Personalize</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Partners</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={formData.partner1Name}
                    onChange={(e) => setFormData({ ...formData, partner1Name: e.target.value })}
                    placeholder="Partner 1"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-romantic-pink/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={formData.partner2Name}
                    onChange={(e) => setFormData({ ...formData, partner2Name: e.target.value })}
                    placeholder="Partner 2"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-romantic-pink/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Start Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="datetime-local"
                  value={formData.startDate.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-romantic-pink/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Couple Photo</label>
              <div className="flex flex-col gap-3">
                {formData.coupleImageUrl && (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-white/10 group">
                    <img 
                      src={formData.coupleImageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white">Current Selection</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="url"
                      value={formData.coupleImageUrl?.startsWith('data:') ? 'Custom Uploaded Image' : (formData.coupleImageUrl || '')}
                      onChange={(e) => setFormData({ ...formData, coupleImageUrl: e.target.value })}
                      placeholder="Paste image link here..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-romantic-pink/50 transition-colors text-xs"
                      disabled={formData.coupleImageUrl?.startsWith('data:')}
                    />
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:bg-white/10 hover:text-white transition-all"
                    title="Upload from Gallery"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={async () => {
                      setIsGenerating(true);
                      await onGenerateAiBackground();
                      setIsGenerating(false);
                    }}
                    className="p-3 bg-romantic-pink/20 border border-romantic-pink/30 rounded-2xl text-romantic-pink hover:bg-romantic-pink/30 transition-all disabled:opacity-50"
                    title="Generate AI Background"
                  >
                    <Sparkles className={cn("w-5 h-5", isGenerating && "animate-spin")} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Background Style</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, backgroundPreference: 'personal' })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    formData.backgroundPreference === 'personal' || !formData.backgroundPreference
                      ? "bg-romantic-pink/10 border-romantic-pink/50 text-romantic-pink"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, backgroundPreference: 'curated' })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    formData.backgroundPreference === 'curated'
                      ? "bg-romantic-pink/10 border-romantic-pink/50 text-romantic-pink"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">System Own</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Couple Choice Music</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, musicPreference: 'personal' })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    formData.musicPreference === 'personal'
                      ? "bg-romantic-pink/10 border-romantic-pink/50 text-romantic-pink"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Custom Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, musicPreference: 'curated' })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    formData.musicPreference === 'curated' || !formData.musicPreference
                      ? "bg-romantic-pink/10 border-romantic-pink/50 text-romantic-pink"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  <Music className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">System Choice</span>
                </button>
              </div>
              
              {formData.musicPreference === 'personal' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Direct Audio Link (Spotify/SoundCloud/URL)</label>
                  <input
                    type="url"
                    value={formData.musicUrl || ''}
                    onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-romantic-pink/50 transition-colors"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">App PIN (4 digits)</label>
              <input
                type="text"
                maxLength={4}
                value={formData.pin || ''}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                placeholder="1234"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-romantic-pink/50 transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-white/60">
                <SecurityLogo className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Privacy & Security</span>
              </div>

              {userId && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Your Unique User ID (Mandatory)</span>
                  <code className="text-xs text-romantic-pink select-all">{userId}</code>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs hover:bg-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" /> Export Data
                </button>
                <button
                  type="button"
                  onClick={onDeleteAccount}
                  className="flex items-center justify-center gap-2 py-3 bg-romantic-red/10 border border-romantic-red/20 rounded-2xl text-xs text-romantic-red hover:bg-romantic-red/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-romantic-pink to-romantic-red py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
          
          <div className="text-center pt-2">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-medium">
              Made in <span className="text-romantic-pink/40">Tarafder</span>
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
