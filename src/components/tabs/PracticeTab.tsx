import React, { useState } from 'react';
import { generateAITest, logTestSubmission } from '../../lib/api';
import { TestQuestion } from '../../types';
import { Sparkles, CheckSquare, Clock, Zap, HelpCircle, CheckCircle2, X, BarChart3, AlertCircle, ArrowRight, RotateCcw, Award, Filter, Check, ChevronRight, Play } from 'lucide-react';

interface PracticeTabProps {
  onOpenEducatorPortal: () => void;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({ onOpenEducatorPortal }) => {
  const [prompt, setPrompt] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [customCountInput, setCustomCountInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notFoundNotice, setNotFoundNotice] = useState<string | null>(null);

  // Full Screen Test Modal State
  const [isFullScreenTestOpen, setIsFullScreenTestOpen] = useState(false);
  const [generatedTest, setGeneratedTest] = useState<{
    id: string;
    title: string;
    subject: string;
    durationMinutes: number;
    questions: TestQuestion[];
  } | null>(null);

  // Active quiz taking state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [solutionFilter, setSolutionFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  // Extract count from prompt or use selected count / custom input
  const getRequestedCount = (text: string): number => {
    if (customCountInput) {
      const parsed = parseInt(customCountInput, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (text) {
      const match = text.match(/\b(\d+)\s*(?:questions?|mcqs?|items?|problems?|qs?)\b/i) ||
                    text.match(/\b(?:give|generate|create|make|want|need|provide|ask)\s*(\d+)\b/i);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }
    return questionCount || 15;
  };

  const handleGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const targetCount = getRequestedCount(prompt);

    setIsGenerating(true);
    setNotFoundNotice(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(null);
    setSolutionFilter('all');

    try {
      const res = await generateAITest(prompt, 'Science & Practice', targetCount);
      if (res && res.test && res.test.questions && res.test.questions.length > 0) {
        setGeneratedTest(res.test);
        setIsFullScreenTestOpen(true);
        setNotFoundNotice(null);
      } else if (res && res.message) {
        setNotFoundNotice(res.message);
      } else {
        setNotFoundNotice('Unable to generate practice test right now. Please check network connection and try again.');
      }
    } catch {
      setNotFoundNotice('Failed to connect to practice examination engine. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (!generatedTest) return;
    let computedScore = 0;
    const weakTopicsList: string[] = [];
    const questionDetailsList: {
      question: string;
      userAnswerIndex?: number;
      correctIndex: number;
      options: string[];
      explanation?: string;
    }[] = [];

    generatedTest.questions.forEach((q, idx) => {
      const uAns = userAnswers[q.id || idx];
      if (uAns === q.correctIndex) {
        computedScore += 1;
      } else {
        if (q.question) {
          const shortTopic = q.question.slice(0, 45) + '...';
          weakTopicsList.push(shortTopic);
        }
      }

      questionDetailsList.push({
        question: q.question,
        userAnswerIndex: uAns,
        correctIndex: q.correctIndex,
        options: q.options || [],
        explanation: q.explanation,
      });
    });

    setScore(computedScore);
    setIsSubmitted(true);
    logTestSubmission(
      generatedTest.id,
      generatedTest.title,
      computedScore,
      generatedTest.questions.length,
      300,
      generatedTest.subject || 'Science & Practice',
      weakTopicsList,
      questionDetailsList
    );
  };

  const handleCloseTestWindow = () => {
    if (!isSubmitted && Object.keys(userAnswers).length > 0) {
      if (!window.confirm('Are you sure you want to exit the test? Your current progress will be lost.')) {
        return;
      }
    }
    setIsFullScreenTestOpen(false);
    setGeneratedTest(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setScore(null);
  };

  const scrollToQuestion = (idx: number) => {
    const el = document.getElementById(`full-q-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const targetCountNum = getRequestedCount(prompt);

  return (
    <div className="space-y-4 pb-24 touch-pan-y">
      
      {/* Top Simple Header */}
      <div className="bg-white border border-[#E6DCCF] rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5 text-xs text-[#B85B14] font-bold">
            <CheckSquare className="w-4 h-4" />
            <span>Practice Test Generator</span>
          </div>
          <p className="text-xs text-[#7A6B63] font-medium">Generate interactive practice quizzes for any topic or subject</p>
        </div>
      </div>

      {/* AI Test Generation Form Card */}
      <div className="bg-white border border-[#E6DCCF] rounded-2xl p-4.5 space-y-4 shadow-xs">
        <form onSubmit={handleGenerateTest} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#382820] block mb-1.5">
              Topic or Subject
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter topic (e.g. Physics Thermodynamics, Organic Chemistry, Algebra...)"
              className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3.5 py-2.5 text-xs text-[#382820] placeholder-[#7A6B63]/60 focus:outline-none focus:border-[#B85B14] font-medium"
              required
            />
          </div>

          {/* Question Count Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#382820]">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#B85B14]" />
                Question Count:
              </span>
              <span className="text-[#8C4A1B] font-black">{targetCountNum} Questions</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[10, 15, 25, 50, 100].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setQuestionCount(count);
                    setCustomCountInput('');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    questionCount === count && !customCountInput
                      ? 'bg-[#B85B14] border-[#B85B14] text-white shadow-xs'
                      : 'bg-[#FAF6F0] border-[#E6DCCF] text-[#7A6B63] hover:border-[#B85B14]/40'
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>

            {/* Custom Question Count Input */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[11px] text-[#7A6B63] font-bold shrink-0">Custom Count:</span>
              <input
                type="number"
                min="1"
                max="500"
                value={customCountInput}
                onChange={(e) => setCustomCountInput(e.target.value)}
                placeholder="e.g. 20, 30, 50..."
                className="w-full bg-[#FAF6F0] border border-[#E6DCCF] rounded-lg px-2.5 py-1 text-xs text-[#382820] focus:outline-none focus:border-[#B85B14] font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-[#B85B14] hover:bg-[#8C4A1B] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-amber-200" />
                <span>Generating Practice Test...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Generate Practice Test ({targetCountNum} Qs)</span>
              </>
            )}
          </button>
        </form>

        {/* NOT FOUND / NOTICE */}
        {notFoundNotice && (
          <div className="bg-[#FAF6F0] border border-[#E2CEB9] p-3 rounded-xl text-xs text-[#8C4A1B] flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-[#B85B14] shrink-0" />
            <span>{notFoundNotice}</span>
          </div>
        )}
      </div>

      {/* DEDICATED END-TO-END FULL SCREEN TEST & ANALYSIS OVERLAY MODAL */}
      {isFullScreenTestOpen && generatedTest && (
        <div className="fixed inset-0 z-50 bg-[#FAF6F0] flex flex-col min-h-screen w-screen overflow-hidden animate-fadeIn">
          
          {/* Full Screen Window Header */}
          <header className="bg-white border-b border-[#E6DCCF] px-4 py-3 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCloseTestWindow}
                className="p-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E8DB] text-[#382820] border border-[#E6DCCF] transition-colors"
                title="Exit Test Window"
              >
                <X className="w-5 h-5 text-[#B85B14]" />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#F3E8DB] text-[#8C4A1B] border border-[#E2CEB9] uppercase">
                    {generatedTest.subject}
                  </span>
                  <span className="text-[10px] text-[#7A6B63] font-bold">
                    {generatedTest.questions.length} Total Questions
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-[#382820] leading-tight truncate max-w-[220px] sm:max-w-md mt-0.5">
                  {generatedTest.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#7A6B63] bg-[#FAF6F0] px-2.5 py-1.5 rounded-xl border border-[#E6DCCF]">
                <Clock className="w-4 h-4 text-[#B85B14]" />
                {generatedTest.durationMinutes} mins
              </span>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-3.5 py-2 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold rounded-xl text-xs shadow-xs transition-all active:scale-95"
                >
                  Submit & Evaluate
                </button>
              ) : (
                <button
                  onClick={handleCloseTestWindow}
                  className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#F3E8DB] text-[#382820] font-bold rounded-xl text-xs border border-[#E6DCCF]"
                >
                  Close Window
                </button>
              )}
            </div>
          </header>

          {!isSubmitted ? (
            /* FULL SCREEN ACTIVE TEST TAKING CANVAS */
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#FAF6F0]">
              
              {/* Question Navigation Drawer/Bar for rapid jumping */}
              <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#E6DCCF] p-3 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto">
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between text-xs font-black text-[#382820] pb-2 border-b border-[#F3E8DB]">
                    <span>Question Navigator</span>
                    <span className="text-[10px] font-bold text-[#8C4A1B] bg-[#F3E8DB] px-1.5 py-0.5 rounded">
                      {answeredCount} / {generatedTest.questions.length} Done
                    </span>
                  </div>

                  {/* Grid of Question Numbers */}
                  <div className="grid grid-cols-8 md:grid-cols-5 gap-1.5 max-h-24 md:max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                    {generatedTest.questions.map((q, idx) => {
                      const isAns = userAnswers[q.id || idx] !== undefined;
                      return (
                        <button
                          key={idx}
                          onClick={() => scrollToQuestion(idx)}
                          className={`h-7 rounded-lg text-[11px] font-bold flex items-center justify-center border transition-all ${
                            isAns
                              ? 'bg-[#B85B14] border-[#B85B14] text-white shadow-xs'
                              : 'bg-[#FAF6F0] border-[#E6DCCF] text-[#7A6B63] hover:border-[#B85B14]/40'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden md:block pt-3 border-t border-[#E6DCCF] text-[10px] text-[#7A6B63] font-medium space-y-1">
                  <p className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#B85B14]"></span> Answered
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#FAF6F0] border border-[#E6DCCF]"></span> Unattempted
                  </p>
                </div>
              </div>

              {/* Scrollable Questions Canvas (End-to-End) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 scrollbar-thin touch-pan-y max-w-4xl mx-auto w-full">
                {generatedTest.questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id || idx] !== undefined;

                  return (
                    <div
                      id={`full-q-${idx}`}
                      key={q.id || idx}
                      className={`bg-white border rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs transition-all ${
                        isAnswered
                          ? 'border-[#B85B14] ring-1 ring-[#B85B14]/20'
                          : 'border-[#E6DCCF] hover:border-[#B85B14]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#F3E8DB]">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-white bg-[#B85B14] px-2.5 py-1 rounded-lg shrink-0">
                            Question {idx + 1}
                          </span>
                          {q.examSource && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3E8DB] text-[#8C4A1B] border border-[#E2CEB9]">
                              📜 {q.examSource}
                            </span>
                          )}
                        </div>
                        {isAnswered ? (
                          <span className="text-[10px] font-bold text-[#4D6B40] bg-[#EAF0E6] px-2 py-0.5 rounded border border-[#C6D8C0]">
                            ✓ Option Selected
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#7A6B63] bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#E6DCCF]">
                            Pending Answer
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-[#382820] leading-relaxed">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((option, optIdx) => {
                          const isSelected = userAnswers[q.id || idx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => setUserAnswers(prev => ({ ...prev, [q.id || idx]: optIdx }))}
                              className={`w-full text-left min-h-[48px] px-3.5 py-2.5 rounded-xl text-xs transition-all border flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#B85B14] border-[#B85B14] text-white font-bold shadow-xs'
                                  : 'bg-[#FAF6F0] border-[#E6DCCF] text-[#382820] hover:border-[#B85B14]/40 hover:bg-white font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-white text-[#B85B14]' : 'bg-[#E6DCCF]/60 text-[#382820]'
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="leading-tight">{option}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom Sticky Action Bar in Full Screen Mode */}
                <div className="pt-4 pb-12 flex justify-center">
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#B85B14] to-[#C86D27] hover:from-[#A04812] hover:to-[#B85B14] text-white font-black rounded-2xl text-sm shadow-md active:scale-95 transition-all flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-200" />
                    <span>Submit & Generate Detailed Analysis ({answeredCount}/{generatedTest.questions.length})</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* FULL SCREEN COMPREHENSIVE END-TO-END ANALYSIS & DIAGNOSTIC WINDOW */
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAF6F0] space-y-6 scrollbar-thin">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Comprehensive Score Card */}
                <div className="bg-white border border-[#E6DCCF] rounded-2xl p-6 shadow-xs text-center space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8DB] text-[#8C4A1B] text-xs font-bold border border-[#E2CEB9]">
                    <Award className="w-4 h-4 text-[#B85B14]" />
                    <span>Full Diagnostic Analysis Complete</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                    {/* Big Score Badge */}
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#EAF0E6] to-[#FAF6F0] text-[#4D6B40] flex flex-col items-center justify-center border-4 border-[#C6D8C0] shadow-sm">
                      <span className="text-3xl font-black">{score} / {generatedTest.questions.length}</span>
                      <span className="text-[10px] font-bold text-[#7A6B63]">Total Marks</span>
                    </div>

                    <div className="text-left space-y-1.5">
                      <h3 className="text-xl font-black text-[#382820]">
                        Accuracy: {Math.round(((score || 0) / generatedTest.questions.length) * 100)}%
                      </h3>
                      <p className="text-xs text-[#7A6B63] font-medium max-w-md">
                        {((score || 0) / generatedTest.questions.length) >= 0.8
                          ? '🌟 Excellent performance! You demonstrated high conceptual clarity.'
                          : '💡 Good practice run! Review the weak topics below to boost your exam score.'}
                      </p>
                      <span className="inline-block text-[10px] font-bold text-[#4D6B40] bg-[#EAF0E6] px-2.5 py-0.5 rounded border border-[#C6D8C0]">
                        Synced automatically to student Analysis tab
                      </span>
                    </div>
                  </div>

                  {/* High Level Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#F3E8DB]">
                    <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E6DCCF] text-center">
                      <p className="text-[10px] text-[#7A6B63] font-bold uppercase">Accuracy</p>
                      <p className="text-base font-black text-[#B85B14] mt-0.5">
                        {Math.round(((score || 0) / generatedTest.questions.length) * 100)}%
                      </p>
                    </div>
                    <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E6DCCF] text-center">
                      <p className="text-[10px] text-[#7A6B63] font-bold uppercase">Correct</p>
                      <p className="text-base font-black text-[#4D6B40] mt-0.5">{score}</p>
                    </div>
                    <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E6DCCF] text-center">
                      <p className="text-[10px] text-[#7A6B63] font-bold uppercase">Incorrect</p>
                      <p className="text-base font-black text-[#8C4A1B] mt-0.5">
                        {generatedTest.questions.length - (score || 0)}
                      </p>
                    </div>
                    <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#E6DCCF] text-center">
                      <p className="text-[10px] text-[#7A6B63] font-bold uppercase">Unattempted</p>
                      <p className="text-base font-black text-[#7A6B63] mt-0.5">
                        {generatedTest.questions.length - Object.keys(userAnswers).length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filterable Solutions & Detailed Explanations */}
                <div className="bg-white border border-[#E6DCCF] rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F3E8DB]">
                    <h4 className="text-sm font-black text-[#382820] flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#B85B14]" />
                      Question-by-Question Solution & Analysis
                    </h4>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#E6DCCF]">
                      <button
                        onClick={() => setSolutionFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          solutionFilter === 'all'
                            ? 'bg-[#B85B14] text-white shadow-xs'
                            : 'text-[#7A6B63] hover:text-[#382820]'
                        }`}
                      >
                        All ({generatedTest.questions.length})
                      </button>
                      <button
                        onClick={() => setSolutionFilter('correct')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          solutionFilter === 'correct'
                            ? 'bg-[#4D6B40] text-white shadow-xs'
                            : 'text-[#7A6B63] hover:text-[#382820]'
                        }`}
                      >
                        Correct ({score})
                      </button>
                      <button
                        onClick={() => setSolutionFilter('incorrect')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          solutionFilter === 'incorrect'
                            ? 'bg-[#8C4A1B] text-white shadow-xs'
                            : 'text-[#7A6B63] hover:text-[#382820]'
                        }`}
                      >
                        Incorrect ({generatedTest.questions.length - (score || 0)})
                      </button>
                    </div>
                  </div>

                  {/* Solution List */}
                  <div className="space-y-3.5">
                    {generatedTest.questions
                      .filter((q, idx) => {
                        const isCorrect = userAnswers[q.id || idx] === q.correctIndex;
                        if (solutionFilter === 'correct') return isCorrect;
                        if (solutionFilter === 'incorrect') return !isCorrect;
                        return true;
                      })
                      .map((q, idx) => {
                        const originalIndex = generatedTest.questions.findIndex(origQ => origQ === q);
                        const userChoice = userAnswers[q.id || originalIndex];
                        const isCorrect = userChoice === q.correctIndex;

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border space-y-2.5 text-xs transition-all ${
                              isCorrect
                                ? 'bg-[#EAF0E6]/50 border-[#C6D8C0]'
                                : 'bg-red-50/40 border-red-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-[#382820] leading-relaxed">
                                <span className="font-black text-[#B85B14] mr-1">Q{originalIndex + 1}.</span> {q.question}
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                isCorrect
                                  ? 'bg-[#4D6B40] text-white'
                                  : 'bg-[#8C4A1B] text-white'
                              }`}>
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <p className={`font-bold ${isCorrect ? 'text-[#4D6B40]' : 'text-[#8C4A1B]'}`}>
                                Your Answer: {userChoice !== undefined ? `${String.fromCharCode(65 + userChoice)}. ${q.options[userChoice]}` : 'Not Answered'}
                              </p>
                              {!isCorrect && (
                                <p className="text-[#4D6B40] font-bold">
                                  Correct Option: {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-[#E6DCCF]/60 text-[11px] text-[#7A6B63] space-y-1">
                              <p className="font-bold text-[#382820] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#B85B14]" /> Step-by-Step AI Solution:
                              </p>
                              <p className="leading-relaxed font-medium">{q.explanation}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-center space-x-3 pb-12">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setUserAnswers({});
                      setScore(null);
                    }}
                    className="px-5 py-2.5 bg-[#FAF6F0] hover:bg-[#F3E8DB] text-[#382820] font-bold rounded-xl text-xs border border-[#E6DCCF] flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4 text-[#B85B14]" />
                    <span>Retake Test</span>
                  </button>

                  <button
                    onClick={handleCloseTestWindow}
                    className="px-6 py-2.5 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    Back to Practice Hub
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

