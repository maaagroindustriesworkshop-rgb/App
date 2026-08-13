import React, { useState } from 'react';
import { Key, CheckCircle, X, Shield, Sparkles } from 'lucide-react';
import { getCustomGeminiKey, saveCustomGeminiKey } from '../lib/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(() => getCustomGeminiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomGeminiKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    saveCustomGeminiKey('');
    setApiKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF6F0] w-full max-w-md rounded-2xl shadow-2xl border border-[#E6DCCF] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[#B85B14] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-amber-200 animate-pulse" />
            <h3 className="font-black text-sm tracking-tight">Gemini AI Key Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="p-3 bg-[#FFF9F2] border border-[#E2CEB9] rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#382820]">
              <Sparkles className="w-4 h-4 text-[#B85B14]" />
              <span>Dedicated Chatbot & Practice Key</span>
            </div>
            <p className="text-[11px] text-[#7A6B63] leading-relaxed">
              Curious Bharat includes a built-in server AI key. If you are building/deploying your own <strong>APK / PWA</strong> or hit API quota limits, you can enter an additional personal Gemini API key here.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#382820] flex items-center justify-between">
              <span>Gemini API Key</span>
              {getCustomGeminiKey() && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Custom Key Active
                </span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-white border border-[#E6DCCF] rounded-xl p-3 text-xs text-[#382820] placeholder-[#A0938A] font-mono focus:outline-none focus:border-[#B85B14] shadow-xs"
            />
            <p className="text-[10px] text-[#A0938A]">
              Get a free API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[#B85B14] underline font-bold">Google AI Studio</a>.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Custom Gemini API Key updated successfully!</span>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#B85B14] text-white font-bold text-xs rounded-xl hover:bg-[#8C4A1B] active:scale-98 transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Key className="w-4 h-4" />
              <span>Save AI Key</span>
            </button>

            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 bg-red-50 text-red-700 border border-red-200 font-bold text-xs rounded-xl hover:bg-red-100 active:scale-98 transition-all cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] text-[#A0938A] justify-center pt-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stored securely in browser local storage. Never shared.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
