export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar_color?: string;
  status?: 'active' | 'inactive';
}

export interface Project {
  id: string;
  name: string;
  client_id?: string;
  category?: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  progress: number;
  start_date?: string;
  due_date?: string;
  budget?: number;
  clients?: {
    name: string;
  };
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string; // View or joined
  total_amount: number; // From view
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue';
  issue_date: string;
}

export interface Event {
  id: string;
  title: string;
  category: '미팅' | '마감일' | '인보이스' | '개인' | '기타';
  color: string;
  start_date: string;
  start_time?: string;
  all_day: boolean;
}
