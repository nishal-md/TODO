
export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: number;
  dueDate: number;
  completedAt?: number;
  subtasks?: Subtask[];
  pointsEarned?: number;
}

export type Priority = 'low' | 'medium' | 'high';

export interface AIAnalysisResponse {
  priority: Priority;
  category: string;
  subtasks: string[];
}

export interface WeeklyInsight {
  score: number;
  summary: string;
  advice: string;
}
