
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: number;
  dueDate: number;
  subtasks?: string[];
  pointsEarned?: number;
}

export type Priority = 'low' | 'medium' | 'high';

export interface AIAnalysisResponse {
  priority: Priority;
  category: string;
  subtasks: string[];
}
