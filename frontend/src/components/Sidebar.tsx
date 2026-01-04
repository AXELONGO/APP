import React, { useState } from 'react';
import HistoryTabs from './HistoryTabs';
import GlobalHistoryCard from './GlobalHistoryCard';
import { useAppContext } from '../contexts/AppContext';

import { useToast } from '../contexts/ToastContext';

const Sidebar: React.FC = () => {
    // We can consume context here if needed, or pass props down.
    // The original LeftSidebar took props. Ideally, we use Context to avoid prop drilling mania.
    // The AppContext seems to hold history, supportTickets, etc.

    const {
        history,
        supportTickets,
        activeLeadId,
        activeClientId,
        activeTab,
        clients,
        leads,
        isLeftSidebarOpen,
        setIsLeftSidebarOpen
    } = useAppContext();

    const { showToast } = useToast();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Determine selected lead name similar to original logic
    const selectedLeadName = activeTab === 'clientes'
        ? clients.find(c => c.id === activeClientId)?.name
        : leads.find(l => l.id === activeLeadId)?.name;

    const handleGenerateLeads = async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        // Placeholder Webhook URL - Verify with user if strictly different
        const webhookUrl = 'https://automatizaciones-n8n.tzudkj.easypanel.host/webhook/BUSCADOR_LEADS';

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: searchTerm,
                    timestamp: new Date().toISOString()
                })
            });
            showToast("Búsqueda iniciada. Los resultados llegarán pronto.", "success");
            setSearchTerm('');
            setIsSearchOpen(false);
        } catch (error) {
            console.error("Lead Gen Error:", error);
            showToast("Error al iniciar búsqueda.", "error");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isLeftSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setIsLeftSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                sidebar w-80 min-w-[320px] shrink-0 flex flex-col h-full text-white z-30 overflow-x-hidden
                fixed inset-y-0 left-0 transition-transform duration-300 ease-out lg:relative lg:translate-x-0
                ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header del sidebar - Variable Content */}
                <div className="p-6 border-b border-glass-border">
                    {!isSearchOpen ? (
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all group"
                            >
                                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">add_circle</span>
                                GENERAR MÁS LEADS
                            </button>
                            <button
                                onClick={() => setIsLeftSidebarOpen(false)}
                                className="lg:hidden ml-2 text-white/70 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Buscador de Leads</span>
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Ej: Restaurantes en Tijuana..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateLeads()}
                                />
                                <button
                                    onClick={handleGenerateLeads}
                                    disabled={isSearching || !searchTerm.trim()}
                                    className="absolute right-1 top-1 p-1 bg-blue-600 rounded-md text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSearching ? (
                                        <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contenido principal del sidebar - sin glassmorphism duplicado */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <GlobalHistoryCard selectedLeadName={selectedLeadName} />

                    <HistoryTabs
                        history={history}
                        supportTickets={supportTickets}
                    />
                </div>

                {/* Footer del sidebar - opcional */}
                <div className="p-4 border-t border-glass-border text-center">
                    <div className="text-xs text-text-disabled uppercase tracking-widest">v2.1.0</div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
