import React from 'react';
import { ShieldCheck, UserCheck, Compass, Smartphone, Key, Wifi } from 'lucide-react';

interface HeaderProps {
  isEducatorLoggedIn: boolean;
  onOpenEducatorPortal: () => void;
  onOpenPwaModal?: () => void;
  onOpenApiKeyModal?: () => void;
  onPullToRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isEducatorLoggedIn,
  onOpenEducatorPortal,
  onOpenPwaModal,
  onOpenApiKeyModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#E6DCCF]/60 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand: Logo + Name */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#B85B14] flex items-center justify-center text-white font-black shadow-xs">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-[#382820]">
              Curious Bharat
            </span>
            <span className="text-[9px] font-bold text-emerald-800 flex items-center gap-1 -mt-0.5">
              <Wifi className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
              <span>Real-Time Sync</span>
            </span>
          </div>
        </div>

        {/* Action Controls: PWA / APK, AI Key, Educator Portal */}
        <div className="flex items-center space-x-1.5">
          {/* PWA / APK Install Info Button */}
          {onOpenPwaModal && (
            <button
              onClick={onOpenPwaModal}
              title="PWA / APK Install & Real-Time Sync"
              className="p-1.5 rounded-xl text-[#382820] hover:bg-[#F3E8DB] border border-transparent hover:border-[#E2CEB9] transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#B85B14]" />
            </button>
          )}

          {/* AI Key Settings */}
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              title="Gemini AI Key Settings"
              className="p-1.5 rounded-xl text-[#382820] hover:bg-[#F3E8DB] border border-transparent hover:border-[#E2CEB9] transition-all cursor-pointer"
            >
              <Key className="w-4 h-4 text-[#B85B14]" />
            </button>
          )}

          {/* Minimal Opacity Educator Portal Access */}
          <button
            onClick={onOpenEducatorPortal}
            title={isEducatorLoggedIn ? "Educator Admin Portal" : "Educator Portal Access"}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-xl border border-transparent hover:border-[#E2CEB9] opacity-40 hover:opacity-100 focus:opacity-100 active:opacity-100 text-[#382820] hover:bg-[#F3E8DB] transition-all duration-300 cursor-pointer text-xs font-bold"
          >
            {isEducatorLoggedIn ? (
              <UserCheck className="w-4 h-4 text-[#B85B14]" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#382820]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

