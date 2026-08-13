import React, { useState, useEffect } from 'react';
import { Gamepad2, Zap, Flame, Trophy, ShieldCheck, Play, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GamesTabProps {
  onOpenEducatorPortal: () => void;
}

type GameType = 'menu' | 'formula_blitz' | 'speed_math';

export const GamesTab: React.FC<GamesTabProps> = ({ onOpenEducatorPortal }) => {
  const [activeGame, setActiveGame] = useState<GameType>('menu');

  // FORMULA BLITZ STATE
  const [blitzScore, setBlitzScore] = useState(0);
  const [blitzCombo, setBlitzCombo] = useState(1);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(30);
  const [blitzIsActive, setBlitzIsActive] = useState(false);
  const [blitzHighscore, setBlitzHighscore] = useState(() => {
    return Number(localStorage.getItem('bharated_blitz_highscore') || '0');
  });

  const formulaQuestions = [
    { concept: 'Kinematic Equation for Final Velocity (v)', correct: 'u + at', wrong1: 'ut + 1/2at²', wrong2: 'u² + 2as' },
    { concept: 'Moment of Inertia of Circular Disc', correct: '1/2 M R²', wrong1: 'M R²', wrong2: '2/5 M R²' },
    { concept: 'De Broglie Wavelength (λ)', correct: 'h / p', wrong1: 'h · p', wrong2: 'p / h' },
    { concept: 'Ideal Gas Law Equation', correct: 'P V = n R T', wrong1: 'P T = n R V', wrong2: 'V T = n R P' },
    { concept: 'Ohm’s Law Equation', correct: 'V = I R', wrong1: 'I = V R', wrong2: 'R = V I' },
    { concept: 'Einstein Energy Mass Equivalence', correct: 'E = m c²', wrong1: 'E = 1/2 m c²', wrong2: 'E = m / c²' },
  ];

  const [currentBlitzIndex, setCurrentBlitzIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const setupBlitzQuestion = (idx: number) => {
    const q = formulaQuestions[idx % formulaQuestions.length];
    const opts = [q.correct, q.wrong1, q.wrong2].sort(() => Math.random() - 0.5);
    setShuffledOptions(opts);
  };

  const startBlitzGame = () => {
    setBlitzScore(0);
    setBlitzCombo(1);
    setBlitzTimeLeft(30);
    setCurrentBlitzIndex(0);
    setupBlitzQuestion(0);
    setBlitzIsActive(true);
    setActiveGame('formula_blitz');
  };

  useEffect(() => {
    let interval: any = null;
    if (blitzIsActive && blitzTimeLeft > 0) {
      interval = setInterval(() => {
        setBlitzTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (blitzTimeLeft === 0 && blitzIsActive) {
      setBlitzIsActive(false);
      if (blitzScore > blitzHighscore) {
        setBlitzHighscore(blitzScore);
        localStorage.setItem('bharated_blitz_highscore', blitzScore.toString());
      }
    }
    return () => clearInterval(interval);
  }, [blitzIsActive, blitzTimeLeft, blitzScore, blitzHighscore]);

  const handleAnswerBlitz = (selectedOption: string) => {
    if (!blitzIsActive) return;

    const currentQ = formulaQuestions[currentBlitzIndex % formulaQuestions.length];
    if (selectedOption === currentQ.correct) {
      const addedPoints = 100 * blitzCombo;
      setBlitzScore((prev) => prev + addedPoints);
      setBlitzCombo((prev) => Math.min(prev + 1, 5));
    } else {
      setBlitzCombo(1);
    }

    const nextIdx = currentBlitzIndex + 1;
    setCurrentBlitzIndex(nextIdx);
    setupBlitzQuestion(nextIdx);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header */}
      <div className="bg-white border border-[#E6DCCF] rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-[#B85B14] font-bold">
            <Zap className="w-4 h-4 fill-[#B85B14]" />
            <span>Cognitive Speed Learning</span>
          </div>
          <h2 className="text-base font-black text-[#382820]">Dopamine Learning Games</h2>
          <p className="text-[10px] text-[#7A6B63] font-medium">High-speed mental math, formulas & recall blitz</p>
        </div>

        {/* Educator Batch Settings Control Button */}
        <button
          onClick={onOpenEducatorPortal}
          className="px-3 py-2 bg-[#B85B14] hover:bg-[#A04812] text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 active:scale-95 transition-all shrink-0"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Batch Admin Settings</span>
        </button>
      </div>

      {activeGame === 'menu' && (
        <div className="space-y-3">
          
          {/* GAME 1: FORMULA BLITZ */}
          <div className="bg-[#F3E8DB] border border-[#E2CEB9] rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#EAE0D2] text-[#8C4A1B] border border-[#D9C4B0] uppercase">
                SPEED & RECALL
              </span>
              <div className="flex items-center space-x-1 text-xs text-[#B85B14] font-bold">
                <Trophy className="w-3.5 h-3.5" />
                <span>Highscore: {blitzHighscore}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-[#382820] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#B85B14]" /> Formula Blitz 30s
              </h3>
              <p className="text-[11px] text-[#7A6B63] font-medium mt-0.5">
                Rapid-fire physics & math formula matching! Build combo multipliers and test recall speed under time pressure.
              </p>
            </div>

            <button
              onClick={startBlitzGame}
              className="w-full py-2.5 bg-[#B85B14] hover:bg-[#A04812] text-white font-black rounded-xl text-xs shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Formula Blitz Game</span>
            </button>
          </div>

          {/* EDUCATOR SHORTCUT BANNER */}
          <div className="bg-white border border-[#E6DCCF] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[#382820]">Upload Batch Material from Games Portal</h4>
              <p className="text-[10px] text-[#7A6B63] font-medium">Add notes, DPPs, tests, or change batch prices</p>
            </div>
            <button
              onClick={onOpenEducatorPortal}
              className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#F3E8DB] text-[#B85B14] border border-[#E6DCCF] rounded-xl text-xs font-bold shrink-0"
            >
              Control Portal
            </button>
          </div>

        </div>
      )}

      {/* ACTIVE GAME: FORMULA BLITZ */}
      {activeGame === 'formula_blitz' && (
        <div className="bg-white border border-[#E6DCCF] rounded-2xl p-4 space-y-4 shadow-md">
          
          {/* Game Top Bar */}
          <div className="flex items-center justify-between border-b border-[#F3E8DB] pb-3">
            <div className="flex items-center space-x-3">
              <div className="text-center px-3 py-1 bg-[#FAF6F0] rounded-xl border border-[#E6DCCF]">
                <span className="text-[9px] text-[#7A6B63] block font-bold">TIME</span>
                <span className={`text-base font-black ${blitzTimeLeft <= 5 ? 'text-rose-600 animate-ping' : 'text-[#B85B14]'}`}>
                  {blitzTimeLeft}s
                </span>
              </div>

              <div className="text-center px-3 py-1 bg-[#FAF6F0] rounded-xl border border-[#E6DCCF]">
                <span className="text-[9px] text-[#7A6B63] block font-bold">SCORE</span>
                <span className="text-base font-black text-[#382820]">{blitzScore}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-[#F3E8DB] text-[#8C4A1B] border border-[#E2CEB9]">
                {blitzCombo}x COMBO 🔥
              </span>
              <button
                onClick={() => setActiveGame('menu')}
                className="p-1.5 text-[#7A6B63] hover:text-[#382820] rounded-lg bg-[#FAF6F0] font-bold text-xs"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Gameplay Area */}
          {blitzIsActive ? (
            <div className="space-y-4">
              <div className="bg-[#FAF6F0] border border-[#E6DCCF] p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-[#7A6B63] font-bold uppercase tracking-wider">Select Correct Formula For</span>
                <h3 className="text-sm font-black text-[#382820]">
                  {formulaQuestions[currentBlitzIndex % formulaQuestions.length].concept}
                </h3>
              </div>

              <div className="space-y-2">
                {shuffledOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerBlitz(opt)}
                    className="w-full py-3 px-4 bg-[#FAF6F0] hover:bg-[#F3E8DB] border border-[#E6DCCF] hover:border-[#B85B14] rounded-xl text-xs font-bold text-[#382820] tracking-wide transition-all active:scale-98 text-left flex items-center justify-between shadow-xs"
                  >
                    <span>{opt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#B85B14]" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* GAME OVER SUMMARY */
            <div className="text-center space-y-3 py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F3E8DB] text-[#8C4A1B] flex items-center justify-center font-black text-2xl border border-[#E2CEB9]">
                {blitzScore}
              </div>
              <h3 className="text-base font-black text-[#382820]">Game Over!</h3>
              <p className="text-xs text-[#7A6B63] font-medium">
                Highscore: <span className="text-[#B85B14] font-bold">{blitzHighscore}</span>
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={startBlitzGame}
                  className="flex-1 py-2.5 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={() => setActiveGame('menu')}
                  className="flex-1 py-2.5 bg-[#FAF6F0] text-[#382820] hover:bg-[#F3E8DB] border border-[#E6DCCF] font-bold rounded-xl text-xs"
                >
                  Back to Games
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
