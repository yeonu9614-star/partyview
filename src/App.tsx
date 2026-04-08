/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shuffle, Music, Shirt, Paintbrush, Info, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPartyRecommendation, type PartyRecommendation } from './lib/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const KEYWORDS = [
  "Neon", "Retro", "Tropical", "Elegant", "Spooky", "Space", "Disco", "Underground", 
  "Cozy", "Wild", "Cyberpunk", "Vintage", "Minimalist", "Masquerade", "Beach", 
  "Forest", "Gold", "Pastel", "Industrial", "Bohemian", "Futuristic", "Gothic", 
  "Candy", "Ocean", "Desert", "Jungle", "Steampunk", "Art Deco", "Pixel", "Glitch"
];

export default function App() {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<PartyRecommendation | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShuffle = useCallback(async () => {
    setIsShuffling(true);
    setRecommendation(null);
    setError(null);

    // Simulate shuffling animation
    const shuffleInterval = setInterval(() => {
      const randoms = [...KEYWORDS].sort(() => 0.5 - Math.random()).slice(0, 3);
      setSelectedKeywords(randoms);
    }, 100);

    setTimeout(async () => {
      clearInterval(shuffleInterval);
      const finalKeywords = [...KEYWORDS].sort(() => 0.5 - Math.random()).slice(0, 3);
      setSelectedKeywords(finalKeywords);
      setIsShuffling(false);
      
      // Call Gemini
      setIsLoading(true);
      try {
        const rec = await getPartyRecommendation(finalKeywords);
        setRecommendation(rec);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00FF00] selection:text-black">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00FF00]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF00FF]/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
              Party <span className="text-[#00FF00]">Vibe</span><br />Generator
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-medium">
              Draw three random keywords and let AI craft your next unforgettable night.
            </p>
          </motion.div>
        </header>

        {/* Keyword Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="h-32 md:h-48 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                {selectedKeywords[i] ? (
                  <motion.span
                    key={selectedKeywords[i]}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#00FF00]"
                  >
                    {selectedKeywords[i]}
                  </motion.span>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="text-gray-600"
                  >
                    <Sparkles size={48} strokeWidth={1} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-20">
          <button
            onClick={handleShuffle}
            disabled={isShuffling || isLoading}
            className={cn(
              "group relative px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-xl transition-all hover:bg-[#00FF00] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              "before:absolute before:inset-0 before:border-2 before:border-white before:translate-x-2 before:translate-y-2 before:transition-transform hover:before:translate-x-0 hover:before:translate-y-0"
            )}
          >
            <span className="relative flex items-center gap-3">
              {isShuffling || isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Shuffle size={24} />
              )}
              {selectedKeywords.length > 0 ? "Reshuffle" : "Draw Keywords"}
            </span>
          </button>
        </div>

        {/* Recommendation Result */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <p className="text-[#00FF00] font-mono animate-pulse uppercase tracking-[0.2em]">
                Consulting the party gods...
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}

          {recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 bg-[#00FF00] text-black text-xs font-black uppercase mb-4">
                    Recommended Theme
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-none">
                    {recommendation.themeName}
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    {recommendation.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[#00FF00]">
                        <Music size={20} />
                        <span className="font-bold uppercase tracking-wider text-sm">Music</span>
                      </div>
                      <p className="text-gray-300">{recommendation.musicStyle}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[#00FF00]">
                        <Shirt size={20} />
                        <span className="font-bold uppercase tracking-wider text-sm">Dress Code</span>
                      </div>
                      <p className="text-gray-300">{recommendation.dressCode}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-72 space-y-6">
                  <div className="flex items-center gap-3 text-[#00FF00]">
                    <Paintbrush size={20} />
                    <span className="font-bold uppercase tracking-wider text-sm">Decor Ideas</span>
                  </div>
                  <ul className="space-y-4">
                    {recommendation.decorationIdeas.map((idea, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-3 text-gray-300 text-sm"
                      >
                        <span className="text-[#00FF00] font-mono">0{idx + 1}</span>
                        {idea}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-600 text-xs font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Info size={14} />
            Powered by Gemini 3 Flash
          </div>
          <div>© 2026 Party Vibe Labs</div>
        </footer>
      </main>
    </div>
  );
}
