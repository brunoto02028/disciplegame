// Core Types for O Discípulo Application

export interface User {
  id: string;
  email: string;
  name: string;
  country?: string;
  church?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface City {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  modernName?: string;
  description: string;
  descriptionEn: string;
  biblicalContext: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  order: number;
  circuitId: string;
}

export interface Circuit {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cities: City[];
  estimatedTime: number; // in minutes
  totalQuestions: number;
}

export enum QuestionBlock {
  BIBLICAL = 1,
  GEOGRAPHY = 2,
  TOURISM = 3,
}

export enum QuestionDifficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

export interface Question {
  id: string;
  cityId: string;
  block: QuestionBlock;
  difficulty: QuestionDifficulty;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface UserAnswer {
  id: string;
  userId: string;
  questionId: string;
  sessionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timeTaken: number; // in seconds
  answeredAt: Date;
}

export interface GameSession {
  id: string;
  userId: string;
  circuitId: string;
  startedAt: Date;
  completedAt?: Date;
  currentCityIndex: number;
  totalPoints: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface Ranking {
  id: string;
  userId: string;
  circuitId: string;
  totalPoints: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  completedAt: Date;
  rank?: number;
  user?: User;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  achievement?: Achievement;
}

export interface WeeklyChallenge {
  id: string;
  week: number;
  year: number;
  cityId: string;
  targetTime: number; // in seconds
  bonusPoints: number;
  startDate: Date;
  endDate: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Game State Types
export interface GameState {
  session: GameSession;
  currentCity: City;
  questions: Question[];
  currentQuestionIndex: number;
  answers: UserAnswer[];
  elapsedTime: number;
}

export interface QuestionResult {
  question: Question;
  userAnswer: UserAnswer;
  isCorrect: boolean;
  points: number;
}

export interface SessionResult {
  session: GameSession;
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  accuracyPercentage: number;
  totalTime: number;
  rank: number;
  questionResults: QuestionResult[];
}
