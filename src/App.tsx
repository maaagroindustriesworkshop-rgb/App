import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { BharatAIRobot } from './components/BharatAIRobot';
import { StudyTab } from './components/tabs/StudyTab';
import { PracticeTab } from './components/tabs/PracticeTab';
import { AnalysisTab } from './components/tabs/AnalysisTab';
import { BharatAITab } from './components/tabs/BharatAITab';
import { FolderModal } from './components/FolderModal';
import { PaymentModal } from './components/PaymentModal';
import { EducatorPortalModal } from './components/EducatorPortalModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PwaApkModal } from './components/PwaApkModal';
import { fetchAppState, syncAppState } from './lib/api';
import { Batch, AdvertisementBanner } from './types';
import { RefreshCw, ArrowDown } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('study');
  
  // App Sync State
  const [batches, setBatches] = useState<Batch[]>([]);
  const [banners, setBanners] = useState<AdvertisementBanner[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Pull to refresh touch states
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Educator Auth state
  const [isEducatorLoggedIn, setIsEducatorLoggedIn] = useState(false);
  const [isEducatorModalOpen, setIsEducatorModalOpen] = useState(false);

  // Purchased Batch IDs state (persisted locally)
  const [purchasedBatchIds, setPurchasedBatchIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('bharated_purchased_batches');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Modal active targets
  const [selectedFolderBatch, setSelectedFolderBatch] = useState<Batch | null>(null);
  const [paymentBatch, setPaymentBatch] = useState<Batch | null>(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Initial load & real-time sync
  const loadState = async () => {
    try {
      const data = await fetchAppState();
      if (data && data.batches) {
        setBatches(data.batches);
        setSelectedFolderBatch(prev => {
          if (!prev) return null;
          const updated = data.batches.find(b => b.id === prev.id);
          return updated || prev;
        });
      }
      if (data && data.banners) setBanners(data.banners);
      if (data && data.lastServerUpdate) setLastUpdated(data.lastServerUpdate);
    } catch (err: any) {
      // Quietly log warning on background sync glitch to avoid breaking UI state
      console.warn('Background sync status:', err?.message || 'Reconnecting...');
    }
  };

  useEffect(() => {
    loadState();
    // Ultra-fast real-time background sync every 1.5 seconds across all devices
    const interval = setInterval(() => {
      loadState();
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Pull-to-refresh handler
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    try {
      const syncedData = await syncAppState();
      if (syncedData.batches) setBatches(syncedData.batches);
      if (syncedData.banners) setBanners(syncedData.banners);
      if (syncedData.lastServerUpdate) setLastUpdated(syncedData.lastServerUpdate);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setPullY(0);
      }, 600);
    }
  };

  // Touch Handlers for Pull-To-Refresh Gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 || (containerRef.current && containerRef.current.scrollTop === 0)) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current > 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;
      if (diff > 0) {
        setPullY(Math.min(diff * 0.4, 80));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 50 && !isRefreshing) {
      handlePullToRefresh();
    } else {
      setPullY(0);
    }
    touchStartY.current = 0;
  };

  const handlePaymentSuccess = (batchId: string) => {
    const updated = [...purchasedBatchIds, batchId];
    setPurchasedBatchIds(updated);
    localStorage.setItem('bharated_purchased_batches', JSON.stringify(updated));
    setPaymentBatch(null);

    // Automatically open the batch folder after purchase!
    const batch = batches.find(b => b.id === batchId);
    if (batch) setSelectedFolderBatch(batch);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#382820] font-sans select-none antialiased selection:bg-[#B85B14] selection:text-white">
      {/* Primary Mobile App Frame Container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="max-w-md mx-auto min-h-screen flex flex-col bg-[#FAF6F0] border-x border-[#E6DCCF] shadow-xl relative pb-16 transition-transform duration-150"
        style={{ transform: pullY > 0 ? `translateY(${pullY}px)` : 'none' }}
      >
        
        {/* Pull To Refresh Gesture Banner */}
        {pullY > 0 && (
          <div className="absolute top-0 left-0 right-0 -translate-y-full h-12 flex items-center justify-center bg-[#F3E8DB] border-b border-[#E2CEB9] text-[#B85B14] text-xs font-bold gap-2 shadow-inner z-40">
            <RefreshCw className={`w-4 h-4 ${pullY > 50 || isRefreshing ? 'animate-spin' : ''}`} />
            <span>{pullY > 50 ? 'Release to Refresh Data' : 'Pull down to refresh'}</span>
          </div>
        )}

        {/* Top Header */}
        <Header
          isEducatorLoggedIn={isEducatorLoggedIn}
          onOpenEducatorPortal={() => setIsEducatorModalOpen(true)}
          onOpenPwaModal={() => setIsPwaModalOpen(true)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onPullToRefresh={handlePullToRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Main Tab Content View - Occupies Full Screen Container */}
        <main className="flex-1 p-3.5 space-y-4">
          {activeTab === 'study' && (
            <StudyTab
              batches={batches}
              banners={banners}
              purchasedBatchIds={purchasedBatchIds}
              onSelectBatch={(batch) => setSelectedFolderBatch(batch)}
              onOpenPaymentModal={(batch) => setPaymentBatch(batch)}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeTab />
          )}

          {activeTab === 'analysis' && <AnalysisTab />}

          {activeTab === 'ai' && (
            <BharatAITab />
          )}
        </main>

        {/* Floating Draggable Robot Tutor "Bharat AI" */}
        <BharatAIRobot onOpenAITab={() => setActiveTab('ai')} />

        {/* Bottom 5-Tab Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
        />

        {/* MODALS */}

        {/* 1. Full-Screen Batch Folder View Modal (Videos, PDFs, DPPs, Tests) */}
        {selectedFolderBatch && (
          <FolderModal
            batch={selectedFolderBatch}
            onClose={() => setSelectedFolderBatch(null)}
            onRefreshBatchData={loadState}
          />
        )}

        {/* 2. Payment Gateway Simulation Modal */}
        {paymentBatch && (
          <PaymentModal
            batch={paymentBatch}
            onClose={() => setPaymentBatch(null)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* 3. Educator Backend Admin Portal Modal */}
        {isEducatorModalOpen && (
          <EducatorPortalModal
            batches={batches}
            isLoggedIn={isEducatorLoggedIn}
            onLoginSuccess={() => setIsEducatorLoggedIn(true)}
            onLogout={() => setIsEducatorLoggedIn(false)}
            onClose={() => setIsEducatorModalOpen(false)}
            onRefreshData={loadState}
          />
        )}

        {/* 4. PWA / APK Install & Real-Time Sync Modal */}
        <PwaApkModal
          isOpen={isPwaModalOpen}
          onClose={() => setIsPwaModalOpen(false)}
          onTriggerSync={handlePullToRefresh}
          lastUpdated={lastUpdated}
        />

        {/* 5. Custom Gemini API Key Settings Modal */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
        />

      </div>
    </div>
  );
}
