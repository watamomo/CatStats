export interface Task {
  id: string;
  title: string;
  description?: string;
  content?: string;
  progress?: number;
  assigned_to?: {
    id: string;
    name: string;
  } | null;
  due_date?: string;
  status: 'pendiente' | 'en progreso' | 'completado';
}
