export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  STUDY = 'STUDY',
  LAB = 'LAB',
  EXAM = 'EXAM',
  DEPLOY = 'DEPLOY'
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
  userAnswer?: number;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export interface LabScenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  initialPrompt: string; // The prompt to send to Gemini to start the persona
  objective: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  domain: string;
  icon: string;
}

export enum GeminiModel {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
}
