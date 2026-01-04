export interface Lead {
    id: number;
    name: string;
    phone: string;
    address: string;
    website?: string;
    clase: 'A' | 'B' | 'C';
    agent: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    history?: HistoryItem[];
}

export interface Client {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    tags?: string; // Comma separated tags
    clase: 'A' | 'B' | 'C';
    agent: string;
    status: string; // 'active', 'inactive'
    createdAt: string;
    history?: HistoryItem[];
    quotes?: any[];
}

export interface HistoryItem {
    id: number;
    date: string;
    title: string;
    type: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp';
    comment: string;
    agent: string;
    clientId?: number;
    leadId?: number;
}
