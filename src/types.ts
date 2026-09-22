export type Priority = 'high' | 'medium' | 'low';

export type Category = 'Ish' | 'O\'qish' | 'Shaxsiy' | 'Sog\'liq' | 'Loyiha' | 'Moliya';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  dueTime?: string;
  subtasks: Subtask[];
  pomodoroMinutesSpent?: number;
}

export type FilterType = 'all' | 'active' | 'completed' | 'urgent' | 'today';

export type SortType = 'newest' | 'priority' | 'dueDate' | 'title';

export interface DailyStats {
  streak: number;
  lastActiveDate: string;
  totalCompletedCount: number;
}

export interface CategoryInfo {
  label: Category;
  color: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  iconName: string;
}
