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
  "네온", "레트로", "트로피컬", "우아한", "으스스한", "우주", "디스코", "언더그라운드", 
  "아늑한", "와일드", "사이버펑크", "빈티지", "미니멀리스트", "가면무도회", "해변", 
  "숲", "골드", "파스텔", "인더스트리얼", "보헤미안", "미래지향적", "고딕", 
  "캔디", "오션", "사막", "정글", "스팀펑크", "아르데코", "픽셀", "글리치"
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
    <div className="min-h-screen bg-[#fdfcfb] text-[#2d3436] font-sans selection:bg-[#ff7675] selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#fab1a0]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#74b9ff]/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-display uppercase tracking-tighter leading-none mb-6 text-[#ff7675]">
              파티 <span className="text-[#fdcb6e]">바이브</span><br />생성기
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto font-medium">
              세 가지 랜덤 키워드를 뽑아 AI가 제안하는 잊지 못할 밤을 만들어보세요.
            </p>
          </motion.div>
        </header>

        {/* Keyword Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="h-32 md:h-48 bg-white border-4 border-[#fab1a0]/30 rounded-[2rem] flex items-center justify-center relative overflow-hidden group shadow-lg shadow-[#fab1a0]/10"
            >
              <AnimatePresence mode="wait">
                {selectedKeywords[i] ? (
                  <motion.span
                    key={selectedKeywords[i]}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    className="text-3xl md:text-4xl font-display uppercase tracking-widest text-[#ff7675]"
                  >
                    {selectedKeywords[i]}
                  </motion.span>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="text-[#fab1a0]"
                  >
                    <Sparkles size={48} strokeWidth={1.5} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#fab1a0]/5 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-20">
          <button
            onClick={handleShuffle}
            disabled={isShuffling || isLoading}
            className={cn(
              "group relative px-12 py-6 bg-[#ff7675] text-white font-display uppercase tracking-widest text-2xl transition-all hover:bg-[#ff4757] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-xl shadow-[#ff7675]/30",
              "hover:scale-105 transition-transform duration-300"
            )}
          >
            <span className="relative flex items-center gap-3">
              {isShuffling || isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Shuffle size={24} />
              )}
              {selectedKeywords.length > 0 ? "다시 뽑기" : "키워드 뽑기"}
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
              <p className="text-[#ff7675] font-display animate-pulse uppercase tracking-[0.2em] text-xl">
                파티의 신에게 물어보는 중...
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] text-red-500 text-center font-bold"
            >
              {error}
            </motion.div>
          )}

          {recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white border-4 border-[#fdcb6e]/30 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-[#fdcb6e]/10"
            >
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <div className="inline-block px-4 py-1 bg-[#fdcb6e] text-white text-sm font-display uppercase mb-4 rounded-full">
                    추천 테마
                  </div>
                  <h2 className="text-4xl md:text-6xl font-display uppercase tracking-tight mb-6 leading-none text-[#2d3436]">
                    {recommendation.themeName}
                  </h2>
                  <p className="text-gray-500 text-xl leading-relaxed mb-8 font-medium">
                    {recommendation.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[#ff7675]">
                        <Music size={24} />
                        <span className="font-display uppercase tracking-wider text-lg">음악</span>
                      </div>
                      <p className="text-gray-600 text-lg">{recommendation.musicStyle}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[#ff7675]">
                        <Shirt size={24} />
                        <span className="font-display uppercase tracking-wider text-lg">드레스 코드</span>
                      </div>
                      <p className="text-gray-600 text-lg">{recommendation.dressCode}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-72 space-y-6">
                  <div className="flex items-center gap-3 text-[#ff7675]">
                    <Paintbrush size={24} />
                    <span className="font-display uppercase tracking-wider text-lg">장식 아이디어</span>
                  </div>
                  <ul className="space-y-4">
                    {recommendation.decorationIdeas.map((idea, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-3 text-gray-600 text-lg"
                      >
                        <span className="text-[#fdcb6e] font-display">0{idx + 1}</span>
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
        <footer className="mt-32 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 text-sm font-display uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Info size={16} />
            Gemini 3 Flash 기반
          </div>
          <div>© 2026 파티 바이브 연구소</div>
        </footer>
      </main>
    </div>
  );
}
