import React, { useState } from 'react';
import { Batch, ContentItem } from '../types';
import { loginEducator, createBatch, updateBatch, addBatchContent, deleteBatch, formatQuizFromRawText, generateQuizFromRandomText } from '../lib/api';
import { X, ShieldCheck, Plus, Trash2, Video, FileText, BookOpen, FileCheck, LogOut, CheckCircle2, RefreshCw, Image, Edit3, Settings, Sparkles, Wand2, HelpCircle, FileQuestion, Check, AlertCircle } from 'lucide-react';

interface EducatorPortalModalProps {
  batches: Batch[];
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  onClose: () => void;
  onRefreshData: () => void;
}

export const EducatorPortalModal: React.FC<EducatorPortalModalProps> = ({
  batches,
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  onClose,
  onRefreshData,
}) => {
  // Login form
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Dashboard views
  const [activeTab, setActiveTab] = useState<'batches' | 'add_batch' | 'customize' | 'add_content'>('batches');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');

  // New Batch Form
  const [newBatchTitle, setNewBatchTitle] = useState('');
  const [newBatchCategory, setNewBatchCategory] = useState('Physics & Cosmos');
  const [newBatchDesc, setNewBatchDesc] = useState('');
  const [newBatchIsPaid, setNewBatchIsPaid] = useState(false);
  const [newBatchPrice, setNewBatchPrice] = useState('0');
  const [newBatchThumbnail, setNewBatchThumbnail] = useState('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80');
  const [newBatchHeroImage, setNewBatchHeroImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80');

  // Edit/Customize Batch Form
  const [editBatchId, setEditBatchId] = useState<string>(batches[0]?.id || '');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Physics & Cosmos');
  const [editDesc, setEditDesc] = useState('');
  const [editIsPaid, setEditIsPaid] = useState(true);
  const [editPrice, setEditPrice] = useState('2999');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editHeroImage, setEditHeroImage] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // New Content Form
  const [contentCategory, setContentCategory] = useState<string>('videos');
  const [contentType, setContentType] = useState<'video' | 'pdf' | 'dpp' | 'test'>('video');
  const [contentTitle, setContentTitle] = useState('');
  const [contentDesc, setContentDesc] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [contentFileSize, setContentFileSize] = useState('3.2 MB');

  // Test question builder & AI Paste Formatter
  const [rawPastedQuestions, setRawPastedQuestions] = useState('');
  const [isFormattingQuiz, setIsFormattingQuiz] = useState(false);
  const [formatSuccessMsg, setFormatSuccessMsg] = useState('');
  const [isQuestionsCompactScroll, setIsQuestionsCompactScroll] = useState(false);

  // NEW: Random Text Question Generator & Verification Modal State
  const [randomPastedText, setRandomPastedText] = useState('');
  const [isGeneratingFromRandomText, setIsGeneratingFromRandomText] = useState(false);
  const [verificationModalQuestions, setVerificationModalQuestions] = useState<any[] | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [testQuestions, setTestQuestions] = useState([
    {
      id: 'q1',
      question: 'Sample Physics Question?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
      explanation: 'Clear explanation for Option A.',
    },
  ]);

  const handleGenerateFromRandomText = async () => {
    if (!randomPastedText.trim()) {
      alert('Please paste any random text or notes first.');
      return;
    }
    setIsGeneratingFromRandomText(true);
    setFormatSuccessMsg('');
    try {
      const res = await generateQuizFromRandomText(randomPastedText);
      if (res.success && res.questions && res.questions.length > 0) {
        setVerificationModalQuestions(res.questions);
        setShowVerificationModal(true);
      } else {
        alert(res.message || 'Could not generate questions from the provided text.');
      }
    } catch {
      alert('Failed to generate questions from text. Please try again.');
    } finally {
      setIsGeneratingFromRandomText(false);
    }
  };

  const handleAllowVerificationQuestions = () => {
    if (!verificationModalQuestions) return;
    setTestQuestions(verificationModalQuestions);
    setShowVerificationModal(false);
    setVerificationModalQuestions(null);
    setFormatSuccessMsg(`🎉 Verification Approved! ${verificationModalQuestions.length} AI-restructured questions loaded into the Test section below.`);
  };

  const handleDismissVerificationQuestions = () => {
    setShowVerificationModal(false);
    setVerificationModalQuestions(null);
    alert('Generation dismissed. The questions were cancelled and not added to the test section.');
  };

  const handleFormatPastedQuiz = async () => {
    if (!rawPastedQuestions.trim()) {
      alert('Please paste some raw question text first.');
      return;
    }
    setIsFormattingQuiz(true);
    setFormatSuccessMsg('');
    try {
      const res = await formatQuizFromRawText(rawPastedQuestions);
      if (res.success && res.questions && res.questions.length > 0) {
        setTestQuestions(res.questions);
        setFormatSuccessMsg(`🎉 AI successfully formatted ${res.questions.length} questions! Review and edit them below before saving.`);
      } else {
        alert(res.message || 'Failed to format quiz from pasted text.');
      }
    } catch {
      alert('Failed to format quiz. Please try again.');
    } finally {
      setIsFormattingQuiz(false);
    }
  };

  const handleAddQuestion = () => {
    setTestQuestions([
      ...testQuestions,
      {
        id: `q-${Date.now()}`,
        question: 'New Question Text?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        explanation: 'Step-by-step solution explanation.',
      },
    ]);
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updated = [...testQuestions];
    if (field === 'question') updated[index].question = value;
    if (field === 'explanation') updated[index].explanation = value;
    if (field === 'correctIndex') updated[index].correctIndex = Number(value);
    setTestQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...testQuestions];
    updated[qIndex].options[optIndex] = value;
    setTestQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    if (testQuestions.length <= 1) {
      alert('A test must have at least 1 question.');
      return;
    }
    setTestQuestions(testQuestions.filter((_, i) => i !== index));
  };

  const presetThumbnails = [
    { label: 'Physics / Math STEM', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' },
    { label: 'Organic Chemistry', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80' },
    { label: 'Medical Biology', url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Class 10 Foundation', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80' },
  ];

  const presetHeroBanners = [
    { label: 'Modern Digital Classroom', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Interactive Library', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Science & Lab Technology', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1000&auto=format&fit=crop&q=80' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await loginEducator(userId, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setLoginError(res.message || 'Invalid credentials');
      }
    } catch {
      setLoginError('Server authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadBatchToEdit = (batchId: string) => {
    const target = batches.find((b) => b.id === batchId);
    if (target) {
      setEditBatchId(target.id);
      setEditTitle(target.title);
      setEditCategory(target.category);
      setEditDesc(target.description);
      setEditIsPaid(target.isPaid);
      setEditPrice(target.price.toString());
      setEditThumbnail(target.thumbnailUrl || '');
      setEditHeroImage(target.heroImageUrl || '');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchTitle || !newBatchDesc) return;

    await createBatch({
      title: newBatchTitle,
      subtitle: `${newBatchCategory} Special`,
      description: newBatchDesc,
      category: newBatchCategory,
      isPaid: newBatchIsPaid,
      price: newBatchIsPaid ? Number(newBatchPrice) : 0,
      thumbnailUrl: newBatchThumbnail,
      heroImageUrl: newBatchHeroImage,
      educatorName: 'Curious Bharat Master Educator',
    });

    setNewBatchTitle('');
    setNewBatchDesc('');
    onRefreshData();
    setActiveTab('batches');
  };

  const handleSaveEditBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBatchId || !editTitle) return;

    setIsSavingEdit(true);
    try {
      await updateBatch(editBatchId, {
        title: editTitle,
        category: editCategory,
        description: editDesc,
        isPaid: editIsPaid,
        price: editIsPaid ? Number(editPrice) : 0,
        thumbnailUrl: editThumbnail,
        heroImageUrl: editHeroImage,
      });

      onRefreshData();
      setActiveTab('batches');
    } catch (err) {
      alert('Failed to update batch customization');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId || !contentTitle) return;

    await addBatchContent(selectedBatchId, {
      folderCategory: contentCategory,
      type: contentType,
      title: contentTitle,
      description: contentDesc,
      url: contentUrl,
      fileSize: contentType === 'pdf' || contentType === 'dpp' ? contentFileSize : undefined,
      questions: contentType === 'test' ? testQuestions : undefined,
    });

    setContentTitle('');
    setContentDesc('');
    setContentUrl('');
    onRefreshData();
    setActiveTab('batches');
  };

  // Delete confirmation state
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteBatch = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteBatch(id);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete batch:', err);
    } finally {
      setIsDeleting(false);
      setDeletingBatchId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#382820]/60 backdrop-blur-sm flex flex-col w-full h-full overflow-hidden">
      <div className="w-full h-full bg-[#FAF6F0] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#E6DCCF] flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F3E8DB] text-[#B85B14] border border-[#E2CEB9] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-[#B85B14]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#382820]">Curious Bharat Admin</h3>
              <p className="text-[10px] text-[#7A6B63] font-medium">Batch Editor, Thumbnail Uploader & Content Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-[#7A6B63] hover:text-[#382820] rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOGIN SCREEN */}
        {!isLoggedIn ? (
          <div className="flex-1 p-6 flex flex-col justify-center space-y-4 max-w-md mx-auto w-full">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F3E8DB] text-[#B85B14] border border-[#E2CEB9] flex items-center justify-center mb-2 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-[#B85B14]" />
              </div>
              <h4 className="text-base font-extrabold text-[#382820]">Educator Authentication</h4>
              <p className="text-xs text-[#7A6B63]">Sign in to customize batch hero images, thumbnails, and materials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-[#382820] block mb-1">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User ID"
                  className="w-full bg-white border border-[#E6DCCF] rounded-xl px-3.5 py-2.5 text-xs text-[#382820] placeholder-[#A0938A] focus:outline-none focus:border-[#B85B14] font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#382820] block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-white border border-[#E6DCCF] rounded-xl px-3.5 py-2.5 text-xs text-[#382820] placeholder-[#A0938A] focus:outline-none focus:border-[#B85B14] font-medium"
                  required
                />
              </div>

              {loginError && (
                <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 text-center font-medium">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-[#B85B14] hover:bg-[#A04F11] text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer active:scale-95"
              >
                {isLoggingIn ? 'Authenticating...' : 'Access Admin Portal'}
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF6F0]">
            
            {/* Top Admin Nav */}
            <div className="flex border-b border-[#E6DCCF] bg-white px-3 py-2 gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: 'batches', label: 'Manage Batches' },
                { id: 'add_batch', label: '+ New Batch' },
                { id: 'customize', label: '🎨 Batch Customization' },
                { id: 'add_content', label: '+ Add Materials' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id as any);
                    if (t.id === 'customize' && batches[0]) {
                      loadBatchToEdit(batches[0].id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-[#B85B14] text-white shadow-xs'
                      : 'bg-[#F5EFEB] text-[#7A6B63] border border-[#E6DCCF] hover:text-[#382820] hover:bg-[#E2CEB9]/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Admin Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-xl mx-auto w-full">
              
              {/* VIEW 1: MANAGE BATCHES */}
              {activeTab === 'batches' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#382820]">Active Live Batches ({batches.length})</h4>
                    <button
                      onClick={onRefreshData}
                      className="text-[10px] font-bold text-[#B85B14] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Sync State
                    </button>
                  </div>

                  {batches.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-[#E6DCCF] rounded-2xl p-3.5 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        {/* Batch Thumbnail preview */}
                        <div className="w-16 h-16 rounded-xl bg-[#F5EFEB] border border-[#E6DCCF] overflow-hidden shrink-0 relative">
                          {b.thumbnailUrl ? (
                            <img src={b.thumbnailUrl} alt={b.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#7A6B63] font-bold">
                              No Thumb
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F3E8DB] text-[#B85B14] border border-[#E2CEB9]">
                            {b.category}
                          </span>
                          <h5 className="text-xs font-bold text-[#382820] mt-1 truncate">{b.title}</h5>
                          <p className="text-[10px] text-[#7A6B63] font-medium">
                            {b.isPaid ? `Price: ₹${b.price}` : '100% FREE'} • {b.contents?.length || 0} Contents
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              loadBatchToEdit(b.id);
                              setActiveTab('customize');
                            }}
                            className="p-1.5 text-[#B85B14] hover:bg-[#F3E8DB] rounded-lg transition-colors cursor-pointer"
                            title="Customize Hero & Thumbnail"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingBatchId(b.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inline Delete Confirmation */}
                      {deletingBatchId === b.id && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
                          <span className="font-bold text-rose-800 text-[11px]">Delete this batch permanently?</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteBatch(b.id)}
                              disabled={isDeleting}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button
                              onClick={() => setDeletingBatchId(null)}
                              disabled={isDeleting}
                              className="px-2.5 py-1 bg-[#E6DCCF] hover:bg-[#D5C8B8] text-[#382820] font-bold rounded-lg text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content summary */}
                      <div className="pt-2 border-t border-[#E6DCCF] flex items-center justify-between text-[10px] text-[#7A6B63]">
                        <span>Enrolled: {b.enrolledCount} students</span>
                        <button
                          onClick={() => {
                            setSelectedBatchId(b.id);
                            setActiveTab('add_content');
                          }}
                          className="text-[#B85B14] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Content
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW 2: ADD NEW BATCH WITH THUMBNAIL & HERO IMAGE */}
              {activeTab === 'add_batch' && (
                <form onSubmit={handleCreateBatch} className="space-y-3 text-xs bg-white p-4 rounded-2xl border border-[#E6DCCF] shadow-xs">
                  <h4 className="text-xs font-black text-[#382820] border-b border-[#E6DCCF] pb-2">Create New Batch</h4>

                  <div>
                    <label className="text-[11px] font-bold text-[#382820] block mb-1">Batch Title</label>
                    <input
                      type="text"
                      value={newBatchTitle}
                      onChange={(e) => setNewBatchTitle(e.target.value)}
                      placeholder="e.g. Target JEE Advanced 2026 Physics Sprint"
                      className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] placeholder-[#A0938A] focus:outline-none focus:border-[#B85B14] font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#382820] block mb-1">Subject Field / Category</label>
                    <input
                      type="text"
                      value={newBatchCategory}
                      onChange={(e) => setNewBatchCategory(e.target.value)}
                      placeholder="e.g. Physics & Cosmos, Organic Chemistry, Mathematics..."
                      className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] font-medium text-xs focus:outline-none focus:border-[#B85B14]"
                    />
                    <div className="flex gap-1 overflow-x-auto pt-1">
                      {['Physics & Cosmos', 'Chemistry & Matter', 'Biology & Life', 'Maths & Logic'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewBatchCategory(cat)}
                          className={`shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            newBatchCategory === cat
                              ? 'bg-[#B85B14] text-white border-[#B85B14]'
                              : 'bg-[#F5EFEB] text-[#7A6B63] border-[#E6DCCF] hover:bg-[#E2CEB9]/50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#382820] block mb-1">Description</label>
                    <textarea
                      value={newBatchDesc}
                      onChange={(e) => setNewBatchDesc(e.target.value)}
                      placeholder="Detailed course description, schedule, and features..."
                      rows={3}
                      className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] placeholder-[#A0938A] focus:outline-none focus:border-[#B85B14] font-medium"
                      required
                    />
                  </div>

                  {/* Batch Thumbnail URL */}
                  <div className="space-y-1.5 p-3 bg-[#F5EFEB] rounded-xl border border-[#E6DCCF]">
                    <label className="text-[11px] font-bold text-[#382820] flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-[#B85B14]" />
                      Batch Thumbnail URL
                    </label>
                    <input
                      type="text"
                      value={newBatchThumbnail}
                      onChange={(e) => setNewBatchThumbnail(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-white border border-[#E6DCCF] rounded-lg px-2.5 py-1.5 text-[#382820] text-xs font-mono"
                    />
                    <div className="flex gap-1 overflow-x-auto pt-1">
                      {presetThumbnails.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewBatchThumbnail(p.url)}
                          className="shrink-0 text-[9px] font-semibold px-2 py-0.5 bg-white border border-[#E6DCCF] rounded text-[#7A6B63] hover:text-[#B85B14] cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Front Hero Image URL */}
                  <div className="space-y-1.5 p-3 bg-[#F5EFEB] rounded-xl border border-[#E6DCCF]">
                    <label className="text-[11px] font-bold text-[#382820] flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-[#B85B14]" />
                      Front Hero Image URL (Banner Header)
                    </label>
                    <input
                      type="text"
                      value={newBatchHeroImage}
                      onChange={(e) => setNewBatchHeroImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-white border border-[#E6DCCF] rounded-lg px-2.5 py-1.5 text-[#382820] text-xs font-mono"
                    />
                    <div className="flex gap-1 overflow-x-auto pt-1">
                      {presetHeroBanners.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewBatchHeroImage(p.url)}
                          className="shrink-0 text-[9px] font-semibold px-2 py-0.5 bg-white border border-[#E6DCCF] rounded text-[#7A6B63] hover:text-[#B85B14] cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBatchIsPaid}
                        onChange={(e) => setNewBatchIsPaid(e.target.checked)}
                        className="rounded border-[#E6DCCF] accent-[#B85B14]"
                      />
                      <span className="text-[#382820] font-bold">Paid Batch</span>
                    </label>

                    {newBatchIsPaid && (
                      <div className="flex items-center space-x-1">
                        <span className="text-[#7A6B63] font-semibold">Price (₹):</span>
                        <input
                          type="number"
                          value={newBatchPrice}
                          onChange={(e) => setNewBatchPrice(e.target.value)}
                          className="w-24 bg-[#FAF6F0] border border-[#E6DCCF] rounded-lg px-2 py-1 text-[#382820] font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#B85B14] hover:bg-[#A04F11] text-white font-bold rounded-xl text-xs mt-2 shadow-sm cursor-pointer active:scale-95 transition-all"
                  >
                    Publish Batch to Live App
                  </button>
                </form>
              )}

              {/* VIEW 3: BATCH CUSTOMIZATION SECTION (THUMBNAILS & HERO BANNERS) */}
              {activeTab === 'customize' && (
                <form onSubmit={handleSaveEditBatch} className="space-y-3.5 text-xs bg-white p-4 rounded-2xl border border-[#E6DCCF] shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E6DCCF] pb-2">
                    <h4 className="text-xs font-black text-[#382820] flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-[#B85B14]" />
                      Batch Customization & Visual Editor
                    </h4>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#382820] block mb-1">Select Batch to Customize</label>
                    <select
                      value={editBatchId}
                      onChange={(e) => loadBatchToEdit(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] font-bold"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#382820] block mb-1">Batch Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] font-medium"
                      required
                    />
                  </div>

                  {/* Thumbnail URL Customization */}
                  <div className="space-y-2 p-3 bg-[#F5EFEB] rounded-xl border border-[#E6DCCF]">
                    <label className="text-[11px] font-bold text-[#382820] flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-[#B85B14]" />
                      Batch Card Thumbnail Image URL
                    </label>
                    <input
                      type="text"
                      value={editThumbnail}
                      onChange={(e) => setEditThumbnail(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white border border-[#E6DCCF] rounded-lg px-2.5 py-1.5 text-[#382820] text-xs font-mono"
                    />
                    {editThumbnail && (
                      <div className="w-full h-24 rounded-lg overflow-hidden border border-[#E6DCCF] mt-1">
                        <img src={editThumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-1 overflow-x-auto pt-1">
                      {presetThumbnails.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditThumbnail(p.url)}
                          className="shrink-0 text-[9px] font-semibold px-2 py-0.5 bg-white border border-[#E6DCCF] rounded text-[#7A6B63] hover:text-[#B85B14] cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Front Hero Image Customization */}
                  <div className="space-y-2 p-3 bg-[#F5EFEB] rounded-xl border border-[#E6DCCF]">
                    <label className="text-[11px] font-bold text-[#382820] flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-[#B85B14]" />
                      Front Hero Banner Image URL (Folder Header)
                    </label>
                    <input
                      type="text"
                      value={editHeroImage}
                      onChange={(e) => setEditHeroImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white border border-[#E6DCCF] rounded-lg px-2.5 py-1.5 text-[#382820] text-xs font-mono"
                    />
                    {editHeroImage && (
                      <div className="w-full h-28 rounded-lg overflow-hidden border border-[#E6DCCF] mt-1">
                        <img src={editHeroImage} alt="Hero banner preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-1 overflow-x-auto pt-1">
                      {presetHeroBanners.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditHeroImage(p.url)}
                          className="shrink-0 text-[9px] font-semibold px-2 py-0.5 bg-white border border-[#E6DCCF] rounded text-[#7A6B63] hover:text-[#B85B14] cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#382820] block mb-1">Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="w-full py-2.5 bg-[#B85B14] hover:bg-[#A04F11] text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    {isSavingEdit ? 'Saving Customizations...' : 'Save Batch Customizations'}
                  </button>
                </form>
              )}

              {/* VIEW 4: ADD CONTENT TO BATCH */}
              {activeTab === 'add_content' && (
                <form onSubmit={handleAddContent} className="space-y-3 text-xs bg-white p-4 rounded-2xl border border-[#E6DCCF] shadow-xs">
                  <h4 className="text-xs font-black text-[#382820] border-b border-[#E6DCCF] pb-2">Upload Batch Materials</h4>

                  <div>
                    <label className="text-[11px] font-bold text-[#382820] block mb-1">Select Target Batch</label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] font-bold"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#382820] block mb-1">Folder Category (Typeable)</label>
                      <input
                        type="text"
                        value={contentCategory}
                        onChange={(e) => setContentCategory(e.target.value)}
                        placeholder="e.g. videos, pdfs, study_material, tests..."
                        className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] placeholder-[#A0938A] focus:outline-none focus:border-[#B85B14] font-medium text-xs"
                      />
                      <div className="flex gap-1 overflow-x-auto pt-1">
                        {['videos', 'pdfs', 'study_material', 'tests'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setContentCategory(cat)}
                            className={`shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              contentCategory === cat
                                ? 'bg-[#B85B14] text-white border-[#B85B14]'
                                : 'bg-[#F5EFEB] text-[#7A6B63] border-[#E6DCCF] hover:bg-[#E2CEB9]/50'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#382820] block mb-1">Content Type</label>
                      <select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value as any)}
                        className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] font-medium"
                      >
                        <option value="video">Video Lecture</option>
                        <option value="pdf">PDF Document</option>
                        <option value="dpp">Daily Practice Problem (DPP)</option>
                        <option value="test">Interactive Quiz Test</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#382820] block mb-1">Title</label>
                    <input
                      type="text"
                      value={contentTitle}
                      onChange={(e) => setContentTitle(e.target.value)}
                      placeholder="e.g. Chapter 01: Kinematics 1D Equations"
                      className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] placeholder-[#A0938A] focus:outline-none focus:border-[#B85B14] font-medium"
                      required
                    />
                  </div>

                  {contentType === 'video' && (
                    <div>
                      <label className="text-[11px] font-bold text-[#382820] block mb-1">Video URL (YouTube / Embed)</label>
                      <input
                        type="text"
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] placeholder-[#A0938A] font-medium"
                      />
                    </div>
                  )}

                  {(contentType === 'pdf' || contentType === 'dpp') && (
                    <div>
                      <label className="text-[11px] font-bold text-[#382820] block mb-1">PDF File Link / URL</label>
                      <input
                        type="text"
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-[#382820] placeholder-[#A0938A] font-medium"
                      />
                    </div>
                  )}

                  {contentType === 'test' && (
                    <div className="space-y-4 pt-2 border-t border-[#E6DCCF]">
                      
                      {/* NEW SECTION: GENERATE QUESTIONS FROM ANY RANDOM TEXT */}
                      <div className="p-3.5 bg-[#FFF9F2] border-2 border-[#E2CEB9] rounded-2xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-[#382820] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#B85B14] animate-pulse" />
                            <span>AI Question Generator from Any Random Text</span>
                          </label>
                          <span className="text-[10px] font-bold text-white bg-[#B85B14] px-2 py-0.5 rounded-full shadow-2xs">
                            New Feature
                          </span>
                        </div>
                        <p className="text-[10px] text-[#7A6B63] leading-snug">
                          Paste any random text, notes, or chapter excerpt below. AI will reorder, restructure, and generate test questions based on your provided text, then prompt you for verification before adding them to the test section.
                        </p>

                        <textarea
                          value={randomPastedText}
                          onChange={(e) => setRandomPastedText(e.target.value)}
                          rows={4}
                          placeholder={`Paste any random text or study notes here, for example:
Photosynthesis is the process used by plants, algae and certain bacteria to turn sunlight, carbon dioxide (CO2) and water into glucose and oxygen. Light reactions occur in the thylakoid membrane where chlorophyll absorbs light energy, while the Calvin cycle occurs in the stroma...`}
                          className="w-full bg-white border border-[#E6DCCF] rounded-xl p-2.5 text-xs text-[#382820] placeholder-[#A0938A] font-sans focus:outline-none focus:border-[#B85B14] shadow-inner"
                        />

                        <button
                          type="button"
                          onClick={handleGenerateFromRandomText}
                          disabled={isGeneratingFromRandomText || !randomPastedText.trim()}
                          className="w-full py-2.5 bg-[#B85B14] hover:bg-[#A04F11] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          {isGeneratingFromRandomText ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Restructuring Text & Generating Questions...</span>
                            </>
                          ) : (
                            <>
                              <FileQuestion className="w-4 h-4" />
                              <span>⚡ Generate & Restructure Questions from Text</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* SECTION 1: PASTE ALL QUESTIONS IN SINGLE BOX & GENERATE INTERACTIVE QUIZ */}
                      <div className="p-4 bg-[#FFF9F2] border-2 border-[#B85B14]/30 rounded-2xl space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-[#382820] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#B85B14] animate-pulse" />
                            <span>Paste All Questions in Single Box</span>
                          </label>
                          <span className="text-[10px] text-white font-black bg-[#B85B14] px-2 py-0.5 rounded-full shadow-2xs">
                            Instant Multi-Question Separator
                          </span>
                        </div>
                        <p className="text-[10px] text-[#7A6B63] leading-snug font-medium">
                          Paste the text of all your test questions in a well-structured format inside this single box. The system will automatically separate them into multiple interactive quiz questions for your students!
                        </p>

                        <textarea
                          value={rawPastedQuestions}
                          onChange={(e) => setRawPastedQuestions(e.target.value)}
                          rows={5}
                          placeholder={`Paste all your questions here in a well-structured format, for example:

1. What is the SI unit of Force?
A) Joule
B) Newton
C) Watt
D) Pascal
Answer: B
Explanation: Newton is the SI unit of force.

2. Which process turns sunlight into glucose in plants?
A) Respiration
B) Photosynthesis
C) Transpiration
D) Fermentation
Answer: B
Explanation: Photosynthesis converts light energy into chemical energy.`}
                          className="w-full bg-white border border-[#E6DCCF] rounded-xl p-3 text-xs text-[#382820] placeholder-[#A0938A] font-mono focus:outline-none focus:border-[#B85B14] shadow-inner"
                        />

                        <button
                          type="button"
                          onClick={handleFormatPastedQuiz}
                          disabled={isFormattingQuiz || !rawPastedQuestions.trim()}
                          className="w-full py-2.5 bg-[#B85B14] hover:bg-[#A04F11] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          {isFormattingQuiz ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Separating Questions & Building Quiz...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4" />
                              <span>⚡ Separate Into Multiple Questions & Build Interactive Quiz</span>
                            </>
                          )}
                        </button>

                        {formatSuccessMsg && (
                          <div className="p-2.5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl text-[11px] font-bold text-emerald-900 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{formatSuccessMsg}</span>
                          </div>
                        )}
                      </div>

                      {/* SECTION 2: EDITABLE QUIZ QUESTIONS BUILDER */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <label className="text-xs font-black text-[#382820] flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-[#B85B14]" />
                            <span>Batch Test Questions ({testQuestions.length})</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setIsQuestionsCompactScroll(!isQuestionsCompactScroll)}
                              className="text-[10px] font-bold text-[#7A6B63] hover:text-[#382820] bg-white px-2 py-1 rounded-lg border border-[#E6DCCF] cursor-pointer"
                              title="Toggle between inline expanded view and compact scrollbox"
                            >
                              {isQuestionsCompactScroll ? '↔️ Expand All Inline' : '↕️ Scroll Box Mode'}
                            </button>
                            <button
                              type="button"
                              onClick={handleAddQuestion}
                              className="text-[10px] font-bold text-[#B85B14] hover:text-[#A04F11] bg-[#F3E8DB] px-2 py-1 rounded-lg border border-[#E2CEB9] flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Question</span>
                            </button>
                          </div>
                        </div>

                        <div className={`space-y-3 ${
                          isQuestionsCompactScroll 
                            ? 'max-h-[420px] overflow-y-auto overscroll-contain touch-pan-y pr-2 p-2 bg-[#F5EFEB]/50 border border-[#E6DCCF] rounded-2xl shadow-inner' 
                            : 'p-1'
                        }`}>
                          {testQuestions.map((q, qIdx) => (
                            <div key={q.id || qIdx} className="p-3 bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl space-y-2 relative group">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#382820] bg-[#E2CEB9] px-2 py-0.5 rounded">
                                  Q{qIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(qIdx)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-rose-50 cursor-pointer"
                                  title="Delete question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                                placeholder="Question text..."
                                className="w-full bg-white border border-[#E6DCCF] rounded-lg px-2.5 py-1.5 text-xs text-[#382820] font-semibold"
                                required
                              />

                              {/* Options Grid */}
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-1 bg-white border border-[#E6DCCF] rounded-lg p-1">
                                    <input
                                      type="radio"
                                      name={`correct-${qIdx}`}
                                      checked={q.correctIndex === optIdx}
                                      onChange={() => handleUpdateQuestion(qIdx, 'correctIndex', optIdx)}
                                      className="accent-[#B85B14] cursor-pointer shrink-0 ml-1"
                                      title="Mark as correct answer"
                                    />
                                    <span className="text-[10px] font-bold text-[#7A6B63]">{String.fromCharCode(65 + optIdx)}:</span>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                      className="w-full bg-transparent text-[11px] text-[#382820] font-medium focus:outline-none"
                                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                      required
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Explanation */}
                              <input
                                type="text"
                                value={q.explanation || ''}
                                onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                                placeholder="Solution explanation..."
                                className="w-full bg-white border border-[#E6DCCF] rounded-lg px-2.5 py-1 text-[11px] text-[#7A6B63] italic"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#B85B14] hover:bg-[#A04F11] text-white font-bold rounded-xl text-xs mt-2 shadow-sm cursor-pointer active:scale-95 transition-all"
                  >
                    Upload Content to Batch
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>

      {/* VERIFICATION MODAL OVERLAY */}
      {showVerificationModal && verificationModalQuestions && (
        <div className="fixed inset-0 z-[200] bg-[#382820]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FAF6F0] border border-[#E2CEB9] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Verification Header */}
            <div className="p-4 bg-white border-b border-[#E6DCCF] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#F3E8DB] border border-[#E2CEB9] flex items-center justify-center text-[#B85B14]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#382820]">Verification Required</h3>
                  <p className="text-[11px] text-[#7A6B63] font-medium">Review AI restructured questions generated from your pasted text</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissVerificationQuestions}
                className="p-1.5 text-[#7A6B63] hover:text-[#382820] rounded-xl hover:bg-[#F5EFEB] cursor-pointer"
                title="Dismiss and cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification Preview Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-[#FAF6F0]">
              <div className="p-3 bg-[#FFF9F2] border border-[#E2CEB9] rounded-2xl text-xs text-[#382820] space-y-1">
                <p className="font-bold text-[#8C4A1B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B85B14]" />
                  <span>AI successfully reordered & generated {verificationModalQuestions.length} questions from your text!</span>
                </p>
                <p className="text-[11px] text-[#7A6B63]">
                  Please verify the generated questions below. Click <strong>Allow</strong> to populate them into the Test Section, or <strong>Dismiss</strong> to cancel.
                </p>
              </div>

              {/* Questions list preview */}
              <div className="space-y-3">
                {verificationModalQuestions.map((q, idx) => (
                  <div key={idx} className="p-3.5 bg-white border border-[#E6DCCF] rounded-2xl space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black bg-[#F3E8DB] text-[#B85B14] px-2 py-0.5 rounded-md border border-[#E2CEB9]">
                        Question {idx + 1}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Correct Option: {String.fromCharCode(65 + q.correctIndex)}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#382820]">{q.question}</p>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {q.options.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl border font-medium ${
                            oIdx === q.correctIndex
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-[#FAF6F0] border-[#E6DCCF] text-[#382820]'
                          }`}
                        >
                          <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)}:</span> {opt}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-2 bg-[#F5EFEB] rounded-xl text-[10px] text-[#7A6B63] italic border border-[#E6DCCF]">
                        <strong className="not-italic text-[#382820]">Solution: </strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Actions Bar */}
            <div className="p-4 bg-white border-t border-[#E6DCCF] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDismissVerificationQuestions}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4 text-rose-600" />
                <span>Dismiss / Cancel Questions</span>
              </button>

              <button
                type="button"
                onClick={handleAllowVerificationQuestions}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                <span>Allow & Go to Test Section</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
