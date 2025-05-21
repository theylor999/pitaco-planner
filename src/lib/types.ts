
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  taskDate: string; // YYYY-MM-DD
  taskTime?: string; // HH:mm, opcional
  priority: TaskPriority;
  completed: boolean;
  createdAt: string; // ISO string
  icon?: string; // Nome do ícone Lucide (opcional)
}

export interface GameEvent { // Renamed from FuriaGame and generalized
  id:string;
  teamName: string; // e.g., "FURIA", "América-RN"
  opponent: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or "TBD"
  tournament: string;
  bettingLink?: string; // Optional link for betting
}

export type CalendarViewMode = 'day' | 'week' | 'month';
