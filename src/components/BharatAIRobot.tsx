import React from 'react';
import { motion } from 'motion/react';
import { Bot } from 'lucide-react';

interface BharatAIRobotProps {
  onOpenAITab?: () => void;
}

export const BharatAIRobot: React.FC<BharatAIRobotProps> = ({ onOpenAITab }) => {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -300, right: 20, top: -500, bottom: 20 }}
      dragElastic={0.1}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 right-4 z-50 cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={onOpenAITab}
        title="Open Bharat AI"
        className="relative group p-3.5 rounded-2xl bg-gradient-to-tr from-[#B85B14] via-[#C86D27] to-[#D99B5A] text-white shadow-lg border border-white/30 flex items-center justify-center transition-all"
      >
        {/* Glowing robot indicator */}
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#6A7B58] border-2 border-white animate-ping" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#6A7B58] border-2 border-white" />

        <Bot className="w-6 h-6 text-white drop-shadow-xs" />

        {/* Label Tooltip */}
        <span className="absolute -left-20 bg-[#382820] text-white text-[11px] font-bold px-2 py-1 rounded-md border border-[#7A6B63] shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Bharat AI
        </span>
      </button>
    </motion.div>
  );
};
