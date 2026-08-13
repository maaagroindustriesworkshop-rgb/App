import React, { useState, useEffect } from 'react';
import { Smartphone, Download, RefreshCw, X, CheckCircle2, ShieldCheck, Globe, Wifi } from 'lucide-react';

interface PwaApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSync?: () => void;
  lastUpdated?: string;
}

export const PwaApkModal: React.FC<PwaApkModalProps> = ({
  isOpen,
  onClose,
  onTriggerSync,
  lastUpdated,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install as App on Android or PC:\n1. Tap browser Menu (⋮)\n2. Select "Add to Home screen" or "Install app".');
    }
  };

  const handleSyncClick = () => {
    setIsSyncing(true);
    if (onTriggerSync) onTriggerSync();
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF6F0] w-full max-w-md rounded-2xl shadow-2xl border border-[#E6DCCF] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[#B85B14] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-amber-200" />
            <h3 className="font-black text-sm tracking-tight">App Installation & Real-Time Sync</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Section 1: Real-Time Sync Across Devices */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-black text-emerald-900">
                <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Real-Time Multi-Device Sync</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Every batch, video, quiz, or test updated by an educator or user is instantly synchronized across all connected phones, tablets, and computers. Pull-to-refresh directly fetches server updates.
            </p>
            {lastUpdated && (
              <p className="text-[10px] font-mono text-emerald-700">
                Last Cloud Sync: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing with Server...' : 'Force Cloud Sync Now'}</span>
            </button>
          </div>

          {/* Section 2: PWA Install & APK Conversion */}
          <div className="p-3.5 bg-[#FFF9F2] border border-[#E2CEB9] rounded-2xl space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-black text-[#382820]">
              <Download className="w-4 h-4 text-[#B85B14]" />
              <span>Install as Android APK / PWA</span>
            </div>
            <p className="text-[11px] text-[#7A6B63] leading-relaxed">
              This Web App is fully PWA configured with a standalone manifest and service worker.
            </p>

            <ul className="text-[11px] text-[#382820] space-y-1.5 pl-1">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B85B14] shrink-0 mt-0.5" />
                <span><strong>Instant Home Screen App:</strong> Tap the button below or browser menu (⋮) → "Add to Home screen".</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B85B14] shrink-0 mt-0.5" />
                <span><strong>APK Conversion:</strong> You can convert this URL directly to an APK using tools like PWABuilder, Web2APK, or Bubblewrap TWA.</span>
              </li>
            </ul>

            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 bg-[#B85B14] hover:bg-[#8C4A1B] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isInstalled ? 'App Installed on Device' : 'Install PWA / Download App'}</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#A0938A] pt-1">
            <Globe className="w-3.5 h-3.5 text-[#B85B14]" />
            <span>Curious Bharat EdTech • Real-Time Cloud Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
