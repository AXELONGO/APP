import React, { useState } from 'react';

interface HistoryTabsProps {
    history: any[];
    supportTickets: any[];
}

const HistoryTabs: React.FC<HistoryTabsProps> = ({ history, supportTickets }) => {
    const [activeTab, setActiveTab] = useState<'historial' | 'soporte'>('historial');

    return (
        <div className="flex flex-col gap-6">
            {/* Tabs Toggle */}
            <div className="flex p-1 bg-black/20 rounded-xl border border-white/5 mx-1">
                <button
                    onClick={() => setActiveTab('historial')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'historial'
                        ? 'bg-surface text-white shadow-md shadow-black/20'
                        : 'text-text-disabled hover:text-text-secondary hover:bg-white/5'
                        }`}
                >
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    Historial
                </button>
                <button
                    onClick={() => setActiveTab('soporte')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'soporte'
                        ? 'bg-surface text-white shadow-md shadow-black/20'
                        : 'text-text-disabled hover:text-text-secondary hover:bg-white/5'
                        }`}
                >
                    <span className="material-symbols-outlined text-[16px]">support_agent</span>
                    Soporte
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
                {activeTab === 'historial' && (
                    <div className="space-y-4 animate-fadeIn">
                        {history.length === 0 ? (
                            <div className="text-center py-8 text-text-disabled text-sm italic border border-dashed border-white/10 rounded-xl">
                                No hay historial disponible.
                            </div>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="relative pl-4 border-l border-white/10 group hover:border-accent-purple/50 transition-colors pb-6 last:pb-0">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[5px] top-1 size-2.5 rounded-full bg-surface border border-white/20 group-hover:border-accent-purple group-hover:bg-accent-purple transition-all shadow-lg"></div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-[10px] text-text-secondary">{item.timestamp}</span>
                                            <span className="text-[9px] font-bold text-text-primary uppercase bg-white/5 px-1.5 py-0.5 rounded">{item.type}</span>
                                        </div>

                                        <div className="sidebar-card rounded-lg p-3 group-hover:translate-x-1 transition-transform">
                                            <p className="text-text-primary text-xs leading-relaxed whitespace-pre-wrap">
                                                {item.description || item.text || item.title}
                                            </p>

                                            {(item.user?.name || item.agent) && (
                                                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                                                    <div className="size-3.5 rounded-full bg-accent-purple text-white flex items-center justify-center text-[8px] font-bold">
                                                        {(item.user?.name || item.agent).charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-[10px] text-text-secondary">{item.user?.name || item.agent}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'soporte' && (
                    <div className="space-y-3 animate-fadeIn">
                        {supportTickets.length === 0 ? (
                            <div className="text-center py-8 text-text-disabled text-sm italic border border-dashed border-white/10 rounded-xl">
                                No hay tickets activos.
                            </div>
                        ) : (
                            supportTickets.map((ticket) => (
                                <a
                                    key={ticket.id}
                                    href={ticket.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sidebar-card p-3 rounded-lg block hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xs font-semibold text-text-primary line-clamp-2 group-hover:text-accent-blue transition-colors">
                                            {ticket.title}
                                        </h4>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${ticket.status?.toLowerCase().includes('done') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-text-disabled border-white/10'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                                        <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                                        {new Date(ticket.last_edited).toLocaleDateString()}
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryTabs;
