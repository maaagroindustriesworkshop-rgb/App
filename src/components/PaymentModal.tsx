import React, { useState } from 'react';
import { Batch } from '../types';
import { X, CheckCircle, ShieldCheck, Zap, Lock } from 'lucide-react';

interface PaymentModalProps {
  batch: Batch;
  onClose: () => void;
  onPaymentSuccess: (batchId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ batch, onClose, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(batch.id);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#382820]/60 backdrop-blur-sm flex flex-col w-full h-full overflow-y-auto p-4 justify-center">
      <div className="w-full max-w-md mx-auto bg-white border border-[#E6DCCF] rounded-3xl p-5 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F3E8DB] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#F3E8DB] text-[#B85B14] border border-[#E2CEB9] font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#382820]">Enroll in Batch</h3>
              <p className="text-[10px] text-[#7A6B63] font-medium">Curious Bharat Secure Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#7A6B63] hover:text-[#382820] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch Info Card */}
        <div className="bg-[#FAF6F0] border border-[#E6DCCF] rounded-2xl p-3.5 space-y-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3E8DB] text-[#8C4A1B] border border-[#E2CEB9]">
            {batch.category}
          </span>
          <h4 className="text-xs font-bold text-[#382820]">{batch.title}</h4>
          <p className="text-[11px] text-[#7A6B63] font-medium line-clamp-2">{batch.description}</p>
          
          <div className="flex items-baseline space-x-2 pt-2 border-t border-[#E6DCCF]">
            <span className="text-lg font-black text-[#382820]">₹{batch.price}</span>
            {batch.originalPrice && (
              <span className="text-xs text-[#7A6B63] line-through">₹{batch.originalPrice}</span>
            )}
            <span className="text-[10px] font-bold text-[#4D6B40]">
              SAVE {Math.round((1 - batch.price / (batch.originalPrice || batch.price * 2)) * 100)}%
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-1.5 text-[11px] text-[#7A6B63] font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-[#4D6B40] shrink-0" />
            <span>Full Video Lectures + Recorded Backups</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-[#4D6B40] shrink-0" />
            <span>Chapterwise PDF Notes & DPP Solutions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-[#4D6B40] shrink-0" />
            <span>Real-time Multi-device Sync</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2 pt-2">
          <label className="text-[11px] font-bold text-[#382820] block">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'upi', label: 'UPI / GPay' },
              { id: 'card', label: 'Card' },
              { id: 'netbanking', label: 'NetBanking' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedMethod === m.id
                    ? 'bg-[#B85B14] border-[#B85B14] text-white shadow-xs'
                    : 'bg-[#FAF6F0] border-[#E6DCCF] text-[#382820] hover:border-[#B85B14]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full py-3 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold rounded-2xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
        >
          {isProcessing ? (
            <>
              <Zap className="w-4 h-4 animate-spin" />
              <span>Verifying Payment...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Pay ₹{batch.price} & Unlock Instantly</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#7A6B63] font-medium">
          256-bit Encrypted SSL Payment Guarantee
        </p>
      </div>
    </div>
  );
};
