import React, { useState } from 'react';
import { Batch, ContentItem } from '../types';
import { X, Video, FileText, BookOpen, FileCheck, Play, Download, Clock, CheckCircle2, ArrowLeft, ThumbsUp, ThumbsDown, Share2, Maximize2, ExternalLink, MessageSquare, Send, Sparkles, Monitor, Smartphone, RotateCw } from 'lucide-react';
import { logLectureView, logTestSubmission } from '../lib/api';

interface FolderModalProps {
  batch: Batch;
  onClose: () => void;
  onRefreshBatchData: () => void;
}

interface CommentItem {
  id: string;
  user: string;
  text: string;
  time: string;
  likes: number;
  isLiked?: boolean;
}

export const FolderModal: React.FC<FolderModalProps> = ({ batch, onClose, onRefreshBatchData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'videos' | 'pdfs' | 'study_material' | 'tests'>('videos');
  const [selectedVideo, setSelectedVideo] = useState<ContentItem | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<ContentItem | null>(null);
  const [activeTest, setActiveTest] = useState<ContentItem | null>(null);

  // Video player user action state (starts at 0, strictly user driven)
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isLandscapeFullscreen, setIsLandscapeFullscreen] = useState(false);
  const [isForceRotated, setIsForceRotated] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);

  // Test state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState<number | null>(null);

  const filterContents = (category: 'videos' | 'pdfs' | 'study_material' | 'tests') => {
    return batch.contents.filter(c => c.folderCategory === category || (category === 'videos' && c.type === 'video') || (category === 'pdfs' && c.type === 'pdf') || (category === 'tests' && c.type === 'test') || (category === 'study_material' && c.type === 'dpp'));
  };

  const handleWatchLecture = (item: ContentItem) => {
    setSelectedVideo(item);
    setIsLiked(false);
    setIsDisliked(false);
    logLectureView(batch.id, item.id, item.title, 900, 3600, true);
  };

  const handleStartTest = (item: ContentItem) => {
    setActiveTest(item);
    setUserAnswers({});
    setTestSubmitted(false);
    setTestScore(null);
  };

  const handleSubmitTest = () => {
    if (!activeTest || !activeTest.questions) return;

    let score = 0;
    const questionDetailsList: {
      question: string;
      userAnswerIndex?: number;
      correctIndex: number;
      options: string[];
      explanation?: string;
    }[] = [];

    activeTest.questions.forEach((q, idx) => {
      const qKey = q.id || `q-${idx}`;
      const userAns = userAnswers[qKey];
      if (userAns === q.correctIndex) {
        score += 1;
      }
      questionDetailsList.push({
        question: q.question,
        userAnswerIndex: userAns,
        correctIndex: q.correctIndex,
        options: q.options || [],
        explanation: q.explanation,
      });
    });

    setTestScore(score);
    setTestSubmitted(true);
    logTestSubmission(activeTest.id, activeTest.title, score, activeTest.questions.length, 600, activeTest.folderCategory, undefined, questionDetailsList);
  };

  const toggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      if (isDisliked) {
        setIsDisliked(false);
        setDislikesCount(prev => prev - 1);
      }
    }
  };

  const toggleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
      setDislikesCount(prev => prev - 1);
    } else {
      setIsDisliked(true);
      setDislikesCount(prev => prev + 1);
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      user: 'You (Student Explorer)',
      text: newCommentText.trim(),
      time: 'Just now',
      likes: 1,
      isLiked: true,
    };

    setCommentsList([newComment, ...commentsList]);
    setNewCommentText('');
  };

  const getYouTubeEmbedUrl = (url?: string) => {
    let videoId = 'dQw4w9WgXcQ';
    if (url) {
      const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`;
  };

  const getYouTubeWebUrl = (url?: string) => {
    if (!url) return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
    return url;
  };

  const handleEnterLandscapeMode = () => {
    setIsLandscapeFullscreen(true);
    // Auto request landscape orientation lock if supported by screen API
    try {
      if (window.screen && window.screen.orientation && (window.screen.orientation as any).lock) {
        (window.screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch (e) {
      // Orientation lock API may not be permitted in all browsers
    }
  };

  const handleExitLandscapeMode = () => {
    setIsLandscapeFullscreen(false);
    try {
      if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col w-full h-full overflow-hidden">
      
      {/* END-TO-END FULL LANDSCAPE LECTURE MODE OVERLAY */}
      {selectedVideo && isLandscapeFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col w-screen h-screen overflow-hidden select-none animate-fadeIn">
          {/* Floating Controls Bar */}
          <div className="absolute top-4 left-4 z-[110] flex items-center space-x-2">
            <button
              onClick={handleExitLandscapeMode}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900/90 hover:bg-black text-white font-black text-xs rounded-xl border border-white/20 shadow-2xl backdrop-blur-md active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#B85B14]" />
              <span>Back to Portrait Mode</span>
            </button>

            <button
              onClick={() => setIsForceRotated(!isForceRotated)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900/90 hover:bg-black text-white font-bold text-xs rounded-xl border border-white/20 shadow-2xl backdrop-blur-md active:scale-95 transition-all cursor-pointer"
              title="Toggle horizontal rotation"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#B85B14]" />
              <span>{isForceRotated ? 'Standard Widescreen' : 'Rotate 90° Horizontal'}</span>
            </button>
          </div>

          {/* End-to-End Widescreen 16:9 Lecture Video Canvas - Rotated Horizontally on Portrait Mobile */}
          <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
            <div className={`w-full h-full flex items-center justify-center transition-transform duration-300 ${
              isForceRotated
                ? 'w-[100vh] h-[100vw] rotate-90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                : 'portrait:w-[100vh] portrait:h-[100vw] portrait:rotate-90 portrait:absolute portrait:top-1/2 portrait:left-1/2 portrait:-translate-x-1/2 portrait:-translate-y-1/2'
            }`}>
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.url)}
                title={selectedVideo.title}
                className="w-full h-full aspect-video border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden shadow-2xl">
        
        {/* Topmost Navigation & Subtabs Bar */}
        <div className="flex items-center justify-between border-b border-[#E6DCCF] bg-white px-3 py-2 shadow-xs shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#FAF6F0] text-[#382820] hover:bg-[#F3E8DB] border border-[#E6DCCF] shrink-0 active:scale-95 transition-all"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none mx-2">
            {[
              { id: 'videos', label: 'Videos', icon: Video },
              { id: 'pdfs', label: 'PDF Notes', icon: FileText },
              { id: 'study_material', label: 'Study Material', icon: BookOpen },
              { id: 'tests', label: 'Tests', icon: FileCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id as any);
                    setSelectedVideo(null);
                    setSelectedPdf(null);
                    setActiveTest(null);
                  }}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#B85B14] text-white shadow-xs'
                      : 'text-[#7A6B63] hover:text-[#382820] hover:bg-[#FAF6F0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#FAF6F0] text-[#382820] hover:bg-[#F3E8DB] border border-[#E6DCCF] shrink-0 active:scale-95 transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#FAF6F0]">
          
          {/* INTEGRATED LECTURE VIDEO PLAYER VIEW */}
          {selectedVideo && (
            <div className="bg-white border border-[#E6DCCF] rounded-2xl p-3 sm:p-4 space-y-3 shadow-xs animate-fadeIn">
              
              {/* Widescreen 16:9 Video Canvas Container */}
              <div
                id="youtube-player-container"
                className="bg-black rounded-xl overflow-hidden relative border border-[#E6DCCF] aspect-video w-full shadow-inner"
              >
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.url)}
                  title={selectedVideo.title}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Lecture Title & Details Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3E8DB] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#7A6B63] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#B85B14]" />
                      <span>{selectedVideo.duration || '45m'}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#382820]">{selectedVideo.title}</h3>
                  <p className="text-xs text-[#7A6B63] font-medium leading-relaxed">{selectedVideo.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-xs px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#F3E8DB] text-[#382820] font-bold rounded-xl border border-[#E6DCCF] active:scale-95 transition-all"
                  >
                    Close Video
                  </button>
                </div>
              </div>

              {/* Action Buttons Bar (Like, Dislike, Landscape View) */}
              <div className="flex flex-wrap items-center justify-end gap-2 bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E6DCCF]">
                
                {/* User Driven Like / Dislike / Landscape Actions */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={toggleLike}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all border active:scale-95 ${
                      isLiked
                        ? 'bg-[#B85B14] text-white border-[#B85B14]'
                        : 'bg-white text-[#382820] border-[#E6DCCF] hover:bg-[#F3E8DB]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    onClick={toggleDislike}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all border active:scale-95 ${
                      isDisliked
                        ? 'bg-[#8C4A1B] text-white border-[#8C4A1B]'
                        : 'bg-white text-[#382820] border-[#E6DCCF] hover:bg-[#F3E8DB]'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{dislikesCount}</span>
                  </button>

                  {/* Full Landscape Lecture View Button */}
                  <button
                    onClick={handleEnterLandscapeMode}
                    className="px-3 py-1.5 bg-[#B85B14] hover:bg-[#A04812] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Rotate and open full landscape mode"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Landscape View</span>
                  </button>

                  {/* Full Screen Button */}
                  <button
                    onClick={handleEnterLandscapeMode}
                    className="p-2 bg-white text-[#382820] hover:bg-[#F3E8DB] rounded-xl border border-[#E6DCCF] text-xs font-bold active:scale-95 transition-all"
                    title="Full Screen Landscape"
                  >
                    <Maximize2 className="w-4 h-4 text-[#B85B14]" />
                  </button>
                </div>

              </div>

              {/* Educational Comments Section (User Action Driven) */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3E8DB] pb-2">
                  <h4 className="text-xs font-black text-[#382820] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#B85B14]" />
                    <span>Educational Comments & Notes ({commentsList.length})</span>
                  </h4>
                </div>

                {/* Post Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add an educational comment or question..."
                    className="flex-1 bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3 py-2 text-xs text-[#382820] placeholder-[#7A6B63]/60 focus:outline-none focus:border-[#B85B14]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs shrink-0 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-none">
                  {commentsList.length === 0 ? (
                    <p className="text-xs text-[#7A6B63] font-medium italic text-center py-3 bg-[#FAF6F0] rounded-xl border border-dashed border-[#E6DCCF]">
                      No comments yet. Post your observations or questions above!
                    </p>
                  ) : (
                    commentsList.map((c) => (
                      <div key={c.id} className="bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl p-2.5 space-y-1 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#382820]">{c.user}</span>
                          <span className="text-[10px] text-[#7A6B63] font-medium">{c.time}</span>
                        </div>
                        <p className="text-xs text-[#382820] font-medium leading-relaxed">{c.text}</p>
                        <div className="flex items-center gap-3 pt-1 text-[10px] text-[#7A6B63] font-bold">
                          <button
                            onClick={() => {
                              setCommentsList(commentsList.map(item => {
                                if (item.id === c.id) {
                                  return {
                                    ...item,
                                    likes: item.isLiked ? item.likes - 1 : item.likes + 1,
                                    isLiked: !item.isLiked
                                  };
                                }
                                return item;
                              }));
                            }}
                            className={`flex items-center gap-1 hover:text-[#B85B14] ${c.isLiked ? 'text-[#B85B14]' : ''}`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{c.likes}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          )}

          {/* PDF VIEWER MODAL VIEW */}
          {selectedPdf && (
            <div className="bg-white border border-[#E6DCCF] rounded-2xl p-4 mb-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F3E8DB] pb-2">
                <h4 className="text-xs font-black text-[#382820] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#4D6B40]" />
                  {selectedPdf.title}
                </h4>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="text-[10px] px-2 py-1 bg-[#FAF6F0] hover:bg-[#F3E8DB] text-[#382820] font-bold rounded-md"
                >
                  Close PDF
                </button>
              </div>
              <div className="bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl p-6 text-center space-y-3">
                <p className="text-xs text-[#382820] font-medium">
                  Document Preview Ready ({selectedPdf.fileSize || '3.5 MB'})
                </p>
                <a
                  href={selectedPdf.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#4D6B40] hover:bg-[#3E5733] text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Open PDF Document</span>
                </a>
              </div>
            </div>
          )}

          {/* ACTIVE TEST TAKING VIEW */}
          {activeTest && (
            <div className="bg-white border border-[#E6DCCF] rounded-2xl p-4 mb-4 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F3E8DB] pb-2">
                <div>
                  <h4 className="text-xs font-black text-[#382820]">{activeTest.title}</h4>
                  <p className="text-[10px] text-[#7A6B63] font-medium">{activeTest.questions?.length || 0} Questions • Timed Test</p>
                </div>
                <button
                  onClick={() => setActiveTest(null)}
                  className="text-[10px] px-2.5 py-1 bg-[#FAF6F0] hover:bg-[#F3E8DB] text-[#382820] font-bold rounded-md border border-[#E6DCCF]"
                >
                  Exit Test
                </button>
              </div>

              {!testSubmitted ? (
                <div className="space-y-4">
                  {activeTest.questions?.map((q, qIdx) => {
                    const qKey = q.id || `q-${qIdx}`;
                    return (
                      <div key={qKey} className="bg-[#FAF6F0] border border-[#E6DCCF] p-3.5 rounded-xl space-y-2.5">
                        <p className="text-xs font-bold text-[#382820]">
                          Q{qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => setUserAnswers(prev => ({ ...prev, [qKey]: optIdx }))}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all border ${
                                userAnswers[qKey] === optIdx
                                  ? 'bg-[#B85B14] border-[#B85B14] text-white font-bold shadow-xs'
                                  : 'bg-white border-[#E6DCCF] text-[#382820] hover:border-[#B85B14] font-medium'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={handleSubmitTest}
                    className="w-full py-3 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-98"
                  >
                    Submit Test & Evaluate Score
                  </button>
                </div>
              ) : (
                <div className="bg-[#FAF6F0] border border-[#E6DCCF] p-4 rounded-xl text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#EAF0E6] text-[#4D6B40] flex items-center justify-center font-black text-lg border border-[#C6D8C0] shadow-xs">
                    {testScore} / {activeTest.questions?.length}
                  </div>
                  <h4 className="text-sm font-extrabold text-[#382820]">Test Completed!</h4>
                  <p className="text-xs text-[#7A6B63] font-medium">Your score has been logged to the Analysis tab.</p>
                  
                  {/* Detailed Solutions */}
                  <div className="text-left space-y-3 pt-2">
                    <h5 className="text-xs font-extrabold text-[#382820] border-b border-[#E6DCCF] pb-1">Detailed Solutions</h5>
                    {activeTest.questions?.map((q, idx) => (
                      <div key={q.id || idx} className="text-xs bg-white p-2.5 rounded-lg border border-[#E6DCCF] space-y-0.5">
                        <p className="font-bold text-[#382820]">Q{idx + 1}: {q.question}</p>
                        <p className="text-[11px] text-[#4D6B40] font-bold">Correct Answer: {q.options[q.correctIndex]}</p>
                        <p className="text-[10px] text-[#7A6B63] font-medium">{q.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTest(null)}
                    className="w-full py-2 bg-[#EAE0D2] hover:bg-[#E2CEB9] text-[#382820] rounded-xl text-xs font-bold"
                  >
                    Back to Batch Folders
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LIST ITEMS FOR CURRENT SUBTAB */}
          {filterContents(activeSubTab).length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E6DCCF] shadow-xs">
              <BookOpen className="w-8 h-8 text-[#7A6B63] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#382820]">No {activeSubTab} uploaded in this batch yet.</p>
              <p className="text-[10px] text-[#7A6B63] mt-1 font-medium">Educators can add fresh content via the Admin Portal.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filterContents(activeSubTab).map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E6DCCF] rounded-2xl p-3.5 flex items-start justify-between hover:border-[#B85B14] transition-all shadow-xs"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3E8DB] text-[#8C4A1B] border border-[#E2CEB9] uppercase">
                        {item.type}
                      </span>
                      {item.duration && (
                        <span className="text-[10px] text-[#7A6B63] font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#7A6B63]" />
                          {item.duration}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#382820]">{item.title}</h4>
                    {item.description && <p className="text-[11px] text-[#7A6B63] font-medium line-clamp-1">{item.description}</p>}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center space-x-1.5 pt-1">
                    {item.type === 'video' && (
                      <button
                        onClick={() => handleWatchLecture(item)}
                        className="px-3.5 py-2 bg-[#B85B14] hover:bg-[#A04812] text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Video</span>
                      </button>
                    )}

                    {item.type === 'pdf' && (
                      <button
                        onClick={() => setSelectedPdf(item)}
                        className="px-3.5 py-2 bg-[#4D6B40] hover:bg-[#3E5733] text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs active:scale-95 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    )}

                    {item.type === 'dpp' && (
                      <a
                        href={item.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-[#C86D27] hover:bg-[#A8581C] text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>DPP PDF</span>
                      </a>
                    )}

                    {item.type === 'test' && (
                      <button
                        onClick={() => handleStartTest(item)}
                        className="px-3.5 py-2 bg-[#B85B14] hover:bg-[#A04812] text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs active:scale-95 transition-all"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Start Test</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

