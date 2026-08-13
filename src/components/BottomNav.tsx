import React from 'react';
import { BookOpen, CheckSquare, BarChart3, Bot } from 'lucide-react';
import { motion } from 'motion/react';

export type TabType = 'study' | 'practice' | 'analysis' | 'ai';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'study', label: 'Academics', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: CheckSquare },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'ai', label: 'Bharat AI', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-lg border-t border-[#E6DCCF] px-2 py-1.5 pb-safe shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] rounded-xl transition-all duration-200 group active:scale-95"
            >
              {/* Active Tab Ambient Pill */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-[#F3E8DB] rounded-xl border border-[#E2CEB9]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-[#B85B14] scale-110 font-bold'
                      : 'text-[#7A6B63] group-hover:text-[#382820]'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium mt-1 tracking-tight transition-colors ${
                    isActive ? 'text-[#B85B14] font-black' : 'text-[#7A6B63] group-hover:text-[#382820]'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
