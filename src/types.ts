export type ContentType = 'video' | 'pdf' | 'dpp' | 'test' | 'study_material';

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  examSource?: string;
}

export interface ContentItem {
  id: string;
  batchId: string;
  folderCategory: string;
  type: ContentType;
  title: string;
  description?: string;
  url?: string;
  duration?: string;
  fileSize?: string;
  questions?: TestQuestion[];
  createdAt: string;
}

export interface BatchFolder {
  id: string;
  name: string;
  category: string;
  itemsCount: number;
}

export interface Batch {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string; // e.g. 'JEE Advanced', 'NEET UG', 'Class 12 Boards', 'Foundation'
  isPaid: boolean;
  price: number;
  originalPrice?: number;
  bannerGradient: string;
  thumbnailTag: string;
  thumbnailUrl?: string;
  heroImageUrl?: string;
  enrolledCount: number;
  rating: number;
  educatorName: string;
  contents: ContentItem[];
  createdAt: string;
}

export interface AdvertisementBanner {
  id: string;
  title: string;
  subtitle: string;
  bgGradient: string;
  badge: string;
  batchId?: string;
  ctaText: string;
}

export interface LectureViewLog {
  id: string;
  batchId: string;
  lectureId: string;
  lectureTitle: string;
  durationSeconds: number;
  watchedSeconds: number;
  completed: boolean;
  timestamp: string;
}

export interface TestSubmission {
  id: string;
  testId: string;
  testTitle: string;
  subject?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  weakTopics?: string[];
  timestamp: string;
  questionDetails?: {
    question: string;
    userAnswerIndex?: number;
    correctIndex: number;
    options: string[];
    explanation?: string;
  }[];
}

export interface WeakTopicItem {
  topic: string;
  subject?: string;
  missedQuestionsCount: number;
  totalQuestions: number;
  accuracyPercentage: number;
  lastAttempted: string;
}

export interface DeviceStudentAnalysis {
  deviceId: string;
  totalLecturesViewed: number;
  completedLecturesCount: number;
  totalWatchTimeSeconds: number;
  testsCompletedCount: number;
  averageTestScore: number;
  lectureLogs: LectureViewLog[];
  testSubmissions: TestSubmission[];
  weakTopics?: WeakTopicItem[];
  lastActive: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isThinking?: boolean;
}

export interface AppSyncData {
  batches: Batch[];
  banners: AdvertisementBanner[];
  systemNotice?: string;
  lastServerUpdate: string;
}
