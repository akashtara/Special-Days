import React, { useState } from 'react';
import { Sparkles, Heart, MapPin, PenTool, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FunctionLogo } from '../assets/icons';
import { generateLoveLetter, generateDateIdeas } from '../services/geminiService';
import { UserProfile } from '../types';

interface AIAssistantProps {
  profile: UserProfile;
  duration: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ profile, duration }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: string; content: any } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLetter = async () => {
    setLoading('letter');
    try {
      const letter = await generateLoveLetter(profile.partner1Name, profile.partner2Name, duration);
      setResult({ type: 'letter', content: letter });
    } catch (error: any) {
      console.error('AI Error:', error);
      if (error.message?.includes('429') || error.status === 429) {
        alert("AI Daily Quota reached for today! Please try again tomorrow. ❤️");
      } else if (error.message?.includes('403') || error.status === 403) {
        alert("Permission denied. Your API key may not have access to this feature.");
      } else {
        alert("Something went wrong with the AI. Please try again later.");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateDateIdeas = async () => {
    setLoading('dates');
    try {
      const ideas = await generateDateIdeas(profile.partner1Name, profile.partner2Name);
      setResult({ type: 'dates', content: ideas });
    } catch (error: any) {
      console.error('AI Error:', error);
      if (error.message?.includes('429') || error.status === 429) {
        alert("AI Daily Quota reached for today! Please try again tomorrow. ❤️");
      } else if (error.message?.includes('403') || error.status === 403) {
        alert("Permission denied. Your API key may not have access to this feature.");
      } else {
        alert("Something went wrong with the AI. Please try again later.");
      }
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <FunctionLogo className="w-10 h-10" />
        <div>
          <h2 className="text-2xl font-display italic">AI Love Assistant</h2>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Powered by Gemini</p>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <p className="text-[10px] text-romantic-pink/40 uppercase tracking-widest font-medium">Made in Tarafder</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleGenerateLetter}
          disabled={loading !== null}
          className="glass p-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-romantic-pink/10 flex items-center justify-center text-romantic-pink group-hover:scale-110 transition-transform">
            {loading === 'letter' ? <Loader2 className="w-6 h-6 animate-spin" /> : <PenTool className="w-6 h-6" />}
          </div>
          <span className="text-sm font-medium">Love Letter</span>
        </button>

        <button
          onClick={handleGenerateDateIdeas}
          disabled={loading !== null}
          className="glass p-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-romantic-red/10 flex items-center justify-center text-romantic-red group-hover:scale-110 transition-transform">
            {loading === 'dates' ? <Loader2 className="w-6 h-6 animate-spin" /> : <MapPin className="w-6 h-6" />}
          </div>
          <span className="text-sm font-medium">Date Ideas</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-3xl p-6 relative"
          >
            {result.type === 'letter' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-romantic-pink font-display italic text-lg flex items-center gap-2">
                    <Heart className="w-4 h-4" /> A Special Note
                  </h3>
                  <button
                    onClick={() => copyToClipboard(result.content)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                  </button>
                </div>
                <p className="text-white/80 leading-relaxed italic font-serif text-lg">
                  {result.content}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-romantic-red font-display italic text-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Suggested Dates
                </h3>
                <div className="space-y-4">
                  {result.content.map((idea: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="font-bold text-white/90 mb-1">{idea.title}</h4>
                      <p className="text-sm text-white/60">{idea.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm italic">
            "Let AI help you express your love or plan your next adventure together."
          </p>
        </div>
      )}
    </div>
  );
};
