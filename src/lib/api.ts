import { AppSyncData, DeviceStudentAnalysis, LectureViewLog, TestSubmission, ChatMessage, Batch, ContentItem } from '../types';

const DEVICE_KEY = 'bharated_device_id_v1';
const LOCAL_ANALYSIS_KEY = 'bharated_student_analysis_v1';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = 'dev-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getDeviceAnalysis(): DeviceStudentAnalysis {
  const deviceId = getDeviceId();
  const raw = localStorage.getItem(LOCAL_ANALYSIS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  return {
    deviceId,
    totalLecturesViewed: 0,
    completedLecturesCount: 0,
    totalWatchTimeSeconds: 0,
    testsCompletedCount: 0,
    averageTestScore: 0,
    lectureLogs: [],
    testSubmissions: [],
    lastActive: new Date().toISOString(),
  };
}

export function saveDeviceAnalysis(analysis: DeviceStudentAnalysis) {
  analysis.lastActive = new Date().toISOString();
  localStorage.setItem(LOCAL_ANALYSIS_KEY, JSON.stringify(analysis));

  // Sync to server in real-time
  fetch('/api/analytics/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis }),
  }).catch(err => console.error('Failed to sync device analytics to server:', err));
}

export async function syncDeviceAnalysisFromServer(): Promise<DeviceStudentAnalysis> {
  const deviceId = getDeviceId();
  try {
    const res = await fetch(`/api/analytics/${deviceId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.analysis) {
        localStorage.setItem(LOCAL_ANALYSIS_KEY, JSON.stringify(data.analysis));
        return data.analysis;
      }
    }
  } catch (err) {
    console.error('Failed to fetch synced analytics:', err);
  }
  return getDeviceAnalysis();
}

export function logLectureView(
  batchId: string,
  lectureId: string,
  lectureTitle: string,
  watchedSeconds: number,
  durationSeconds: number,
  completed: boolean
) {
  const analysis = getDeviceAnalysis();
  const existingLogIndex = analysis.lectureLogs.findIndex(l => l.lectureId === lectureId);

  const log: LectureViewLog = {
    id: `log-${Date.now()}`,
    batchId,
    lectureId,
    lectureTitle,
    durationSeconds,
    watchedSeconds,
    completed,
    timestamp: new Date().toISOString(),
  };

  if (existingLogIndex >= 0) {
    analysis.lectureLogs[existingLogIndex] = log;
  } else {
    analysis.lectureLogs.unshift(log);
    analysis.totalLecturesViewed += 1;
  }

  if (completed) {
    const totalCompleted = analysis.lectureLogs.filter(l => l.completed).length;
    analysis.completedLecturesCount = totalCompleted;
  }

  analysis.totalWatchTimeSeconds += watchedSeconds;
  saveDeviceAnalysis(analysis);
}

export function logTestSubmission(
  testId: string,
  testTitle: string,
  score: number,
  totalQuestions: number,
  timeSpentSeconds: number,
  subject?: string,
  weakTopicsList?: string[],
  questionDetails?: {
    question: string;
    userAnswerIndex?: number;
    correctIndex: number;
    options: string[];
    explanation?: string;
  }[]
) {
  const analysis = getDeviceAnalysis();
  const percentage = Math.round((score / Math.max(1, totalQuestions)) * 100);

  const submission: TestSubmission = {
    id: `sub-${Date.now()}`,
    testId,
    testTitle,
    subject,
    score,
    totalQuestions,
    percentage,
    timeSpentSeconds,
    weakTopics: weakTopicsList,
    questionDetails,
    timestamp: new Date().toISOString(),
  };

  analysis.testSubmissions.unshift(submission);
  analysis.testsCompletedCount += 1;

  const totalPercentages = analysis.testSubmissions.reduce((acc, curr) => acc + curr.percentage, 0);
  analysis.averageTestScore = Math.round(totalPercentages / Math.max(1, analysis.testSubmissions.length));

  // Update weak topics tracking based on test results appeared
  if (!analysis.weakTopics) {
    analysis.weakTopics = [];
  }

  // If student missed questions in this test, record the test title/topic as a weak topic
  const missedCount = totalQuestions - score;
  if (missedCount > 0) {
    const existingIndex = analysis.weakTopics.findIndex(w => w.topic.toLowerCase() === testTitle.toLowerCase());
    const topicEntry = {
      topic: testTitle,
      subject: subject || 'Science & Math',
      missedQuestionsCount: missedCount,
      totalQuestions: totalQuestions,
      accuracyPercentage: percentage,
      lastAttempted: new Date().toLocaleDateString(),
    };

    if (existingIndex >= 0) {
      analysis.weakTopics[existingIndex] = topicEntry;
    } else {
      analysis.weakTopics.unshift(topicEntry);
    }
  } else {
    // If student scored 100%, remove from weak topics if it was previously listed
    analysis.weakTopics = analysis.weakTopics.filter(w => w.topic.toLowerCase() !== testTitle.toLowerCase());
  }

  saveDeviceAnalysis(analysis);
}

// Custom Gemini API Key Management for APK / standalone deployments
export function getCustomGeminiKey(): string {
  return localStorage.getItem('bharated_custom_gemini_key') || '';
}

export function saveCustomGeminiKey(key: string) {
  if (!key || key.trim() === '') {
    localStorage.removeItem('bharated_custom_gemini_key');
  } else {
    localStorage.setItem('bharated_custom_gemini_key', key.trim());
  }
}

function getAiRequestHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const customKey = getCustomGeminiKey();
  if (customKey) {
    headers['x-gemini-key'] = customKey;
  }
  return headers;
}

// Server API Calls
export async function fetchAppState(): Promise<AppSyncData> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Failed to fetch state');
  return res.json();
}

export async function syncAppState(): Promise<AppSyncData> {
  const res = await fetch('/api/sync', { method: 'POST' });
  if (!res.ok) throw new Error('Pull to refresh sync failed');
  return res.json();
}

export async function loginEducator(userId: string, pass: string) {
  const res = await fetch('/api/educator/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password: pass }),
  });
  return res.json();
}

export async function createBatch(batchData: Partial<Batch>) {
  const res = await fetch('/api/batches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchData),
  });
  return res.json();
}

export async function updateBatch(batchId: string, batchData: Partial<Batch>) {
  const res = await fetch(`/api/batches/${batchId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchData),
  });
  return res.json();
}

export async function addBatchContent(batchId: string, contentData: Partial<ContentItem>) {
  const res = await fetch(`/api/batches/${batchId}/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contentData),
  });
  return res.json();
}

export async function deleteBatch(batchId: string) {
  const res = await fetch(`/api/batches/${batchId}`, { method: 'DELETE' });
  return res.json();
}

export async function sendBharatAIChat(prompt: string, history: ChatMessage[] = []) {
  const customKey = getCustomGeminiKey();
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: getAiRequestHeaders(),
    body: JSON.stringify({ prompt, history, customApiKey: customKey }),
  });
  return res.json();
}

export async function generateAITest(prompt: string, subject?: string, questionCount: number = 15) {
  const customKey = getCustomGeminiKey();
  const res = await fetch('/api/ai/generate-test', {
    method: 'POST',
    headers: getAiRequestHeaders(),
    body: JSON.stringify({ prompt, subject, questionCount, customApiKey: customKey }),
  });
  return res.json();
}

export async function formatQuizFromRawText(rawText: string) {
  const customKey = getCustomGeminiKey();
  const res = await fetch('/api/ai/format-quiz', {
    method: 'POST',
    headers: getAiRequestHeaders(),
    body: JSON.stringify({ rawText, customApiKey: customKey }),
  });
  return res.json();
}

export async function generateQuizFromRandomText(randomText: string) {
  const customKey = getCustomGeminiKey();
  const res = await fetch('/api/ai/generate-from-random-text', {
    method: 'POST',
    headers: getAiRequestHeaders(),
    body: JSON.stringify({ randomText, customApiKey: customKey }),
  });
  return res.json();
}
