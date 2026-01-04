export interface Lead {
  id: string; // Mantenemos string en frontend para compatibilidad UI, convertimos en servicio
  name: string;
  address?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string; // 'Transporte' etc.
  clase?: 'A' | 'B' | 'C' | string;
  status?: string;
  probability?: string;
  value?: number;
  lastContact?: string;
  nextAction?: string;
  notes?: string;
  agent?: string;
  isSelected?: boolean;
  isSynced?: boolean;
  createdAt?: string;
  // Eliminado notionData
}

export interface User {
  name: string;
  avatarUrl: string;
}

export interface HistoryItem {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | string;
  title: string;
  description?: string; // Mapeado a 'comment' del backend
  comment?: string; // Para compatibilidad directa
  timestamp: string;
  isoDate?: string;
  user: User;
  clientId?: string;
  clientName?: string;
  clientWebsite?: string;
  isSynced?: boolean;
}

export enum NoteType {
  Call = 'call',
  Email = 'email',
  Internal = 'note'
}

export interface QuoteItem {
  id: string;
  quantity: number;
  description: string;
  unitPrice: number;
  amount: number;
}

export interface Quote {
  id: string;
  folio: string;
  date: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  items: QuoteItem[];
  subtotal: number;
  iva: number;
  retIsr?: number;
  total: number;
  notes: string;
  agent: string;
}
