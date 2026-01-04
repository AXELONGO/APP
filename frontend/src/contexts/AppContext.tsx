import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLeadsManager } from '../hooks/useLeadsManager';
import { useClientsManager } from '../hooks/useClientsManager';
import { useHistoryManager } from '../hooks/useHistoryManager';
import { Lead, HistoryItem } from '../types';
import { useToast } from './ToastContext';
import {
    getLeadsFromApi,
    getHistoryFromApi,
    getClientsFromApi,
    addHistoryToApi,
    getSupportTicketsFromApi
} from '../services/apiService';


interface AppContextType {
    // Leads
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    activeLeadId: string | null;
    setActiveLeadId: React.Dispatch<React.SetStateAction<string | null>>;
    handleSelectLead: (id: string) => void;
    handleClassChange: (id: string, newClass: string) => Promise<void>;

    // Clients
    clients: Lead[];
    setClients: React.Dispatch<React.SetStateAction<Lead[]>>;
    activeClientId: string | null;
    setActiveClientId: React.Dispatch<React.SetStateAction<string | null>>;
    handleSelectClient: (id: string) => void;

    // History
    history: HistoryItem[];
    setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
    globalHistory: HistoryItem[];
    clientsHistory: HistoryItem[];
    saveNote: (text: string, agent: string, interactionType: string) => Promise<void>;

    // UI / Global
    activeTab: 'ventas' | 'cotizaciones' | 'clientes' | 'masivos';
    setActiveTab: React.Dispatch<React.SetStateAction<'ventas' | 'cotizaciones' | 'clientes' | 'masivos'>>;
    isLoadingNotion: boolean;
    supportTickets: any[];

    // Sidebar Control (shared)
    isLeftSidebarOpen: boolean;
    setIsLeftSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FALLBACK_LEADS: Lead[] = [];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const leadsManager = useLeadsManager();
    const clientsManager = useClientsManager();
    const historyManager = useHistoryManager();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'ventas' | 'cotizaciones' | 'clientes' | 'masivos'>('ventas');
    const [isLoadingNotion, setIsLoadingNotion] = useState(true); // Keeping name for compat, essentially isLoadingBackend
    const [supportTickets, setSupportTickets] = useState<any[]>([]);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(window.innerWidth >= 1024);

    // Initial Data Load
    useEffect(() => {
        const initData = async () => {
            setIsLoadingNotion(true);
            try {
                // Fetch basic data from Local API
                const [apiLeads, apiClients, apiTickets] = await Promise.all([
                    getLeadsFromApi(),
                    getClientsFromApi(),
                    getSupportTicketsFromApi()
                ]);

                // Fetch History (Global) - In real app, might be heavy, but local SQLite is fast enough for now
                const apiHistory = await getHistoryFromApi();

                leadsManager.setLeads(apiLeads.length ? apiLeads : FALLBACK_LEADS);
                clientsManager.setClients(apiClients);
                setSupportTickets(apiTickets);

                // Enrich History Logic
                const enrichedHistory = apiHistory.map(h => {
                     // Try to match with lead or client
                     const lead = apiLeads.find(l => l.id === h.clientId);
                     const client = apiClients.find(c => c.id === h.clientId);
                     const relatedEntity = lead || client;

                     return {
                        ...h,
                        clientName: relatedEntity ? relatedEntity.name : (h.clientName || 'Sin Asignar'),
                        clientWebsite: relatedEntity ? relatedEntity.website : undefined,
                        // Fix for timestamp display if missing
                        timestamp: h.timestamp || new Date(h.isoDate || Date.now()).toLocaleString()
                     };
                });
                
                // Separate history for sales (leads) vs clients
                // For this migration, we assume history items link to either Leads or Clients.
                // Our schema has clientId and leadId. But frontend uses a generic 'clientId' often.
                // Let's simplified: Global sees everything. Clients view sees client history.
                
                historyManager.setGlobalHistory(enrichedHistory);
                historyManager.setHistory(enrichedHistory);
                historyManager.setClientsHistory(enrichedHistory); // Can filter later if needed

            } catch (error) {
                console.error("Critical Data Load Error:", error);
                leadsManager.setLeads(FALLBACK_LEADS);
                showToast("Error al cargar datos locales.", "error");
            } finally {
                setIsLoadingNotion(false);
            }
        };
        initData();
    }, []);

    // Tab Context Switching
    useEffect(() => {
        // Reset selections
        leadsManager.setActiveLeadId(null);
        leadsManager.setLeads(prev => prev.map(l => ({ ...l, isSelected: false })));
        clientsManager.setActiveClientId(null);
        clientsManager.setClients(prev => prev.map(c => ({ ...c, isSelected: false })));

        if (activeTab === 'clientes') {
             // Filter history for clients tab if distinguishing is needed
             // For now, showing global is safe, or filter by items that belong to known Clients
             const clientIds = new Set(clientsManager.clients.map(c => c.id));
             const clientsOnlyHistory = historyManager.globalHistory.filter(h => h.clientId && clientIds.has(h.clientId));
             historyManager.setHistory(clientsOnlyHistory.length ? clientsOnlyHistory : historyManager.globalHistory);
        } else if (activeTab === 'ventas') {
            historyManager.setHistory(historyManager.globalHistory);
        }
    }, [activeTab]); // Removed clientsManager dependency to avoid loop

    // Enhanced Select Handlers (Connecting Hooks to UI State)
    const handleSelectLeadWrapper = (id: string) => {
        leadsManager.handleSelectLead(id);
        setIsLeftSidebarOpen(true);
    };

    // Effect to filtering history when Active Lead changes
    useEffect(() => {
        if (leadsManager.activeLeadId && activeTab === 'ventas') {
            const id = leadsManager.activeLeadId;
            const targetLead = leadsManager.leads.find(l => l.id === id);
            
            // Filter Local
            const localFiltered = historyManager.globalHistory.filter(h => h.clientId === id);
            historyManager.setHistory(localFiltered);

        } else if (!leadsManager.activeLeadId && activeTab === 'ventas') {
            historyManager.setHistory(historyManager.globalHistory);
        }
    }, [leadsManager.activeLeadId, activeTab]);

    const handleSelectClientWrapper = (id: string) => {
        clientsManager.handleSelectClient(id);
        setIsLeftSidebarOpen(true);
    };

    // Effect for Client History Filtering
    useEffect(() => {
        if (clientsManager.activeClientId && activeTab === 'clientes') {
            const id = clientsManager.activeClientId;
            // Filter Local
            const localFiltered = historyManager.globalHistory.filter(h => h.clientId === id);
            historyManager.setHistory(localFiltered);
        } else if (!clientsManager.activeClientId && activeTab === 'clientes') {
             // Show all clients history
             const clientIds = new Set(clientsManager.clients.map(c => c.id));
             const clientsOnlyHistory = historyManager.globalHistory.filter(h => h.clientId && clientIds.has(h.clientId));
             historyManager.setHistory(clientsOnlyHistory);
        }
    }, [clientsManager.activeClientId, activeTab]);

    // SAVE NOTE LOGIC
    const saveNote = async (text: string, agent: string, interactionType: string) => {
        const selectedLead = activeTab === 'clientes'
            ? clientsManager.clients.find(c => c.isSelected)
            : leadsManager.leads.find(l => l.isSelected);

        if (!selectedLead) {
            showToast("No hay lead seleccionado", "info");
            return;
        }

        const tempId = `temp-${Date.now()}`;

        const optimisticItem: HistoryItem = {
            id: tempId,
            type: interactionType.toLowerCase().includes('mail') || interactionType.toLowerCase().includes('correo') ? 'email' : 'note',
            title: interactionType,
            timestamp: "Enviando...",
            description: text,
            user: { name: agent, avatarUrl: '' },
            clientId: selectedLead.id,
            clientName: selectedLead.name,
            clientWebsite: selectedLead.website,
            isSynced: false
        };

        historyManager.setHistory(prev => [optimisticItem, ...prev]);
        showToast("Guardando nota...", "info");

        // Save to API
        try {
            const savedItem = await addHistoryToApi(selectedLead.id, text, agent, interactionType);
            
            if (savedItem) {
                const confirmedItem: HistoryItem = {
                    ...savedItem,
                    clientName: selectedLead.name,
                    clientWebsite: selectedLead.website
                };

                // Replace optimistic
                historyManager.setHistory(prev => prev.map(item => item.id === tempId ? confirmedItem : item));
                historyManager.setGlobalHistory(prev => [confirmedItem, ...prev.filter(i => i.id !== tempId)]);
                
                showToast("Nota guardada.", "success");
            } else {
                showToast("Error al guardar nota.", "error");
            }

        } catch (err) {
            console.error("Failed to save note:", err);
            showToast("Error crítico al guardar nota.", "error");
        }
    };

    return (
        <AppContext.Provider value={{
            ...leadsManager,
            handleSelectLead: handleSelectLeadWrapper,

            ...clientsManager,
            handleSelectClient: handleSelectClientWrapper,

            ...historyManager,
            saveNote,

            activeTab,
            setActiveTab,
            isLoadingNotion,
            supportTickets,
            isLeftSidebarOpen,
            setIsLeftSidebarOpen
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
