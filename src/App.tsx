import React, { useState, useEffect, useRef, Component } from 'react';
import { Heart, Calendar, Clock, Image as ImageIcon, Settings, Music, Music2, Share2, LogIn, LogOut, AlertCircle, Sparkles, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLogo } from './assets/icons';
import confetti from 'canvas-confetti';
import { formatDistanceToNow } from 'date-fns';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  User 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocFromServer,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { TimerDisplay } from './components/TimerDisplay';
import { SpecialDatesList } from './components/SpecialDatesList';
import { CoupleFrame } from './components/CoupleFrame';
import { MemoryTimeline } from './components/MemoryTimeline';
import { SettingsModal } from './components/SettingsModal';
import { PinLock } from './components/PinLock';
import { AIAssistant } from './components/AIAssistant';
import { AdminDashboard } from './components/AdminDashboard';
import { AppState, UserProfile, SpecialDate, Memory } from './types';
import { cn } from './lib/utils';
import { generateCoupleBackground } from './services/imageService';

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData.map(p => ({ providerId: p.providerId })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-romantic-dark flex items-center justify-center p-6 text-center">
          <div className="glass p-8 rounded-3xl max-w-md space-y-4">
            <AlertCircle className="w-12 h-12 text-romantic-red mx-auto" />
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-sm text-white/60">
              {this.state.errorInfo?.includes('{"error"') 
                ? "A database error occurred. Please check your connection or permissions." 
                : "An unexpected error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-romantic-pink rounded-full text-sm font-bold"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_PROFILE: UserProfile = {
  partner1Name: 'Romeo',
  partner2Name: 'Juliet',
  startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
  coupleImageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1000',
  backgroundPreference: 'curated',
  musicPreference: 'curated',
};

// --- Security Utilities ---
const sanitize = (str: string) => str.replace(/[<>]/g, '').trim();

const useRateLimit = (limit: number, windowMs: number) => {
  const [calls, setCalls] = useState<{ timestamp: number }[]>([]);
  
  const checkLimit = () => {
    const now = Date.now();
    const recentCalls = calls.filter(c => now - c.timestamp < windowMs);
    if (recentCalls.length >= limit) return false;
    setCalls([...recentCalls, { timestamp: now }]);
    return true;
  };
  
  return checkLimit;
};

const CURATED_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=1920',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1920'
];

const CURATED_MUSIC = [
  'https://www.bensound.com/bensound-music/bensound-romantic.mp3',
  'https://www.bensound.com/bensound-music/bensound-love.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [state, setState] = useState<AppState>({
    profile: DEFAULT_PROFILE,
    specialDates: [],
    memories: [],
  });

  const [activeTab, setActiveTab] = useState<'timer' | 'dates' | 'timeline' | 'ai' | 'admin'>('timer');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [aiBackground, setAiBackground] = useState<string | null>(null);
  const checkRateLimit = useRateLimit(10, 60000); // 10 actions per minute
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // --- Auth & Connection Test ---
  useEffect(() => {
    const fetchAiBackground = async () => {
      try {
        const bg = await generateCoupleBackground(process.env.GEMINI_API_KEY || '');
        if (bg) setAiBackground(bg);
      } catch (e: any) {
        // Silently handle quota and permission errors for auto-fetch
        if (!e.message?.includes('429') && e.status !== 429 && !e.message?.includes('403') && e.status !== 403) {
          console.error("Failed to fetch AI background", e);
        }
      }
    };
    fetchAiBackground();

    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) {
        // Initial lock check
        // We'll handle this in the profile snapshot
      } else {
        setIsLocked(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Firestore Sync ---
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const userDocRef = doc(db, 'users', user.uid);
    const datesRef = collection(db, 'users', user.uid, 'specialDates');
    const memoriesRef = collection(db, 'users', user.uid, 'memories');

    const unsubProfile = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setState(prev => ({ ...prev, profile }));
        if (profile.pin && !isLocked) {
          // Only lock on initial load or if explicitly requested
          // For this demo, we'll lock if a PIN exists and we haven't unlocked yet
        }
      } else {
        // Initialize profile if it doesn't exist
        setDoc(userDocRef, DEFAULT_PROFILE).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}`));

    const unsubDates = onSnapshot(datesRef, (snap) => {
      const dates = snap.docs.map(d => ({ id: d.id, ...d.data() } as SpecialDate));
      setState(prev => ({ ...prev, specialDates: dates }));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/specialDates`));

    const unsubMemories = onSnapshot(memoriesRef, (snap) => {
      const memories = snap.docs.map(d => ({ id: d.id, ...d.data() } as Memory));
      setState(prev => ({ ...prev, memories }));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/memories`));

    return () => {
      unsubProfile();
      unsubDates();
      unsubMemories();
    };
  }, [user, isAuthReady]);

  // --- Actions ---
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const toggleMusic = () => {
    const isCurated = state.profile.musicPreference === 'curated' || !state.profile.musicPreference;
    const musicUrl = isCurated ? CURATED_MUSIC[0] : (state.profile.musicUrl || CURATED_MUSIC[0]);

    if (!audioRef.current || audioRef.current.src !== musicUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true;
    }
    
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleShare = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff4d6d', '#c9184a', '#ffffff']
    });
    alert("Love shared!");
  };

  const addSpecialDate = async () => {
    if (!user || !checkRateLimit()) return;
    const title = prompt('Enter moment title:');
    const date = prompt('Enter date (YYYY-MM-DD):');
    const imageUrl = prompt('Enter image URL (optional):');
    if (title && date) {
      const path = `users/${user.uid}/specialDates`;
      try {
        await addDoc(collection(db, path), {
          title: sanitize(title),
          date: new Date(date).toISOString(),
          type: 'custom',
          imageUrl: imageUrl ? sanitize(imageUrl) : null,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, path);
      }
    }
  };

  const addMemory = async () => {
    if (!user || !checkRateLimit()) return;
    const title = prompt('Enter memory title:');
    const description = prompt('Enter description:');
    const imageUrl = prompt('Enter image URL (optional):');
    if (title && description) {
      const path = `users/${user.uid}/memories`;
      try {
        await addDoc(collection(db, path), {
          title: sanitize(title),
          description: sanitize(description),
          date: new Date().toISOString(),
          imageUrl: imageUrl ? sanitize(imageUrl) : null,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, path);
      }
    }
  };

  const addDailyNote = async (note: string) => {
    if (!user || !checkRateLimit()) return;
    if (note) {
      const path = `users/${user.uid}/memories`;
      try {
        await addDoc(collection(db, path), {
          title: "Daily Love Note",
          description: sanitize(note),
          date: new Date().toISOString(),
          imageUrl: null,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, path);
      }
    }
  };

  const deleteAccount = async () => {
    if (!user || !window.confirm("Are you absolutely sure? This will delete all your love data forever.")) return;
    
    const batch = writeBatch(db);
    const dates = await getDocs(collection(db, `users/${user.uid}/specialDates`));
    const memories = await getDocs(collection(db, `users/${user.uid}/memories`));
    
    dates.forEach(d => batch.delete(d.ref));
    memories.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'users', user.uid));
    
    try {
      await batch.commit();
      await signOut(auth);
      alert("Account deleted successfully.");
    } catch (e) {
      console.error("Deletion failed", e);
    }
  };

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, path), newProfile, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const generateAiProfileBackground = async () => {
    if (!user || !checkRateLimit()) return;
    try {
      const bg = await generateCoupleBackground(process.env.GEMINI_API_KEY || '');
      if (bg) {
        await updateProfile({ ...state.profile, coupleImageUrl: bg });
        alert("AI Background generated and saved!");
      }
    } catch (e: any) {
      console.error("AI Background generation failed", e);
      if (e.message?.includes('429') || e.status === 429) {
        alert("AI Daily Quota reached. Please try again tomorrow! ❤️");
      } else if (e.message?.includes('403') || e.status === 403) {
        alert("Permission denied. Your API key may not have access to this feature.");
      } else {
        alert("Failed to generate AI background. Please try again.");
      }
    }
  };

  if (isSplashVisible) {
    const splashImageUrl = '/developer_lover.jpg';
    
    const circleImageUrl = state.profile.coupleImageUrl || CURATED_BACKGROUNDS[1];

    return (
      <div className="fixed inset-0 z-[200] bg-romantic-dark flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 3 }}
            src={splashImageUrl}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-romantic-dark/80 via-transparent to-romantic-dark" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-romantic-pink/10 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-romantic-red/10 blur-[100px] rounded-full animate-pulse delay-700" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-romantic-pink/40 blur-2xl rounded-full scale-110 animate-pulse" />
              <div className="relative w-40 h-40 rounded-full border-4 border-romantic-pink/50 overflow-hidden drop-shadow-[0_0_25px_rgba(255,77,109,0.5)]">
                <img 
                  src={circleImageUrl} 
                  alt="Couple"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-romantic-pink/20 to-transparent" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-romantic-dark p-2 rounded-full border border-romantic-pink/30 drop-shadow-lg">
                <AppLogo className="w-8 h-8 text-romantic-pink" />
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center space-y-3"
          >
            <h1 className="text-4xl font-display italic text-gradient tracking-tight">Special Days</h1>
            <div className="flex flex-col items-center gap-1 mt-4">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Owner: Mr Tarafder</p>
              <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest">Developer: Mr Tarafder</p>
              <p className="text-romantic-pink text-[10px] tracking-wider mt-1">Enquiry: mrtarafder606@gmail.com</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!isAuthReady) return null;

  if (!user) {
    return (
      <div className="h-[100dvh] bg-romantic-dark flex flex-col items-center justify-center p-8 space-y-8 text-center relative overflow-hidden">
        {/* AI Background */}
        <AnimatePresence>
          {aiBackground && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={aiBackground} 
                alt="AI Background" 
                className="w-full h-full object-cover blur-sm scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-romantic-dark/80 via-romantic-dark/40 to-romantic-dark" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 space-y-8 flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            onDoubleClick={() => {
              const email = prompt("Developer Email:");
              if (email === 'mrtarafder606@gmail.com') {
                const password = prompt("Developer Password:");
                if (password) {
                  signInWithEmailAndPassword(auth, email, password)
                    .catch(() => alert("Invalid credentials or account doesn't exist. Please create it in Firebase Auth first."));
                }
              }
            }}
          >
            <AppLogo className="w-24 h-24 drop-shadow-[0_0_15px_rgba(255,77,109,0.5)] cursor-pointer" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-4xl font-display italic text-gradient">Special Days</h1>
            <p className="text-white/40 text-sm tracking-widest uppercase">Every second counts</p>
          </div>
          <button 
            onClick={handleLogin}
            className="glass px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all font-bold"
          >
            <LogIn className="w-5 h-5 text-romantic-pink" />
            Sign in with Google
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 left-0 right-0 text-center flex flex-col items-center gap-1"
        >
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Owner: Mr Tarafder</p>
          <p className="text-white/60 text-[10px] font-medium uppercase tracking-widest">Developer: Mr Tarafder</p>
          <p className="text-romantic-pink/60 text-[10px] tracking-wider mt-1 mb-2">Enquiry: mrtarafder606@gmail.com</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-medium">
            Made in <span className="text-romantic-pink/40">Tarafder</span>
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLocked && state.profile.pin) {
    return <PinLock correctPin={state.profile.pin} onUnlock={() => setIsLocked(false)} />;
  }

  const isCurated = state.profile.backgroundPreference === 'curated';
  const mainBgImage = isCurated 
    ? CURATED_BACKGROUNDS[2] 
    : (state.profile.coupleImageUrl || CURATED_BACKGROUNDS[2]);

  const toggleBackgroundPref = () => {
    const newPref = state.profile.backgroundPreference === 'curated' ? 'personal' : 'curated';
    updateProfile({ backgroundPreference: newPref });
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.1 },
      colors: ['#ff4d6d', '#ff758f', '#ff8fa3']
    });
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-[100dvh] max-w-md mx-auto relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img 
              key={mainBgImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.2, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 1.5 }}
              src={mainBgImage} 
              alt="Couple" 
              className="w-full h-full object-cover blur-sm"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-romantic-dark/80 via-romantic-dark/40 to-romantic-dark" />
        </div>

        {/* Header Actions */}
        <div className="relative z-10 p-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={toggleMusic}
              className={cn(
                "p-3 rounded-full glass transition-all",
                isMusicPlaying ? "text-romantic-pink shadow-[0_0_15px_rgba(255,77,109,0.3)]" : "text-white/40"
              )}
            >
              {isMusicPlaying ? <Music2 className="w-5 h-5 animate-bounce" /> : <Music className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleBackgroundPref}
              className={cn(
                "p-3 rounded-full glass transition-all",
                state.profile.backgroundPreference === 'curated' ? "text-romantic-pink shadow-[0_0_10px_rgba(255,77,109,0.2)]" : "text-white/40"
              )}
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="p-3 rounded-full glass text-white/60 hover:text-white transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-full glass text-white/60 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-3 rounded-full glass text-white/60 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="relative z-10 flex-1 overflow-y-auto pb-32">
          <AnimatePresence mode="wait">
            {activeTab === 'timer' && (
              <motion.div
                key="timer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <CoupleFrame profile={state.profile} />
                <TimerDisplay 
                  startDate={state.profile.startDate}
                  partner1={state.profile.partner1Name}
                  partner2={state.profile.partner2Name}
                  specialDates={state.specialDates}
                />
              </motion.div>
            )}

            {activeTab === 'dates' && (
              <motion.div
                key="dates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SpecialDatesList 
                  dates={state.specialDates} 
                  onAdd={addSpecialDate}
                />
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MemoryTimeline 
                  memories={state.memories} 
                  onAdd={addMemory}
                  onAddNote={addDailyNote}
                />
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="px-6"
              >
                <AIAssistant 
                  profile={state.profile}
                  duration={formatDistanceToNow(new Date(state.profile.startDate))}
                />
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <AdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-[400px]">
          <div className="glass rounded-[2rem] p-2 flex items-center justify-between shadow-2xl overflow-x-auto hide-scrollbar">
            <NavButton 
              active={activeTab === 'timer'} 
              onClick={() => setActiveTab('timer')}
              icon={<Heart className="w-5 h-5" />}
              label="Love"
            />
            <NavButton 
              active={activeTab === 'dates'} 
              onClick={() => setActiveTab('dates')}
              icon={<Calendar className="w-5 h-5" />}
              label="Dates"
            />
            <NavButton 
              active={activeTab === 'timeline'} 
              onClick={() => setActiveTab('timeline')}
              icon={<Clock className="w-5 h-5" />}
              label="Timeline"
            />
            <NavButton 
              active={activeTab === 'ai'} 
              onClick={() => setActiveTab('ai')}
              icon={<Sparkles className="w-5 h-5" />}
              label="AI"
            />
            {user?.email === 'mrtarafder606@gmail.com' && (
              <NavButton 
                active={activeTab === 'admin'} 
                onClick={() => setActiveTab('admin')}
                icon={<Shield className="w-5 h-5 text-romantic-pink" />}
                label="Admin"
              />
            )}
          </div>
        </nav>

        {/* Modals */}
        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsModal 
              profile={state.profile}
              userId={user.uid}
              onSave={updateProfile}
              onClose={() => setIsSettingsOpen(false)}
              onDeleteAccount={deleteAccount}
              onGenerateAiBackground={generateAiProfileBackground}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center py-3 px-6 rounded-2xl transition-all duration-300",
      active ? "text-romantic-pink" : "text-white/40 hover:text-white/60"
    )}
  >
    {active && (
      <motion.div
        layoutId="nav-pill"
        className="absolute inset-0 bg-romantic-pink/10 rounded-2xl"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <div className="relative z-10">{icon}</div>
    <span className="relative z-10 text-[10px] uppercase tracking-widest font-bold mt-1">
      {label}
    </span>
  </button>
);
