import React, { useState } from 'react';
import { Batch, AdvertisementBanner } from '../../types';
import { Layers, Star, Users, Lock, Play, ArrowRight, Sparkles } from 'lucide-react';

interface StudyTabProps {
  batches: Batch[];
  banners: AdvertisementBanner[];
  purchasedBatchIds: string[];
  onSelectBatch: (batch: Batch) => void;
  onOpenPaymentModal: (batch: Batch) => void;
}

export const StudyTab: React.FC<StudyTabProps> = ({
  batches,
  banners,
  purchasedBatchIds,
  onSelectBatch,
  onOpenPaymentModal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const categories = ['All', 'Physics & Cosmos', 'Chemistry & Matter', 'Biology & Life', 'Maths & Logic'];

  const filteredBatches = batches.filter((b) => {
    if (selectedFilter === 'All') return true;
    return b.category === selectedFilter;
  });

  return (
    <div className="space-y-4 pb-20">
      
      {/* Subject Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              selectedFilter === cat
                ? 'bg-[#B85B14] border-[#B85B14] text-white shadow-xs'
                : 'bg-white border-[#E6DCCF] text-[#7A6B63] hover:text-[#382820] hover:border-[#D9C4B0]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {filteredBatches.map((batch) => {
          const isUnlocked = !batch.isPaid || purchasedBatchIds.includes(batch.id);

          return (
            <div
              key={batch.id}
              className="bg-white border border-[#E6DCCF] rounded-2xl overflow-hidden hover:border-[#B85B14]/40 transition-all shadow-xs group"
            >
              {/* Card Header Banner */}
              <div className="p-4 bg-gradient-to-r from-[#B85B14] via-[#C86D27] to-[#D99B5A] relative text-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-black/30 backdrop-blur-md border border-white/20 uppercase tracking-wide">
                    {batch.thumbnailTag}
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                    <span>{batch.rating}</span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-white drop-shadow-xs">{batch.title}</h3>
                <p className="text-[10px] text-white/90 font-medium line-clamp-1">{batch.subtitle}</p>
              </div>

              {/* Card Body */}
              <div className="p-3.5 space-y-3">
                <p className="text-[11px] text-[#7A6B63] font-medium line-clamp-2 leading-relaxed">
                  {batch.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#7A6B63] font-medium pt-1 border-t border-[#F3E8DB]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#B85B14]" />
                    {batch.enrolledCount.toLocaleString()} Explorers
                  </span>
                  <span>{batch.contents?.length || 0} Lessons & Experiments</span>
                </div>

                {/* Price & Action Button */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {batch.isPaid ? (
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-black text-[#382820]">₹{batch.price}</span>
                        {batch.originalPrice && (
                          <span className="text-xs text-[#7A6B63] line-through">₹{batch.originalPrice}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-black text-[#6A7B58]">100% FREE</span>
                    )}
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectBatch(batch)}
                      className="px-4 py-2 bg-[#6A7B58] hover:bg-[#586A47] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Explore Module</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenPaymentModal(batch)}
                      className="px-4 py-2 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Enroll Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
