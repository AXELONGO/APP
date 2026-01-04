import { Lead, HistoryItem } from "../types";

const API_BASE_URL = "/api";

// Helper para convertir datos de Prisma a la estructura del Frontend (principalmente IDs a string)
const mapLeadFromBackend = (data: any): Lead => ({
    ...data,
    id: data.id.toString(),
    // Mapear otros campos si es necesario
});

const mapHistoryFromBackend = (data: any): HistoryItem => ({
    ...data,
    id: data.id.toString(),
    clientId: data.clientId ? data.clientId.toString() : undefined,
    isoDate: data.createdAt || new Date().toISOString(),
    timestamp: new Date(data.createdAt || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    user: { name: data.agent || 'Unknown', avatarUrl: '' }
});

// --- LEADS ---

export const getLeadsFromApi = async (): Promise<Lead[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leads`);
        if (!response.ok) throw new Error(await response.text());
        const leads = await response.json();
        return leads.map(mapLeadFromBackend);
    } catch (error) {
        console.error("Error obteniendo leads:", error);
        return [];
    }
};

export const createLeadInApi = async (lead: Partial<Lead>): Promise<Lead | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return mapLeadFromBackend(data);
    } catch (error) {
        console.error("Error creando lead:", error);
        return null;
    }
};

export const updateLeadClass = async (leadId: string, newClass: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clase: newClass })
        });
        if (!response.ok) throw new Error(await response.text());
        return true;
    } catch (error) {
        console.error("Error updating lead class:", error);
        return false;
    }
}

// --- SUPPORT ---

export const getSupportTicketsFromApi = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/support-tickets`);
        if (!response.ok) throw new Error(await response.text());
        const tickets = await response.json();
        return tickets.map(mapHistoryFromBackend); // Treating as history items
    } catch (error) {
        console.error("Error fetching support tickets:", error);
        return [];
    }
};

// --- CLIENTES ---

export const getClientsFromApi = async (): Promise<Lead[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        if (!response.ok) throw new Error(await response.text());
        const clients = await response.json();
        return clients.map(mapLeadFromBackend);
    } catch (error) {
        console.error("Error obteniendo clientes:", error);
        return [];
    }
};

export const createClientInApi = async (client: Partial<Lead>): Promise<Lead | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client)
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return mapLeadFromBackend(data);
    } catch (error) {
        console.error("Error creando cliente:", error);
        return null;
    }
}

// --- HISTORIAL ---

export const getHistoryFromApi = async (clientId?: string): Promise<HistoryItem[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/history`);
        if (!response.ok) throw new Error(await response.text());
        let items = await response.json();
        
        // El backend devuelve todo el historial, filtramos en cliente si se pide (ineficiente pero funcional para MVP local)
        // O idealmente pasamos query params. El controlador backend getHistory actual no filtra por query params.
        items = items.map(mapHistoryFromBackend);

        if (clientId) {
            items = items.filter((i: HistoryItem) => i.clientId === clientId || i.clientId === parseInt(clientId).toString());
        }
        return items;
    } catch (error) {
        console.error("Error obteniendo historial:", error);
        return [];
    }
};

export const addHistoryToApi = async (clientId: string, text: string, agent: string, type: string): Promise<HistoryItem | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: parseInt(clientId), // Convertir a int para backend
                comment: text,
                agent,
                type,
                title: type
            })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return mapHistoryFromBackend(data);
    } catch (error) {
        console.error("Error añadiendo historial:", error);
        return null;
    }
};
