import React, { useState, useEffect } from 'react';
import { getDeviceAnalysis, saveDeviceAnalysis } from '../../lib/api';
import { DeviceStudentAnalysis, TestSubmission } from '../../types';
import { BarChart3, Video, FileCheck, Clock, Award, RefreshCw, Smartphone, AlertTriangle, Target, TrendingUp, X, CheckCircle2, XCircle, FileText, ChevronRight, Sparkles } from 'lucide-react';

export const AnalysisTab: React.FC = () => {
  const [analysis, setAnalysis] = useState<DeviceStudentAnalysis>(getDeviceAnalysis());
  const [selectedTestDetail, setSelectedTestDetail] = useState<TestSubmission | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const handleRefreshLocalData = () => {
    setAnalysis(getDeviceAnalysis());
  };

  const handleExecuteReset = () => {
    const cleanData: DeviceStudentAnalysis = {
      deviceId: analysis.deviceId,
      totalLecturesViewed: 0,
      completedLecturesCount: 0,
      totalWatchTimeSeconds: 0,
      testsCompletedCount: 0,
      averageTestScore: 0,
      lectureLogs: [],
      testSubmissions: [],
      weakTopics: [],
      lastActive: new Date().toISOString(),
    };
    saveDeviceAnalysis(cleanData);
    setAnalysis(cleanData);
    setShowResetConfirmModal(false);
  };

  useEffect(() => {
    handleRefreshLocalData();
    const timer = setInterval(() => {
      handleRefreshLocalData();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Strictly calculate metrics from actual action logs to prevent any phantom/hallucinated data
  const realLectureLogs = analysis.lectureLogs || [];
  const realTestSubmissions = analysis.testSubmissions || [];
  const realWeakTopics = analysis.weakTopics || [];

  const realWatchSeconds = realLectureLogs.reduce((acc, curr) => acc + (curr.watchedSeconds || 0), 0);
  const totalWatchMinutes = Math.round(realWatchSeconds / 60);
  const realLecturesCount = realLectureLogs.length;
  const realCompletedLectures = realLectureLogs.filter(l => l.completed).length;

  const realTestsCount = realTestSubmissions.length;
  const realAvgScore = realTestsCount > 0
    ? Math.round(realTestSubmissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / realTestsCount)
    : 0;

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header */}
      <div className="bg-white border border-[#E6DCCF] rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <h2 className="text-base font-black text-[#382820]">Performance Log</h2>
          <p className="text-[10px] text-[#7A6B63] font-medium flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-[#B85B14]" />
            <span>Isolated Device Storage (<code className="text-[#B85B14] font-mono">{analysis.deviceId}</code>)</span>
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleRefreshLocalData}
            className="p-2 rounded-xl bg-[#FAF6F0] border border-[#E6DCCF] text-[#382820] hover:bg-[#F3E8DB] transition-colors"
            title="Refresh Analysis"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="px-2.5 py-1.5 text-[10px] font-bold text-[#8C4A1B] bg-[#F3E8DB] border border-[#E2CEB9] rounded-xl hover:bg-[#EAE0D2] transition-colors cursor-pointer active:scale-95"
            title="Reset Device Activity Logs"
          >
            Reset Metrics
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-[#E6DCCF] rounded-2xl p-3.5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#7A6B63] text-xs font-bold">
            <span>Lectures Watched</span>
            <Video className="w-4 h-4 text-[#B85B14]" />
          </div>
          <div className="text-xl font-black text-[#382820]">
            {realLecturesCount}
          </div>
          <p className="text-[10px] text-[#7A6B63] font-medium">{realCompletedLectures} Completed</p>
        </div>

        <div className="bg-white border border-[#E6DCCF] rounded-2xl p-3.5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#7A6B63] text-xs font-bold">
            <span>Tests Completed</span>
            <FileCheck className="w-4 h-4 text-[#C86D27]" />
          </div>
          <div className="text-xl font-black text-[#382820]">
            {realTestsCount}
          </div>
          <p className="text-[10px] text-[#7A6B63] font-medium">Avg Score: {realAvgScore}%</p>
        </div>

        <div className="bg-white border border-[#E6DCCF] rounded-2xl p-3.5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#7A6B63] text-xs font-bold">
            <span>Watch Time</span>
            <Clock className="w-4 h-4 text-[#B85B14]" />
          </div>
          <div className="text-xl font-black text-[#382820]">
            {totalWatchMinutes} <span className="text-xs font-normal text-[#7A6B63]">mins</span>
          </div>
          <p className="text-[10px] text-[#7A6B63] font-medium">Actual video playback</p>
        </div>

        <div className="bg-white border border-[#E6DCCF] rounded-2xl p-3.5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#7A6B63] text-xs font-bold">
            <span>Overall Accuracy</span>
            <Award className="w-4 h-4 text-[#4D6B40]" />
          </div>
          <div className="text-xl font-black text-[#382820]">
            {realAvgScore}%
          </div>
          <p className="text-[10px] text-[#7A6B63] font-medium">Based on real quizzes</p>
        </div>
      </div>

      {/* WEAK TOPICS / AREAS FOR GROWTH SECTION */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#382820] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#B85B14]" /> Weak Topics & Growth Areas
          </h3>
          <span className="text-[10px] font-bold text-[#8C4A1B] bg-[#F3E8DB] px-2 py-0.5 rounded border border-[#E2CEB9]">
            {realWeakTopics.length} Focus Areas
          </span>
        </div>

        {realWeakTopics.length === 0 ? (
          <div className="bg-white border border-[#E6DCCF] p-5 rounded-2xl text-center space-y-1 shadow-xs">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#EAF0E6] text-[#4D6B40] flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#382820]">No Weak Topics Identified Yet</p>
            <p className="text-[10px] text-[#7A6B63] font-medium">
              Attempt practice quizzes in the Practice tab. Any topics or questions where you miss marks will automatically appear here for focused revision!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {realWeakTopics.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E2CEB9] p-3.5 rounded-xl space-y-2 shadow-xs hover:border-[#B85B14]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF6F0] text-[#8C4A1B] border border-[#E6DCCF] uppercase">
                      {item.subject || 'Topic Area'}
                    </span>
                    <h4 className="font-black text-xs text-[#382820] mt-1">{item.topic}</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3E8DB] text-[#8C4A1B] border border-[#E2CEB9] shrink-0">
                    {item.accuracyPercentage}% Accuracy
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#7A6B63] pt-2 border-t border-[#F3E8DB] font-medium">
                  <span className="flex items-center gap-1 text-[#8C4A1B] font-bold">
                    <TrendingUp className="w-3 h-3 text-[#B85B14]" />
                    {item.missedQuestionsCount} missed out of {item.totalQuestions} questions
                  </span>
                  <span>Last Attempt: {item.lastAttempted}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LECTURES VIEWED TRACK RECORD */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-black text-[#382820] flex items-center gap-1.5">
          <Video className="w-4 h-4 text-[#B85B14]" /> Lectures Viewed Log
        </h3>

        {realLectureLogs.length === 0 ? (
          <div className="bg-white border border-[#E6DCCF] p-6 rounded-2xl text-center space-y-1 shadow-xs">
            <p className="text-xs font-bold text-[#382820]">No lecture actions recorded yet</p>
            <p className="text-[10px] text-[#7A6B63] font-medium">
              Open any batch from the Study tab and play a video lesson to record your viewing history!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {realLectureLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-[#E6DCCF] p-3 rounded-xl flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-[#382820]">{log.lectureTitle}</h4>
                  <p className="text-[10px] text-[#7A6B63] mt-0.5 font-medium">
                    Watched {Math.round(log.watchedSeconds / 60)} mins • {log.timestamp}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF0E6] text-[#4D6B40] border border-[#C6D8C0]">
                  COMPLETED
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TEST SUBMISSIONS HISTORY */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#382820] flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-[#B85B14]" /> Test Performance Track
          </h3>
          <span className="text-[10px] text-[#7A6B63] font-bold">
            {realTestSubmissions.length} Saved Attempt{realTestSubmissions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {realTestSubmissions.length === 0 ? (
          <div className="bg-white border border-[#E6DCCF] p-6 rounded-2xl text-center space-y-1 shadow-xs">
            <p className="text-xs font-bold text-[#382820]">No quiz attempts recorded yet</p>
            <p className="text-[10px] text-[#7A6B63] font-medium">
              Generate an auto-test in the Practice tab or attempt a batch test to populate your performance metrics.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {realTestSubmissions.map((sub) => {
              const formattedDate = new Date(sub.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedTestDetail(sub)}
                  className="bg-white border border-[#E6DCCF] hover:border-[#B85B14] p-3.5 rounded-xl flex items-center justify-between text-xs shadow-xs transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#FAF6F0] text-[#8C4A1B] border border-[#E6DCCF] uppercase">
                        {sub.subject || 'Quiz Attempt'}
                      </span>
                      <span className="text-[10px] text-[#7A6B63] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#B85B14]" />
                        {formattedDate}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#382820] text-xs group-hover:text-[#B85B14] transition-colors">
                      {sub.testTitle}
                    </h4>
                    <p className="text-[10px] text-[#7A6B63] font-medium">
                      Score: <strong className="text-[#382820]">{sub.score} / {sub.totalQuestions}</strong> correct ({sub.percentage}%)
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${
                        sub.percentage >= 70
                          ? 'bg-[#EAF0E6] text-[#4D6B40] border-[#C6D8C0]'
                          : 'bg-[#F3E8DB] text-[#8C4A1B] border-[#E2CEB9]'
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#7A6B63] group-hover:text-[#B85B14] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILED TEST ANALYSIS MODAL OVERLAY */}
      {selectedTestDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-[#FAF6F0] border border-[#E6DCCF] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-[#E6DCCF] flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#B85B14] text-white uppercase tracking-wider">
                    {selectedTestDetail.subject || 'Test Analysis'}
                  </span>
                  <span className="text-[10px] text-[#7A6B63] font-bold">
                    Attempted on {new Date(selectedTestDetail.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <h3 className="text-sm font-black text-[#382820]">{selectedTestDetail.testTitle}</h3>
              </div>

              <button
                onClick={() => setSelectedTestDetail(null)}
                className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E8DB] text-[#382820] transition-colors border border-[#E6DCCF] active:scale-95 cursor-pointer"
                title="Close Analysis"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white border border-[#E6DCCF] p-3 rounded-xl space-y-1 text-center shadow-xs">
                  <span className="text-[10px] font-bold text-[#7A6B63] uppercase">Final Score</span>
                  <p className="text-lg font-black text-[#382820]">
                    {selectedTestDetail.score} <span className="text-xs font-normal text-[#7A6B63]">/ {selectedTestDetail.totalQuestions}</span>
                  </p>
                </div>

                <div className="bg-white border border-[#E6DCCF] p-3 rounded-xl space-y-1 text-center shadow-xs">
                  <span className="text-[10px] font-bold text-[#7A6B63] uppercase">Accuracy</span>
                  <p className={`text-lg font-black ${selectedTestDetail.percentage >= 70 ? 'text-[#4D6B40]' : 'text-[#8C4A1B]'}`}>
                    {selectedTestDetail.percentage}%
                  </p>
                </div>

                <div className="bg-white border border-[#E6DCCF] p-3 rounded-xl space-y-1 text-center shadow-xs">
                  <span className="text-[10px] font-bold text-[#7A6B63] uppercase">Time Spent</span>
                  <p className="text-lg font-black text-[#382820]">
                    {Math.max(1, Math.round((selectedTestDetail.timeSpentSeconds || 300) / 60))} <span className="text-xs font-normal text-[#7A6B63]">mins</span>
                  </p>
                </div>

                <div className="bg-white border border-[#E6DCCF] p-3 rounded-xl space-y-1 text-center shadow-xs">
                  <span className="text-[10px] font-bold text-[#7A6B63] uppercase">Status</span>
                  <p className="text-xs font-black text-[#382820] pt-1">
                    {selectedTestDetail.percentage >= 80
                      ? '🌟 Outstanding'
                      : selectedTestDetail.percentage >= 60
                      ? '👍 Good Pass'
                      : '⚠️ Focus Required'}
                  </p>
                </div>
              </div>

              {/* Weak Topics Flagged in this attempt */}
              {selectedTestDetail.weakTopics && selectedTestDetail.weakTopics.length > 0 && (
                <div className="bg-[#FAF6F0] border border-[#E2CEB9] p-3.5 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-bold text-[#8C4A1B] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#B85B14]" />
                    <span>Topics to Revise From This Attempt</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedTestDetail.weakTopics.map((topic, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white text-[#382820] border border-[#E6DCCF]">
                        • {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Question-by-Question Review Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#E6DCCF] pb-2">
                  <h4 className="text-xs font-black text-[#382820] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#B85B14]" />
                    <span>Question Breakdown & Solutions ({selectedTestDetail.questionDetails?.length || 0})</span>
                  </h4>
                </div>

                {!selectedTestDetail.questionDetails || selectedTestDetail.questionDetails.length === 0 ? (
                  <div className="bg-white border border-[#E6DCCF] p-5 rounded-xl text-center space-y-1">
                    <p className="text-xs font-bold text-[#382820]">Score Summary Saved</p>
                    <p className="text-[10px] text-[#7A6B63] font-medium">
                      Detailed question-by-question explanations are recorded for all new quiz attempts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTestDetail.questionDetails.map((q, qIdx) => {
                      const isCorrect = q.userAnswerIndex === q.correctIndex;

                      return (
                        <div
                          key={qIdx}
                          className={`p-3.5 rounded-xl border space-y-2 text-xs bg-white ${
                            isCorrect ? 'border-[#C6D8C0]' : 'border-[#E2CEB9]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-[#382820] flex items-center gap-1.5">
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-[#4D6B40] shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-[#B85B14] shrink-0" />
                              )}
                              <span>Q{qIdx + 1}. {q.question}</span>
                            </span>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded uppercase shrink-0 ${
                                isCorrect
                                  ? 'bg-[#EAF0E6] text-[#4D6B40] border border-[#C6D8C0]'
                                  : 'bg-[#F3E8DB] text-[#8C4A1B] border border-[#E2CEB9]'
                              }`}
                            >
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>

                          {/* Options breakdown */}
                          <div className="space-y-1 pt-1 pl-5">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = q.userAnswerIndex === oIdx;
                              const isRightOption = q.correctIndex === oIdx;

                              let optStyle = 'bg-[#FAF6F0] text-[#7A6B63] border-[#E6DCCF]';
                              if (isRightOption) {
                                optStyle = 'bg-[#EAF0E6] text-[#382820] font-bold border-[#C6D8C0]';
                              } else if (isSelected && !isRightOption) {
                                optStyle = 'bg-[#F3E8DB] text-[#8C4A1B] font-bold border-[#E2CEB9]';
                              }

                              return (
                                <div
                                  key={oIdx}
                                  className={`px-3 py-1.5 rounded-lg border text-[11px] flex items-center justify-between ${optStyle}`}
                                >
                                  <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                  <div className="flex items-center gap-1 text-[9px] font-bold">
                                    {isRightOption && <span className="text-[#4D6B40]">✓ Correct Answer</span>}
                                    {isSelected && !isRightOption && <span className="text-[#8C4A1B]">✗ Your Choice</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <div className="bg-[#FAF6F0] border border-[#E6DCCF] p-2.5 rounded-lg text-[10px] text-[#7A6B63] leading-relaxed mt-2 pl-5">
                              <strong className="text-[#382820] block mb-0.5">Explanation:</strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-[#E6DCCF] flex items-center justify-between shrink-0">
              <span className="text-[10px] text-[#7A6B63] font-medium">
                Analysis preserved 100% in local device memory
              </span>
              <button
                onClick={() => setSelectedTestDetail(null)}
                className="px-4 py-2 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR RESET METRICS */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF6F0] border border-[#E6DCCF] rounded-2xl w-full max-w-sm p-4 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#E6DCCF] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#F3E8DB] border border-[#E2CEB9] flex items-center justify-center text-[#8C4A1B]">
                  <AlertTriangle className="w-4 h-4 text-[#B85B14]" />
                </div>
                <h3 className="text-xs font-black text-[#382820]">Reset Performance Log</h3>
              </div>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="p-1.5 rounded-xl bg-white border border-[#E6DCCF] text-[#382820] hover:bg-[#F3E8DB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A6B63] font-medium leading-relaxed">
              Are you sure you want to clear all your local watch time logs, test performance history, and weak topic records? This action cannot be undone.
            </p>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2 bg-white border border-[#E6DCCF] text-[#382820] font-bold text-xs rounded-xl hover:bg-[#F3E8DB] transition-all cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                className="flex-1 py-2 bg-[#B85B14] hover:bg-[#A04812] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
