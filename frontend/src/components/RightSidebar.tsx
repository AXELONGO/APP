import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { getHistoryFromApi } from '../services/apiService';

interface RightSidebarProps {
    history: HistoryItem[];
    isOpen: boolean;
    onClose: () => void;
    leadName?: string;
}

const getIconForType = (type: string) => {
    switch (type) {
        case 'call': return { icon: 'phone_in_talk', bg: 'bg-white/10', text: 'text-white', border: 'border-white/10' };
        case 'email': return { icon: 'mail', bg: 'bg-white/5', text: 'text-gray-300', border: 'border-white/5' };
        case 'note': return { icon: 'description', bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/5' };
        default: return { icon: 'info', bg: 'bg-white/5', text: 'text-gray-500', border: 'border-white/5' };
    }
};

const RightSidebar: React.FC<RightSidebarProps> = ({ history, isOpen, onClose, leadName }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [filterClient, setFilterClient] = useState('');

    // Extract unique clients for the dropdown
    const uniqueClients = React.useMemo(() => {
        const clients = history.map(item => item.clientName).filter((name): name is string => !!name && name !== 'Cliente Desconocido');
        return Array.from(new Set(clients)).sort();
    }, [history]);

    // Filter history based on selection
    const displayedHistory = React.useMemo(() => {
        if (!filterClient) return history;
        return history.filter(item => item.clientName === filterClient);
    }, [history, filterClient]);

    const hasHistory = displayedHistory.length > 0;

    const handleDownloadHistory = async () => {
        if (!startDate || !endDate) {
            alert("Por favor selecciona una fecha de inicio y fin.");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 31) {
            alert("El periodo máximo de descarga es de 1 mes (31 días).");
            return;
        }

        setIsDownloading(true);
        try {
            const filteredItems = await getHistoryFromApi(); // El filtro de fechas idealmente via backend, por ahora client-side o default

            // Generate CSV
            const csvContent = "data:text/csv;charset=utf-8,"
                + "Fecha,Cliente,Tipo,Asesor,Detalle\n"
                + filteredItems.map(e => {
                    const date = e.timestamp.replace(/,/g, ''); // Remove commas to avoid CSV break
                    const client = (e.clientName || "Sin Cliente").replace(/,/g, '');
                    const desc = (e.description || "").replace(/,/g, ' ').replace(/\n/g, ' ');
                    return `${date},${client},${e.type},${e.user.name},${desc}`;
                }).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `historial_${startDate}_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error downloading history:", error);
            alert("Error al descargar el historial.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <aside
            className={`
            fixed inset-y-0 left-0 z-40 bg-black/60 backdrop-blur-2xl border-r border-glass-border flex flex-col overflow-y-auto transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1)
            w-[85%] sm:w-[320px] lg:static lg:translate-x-0 lg:flex
            ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
        >
            <div className="p-6 border-b border-white/5 sticky top-0 bg-black/20 backdrop-blur-md z-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white text-lg font-bold leading-tight text-glow">Historial</h3>
                    <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="relative mb-4">
                    {leadName ? (
                        <div className="w-full glass-panel rounded-lg text-white text-xs px-4 py-3 font-bold truncate flex items-center gap-2 shadow-inner">
                            <span className="size-1.5 rounded-full bg-white shadow-glow"></span>
                            {leadName}
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-[16px]">search</span>
                            </div>
                            <select
                                value={filterClient}
                                onChange={(e) => setFilterClient(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg text-white text-xs pl-9 pr-4 py-3 appearance-none outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all cursor-pointer"
                            >
                                <option value="">Actividad Global</option>
                                {uniqueClients.map(client => (
                                    <option key={client} value={client} className="bg-gray-900 text-white">
                                        {client}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500 text-[16px]">arrow_drop_down</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Range & Download */}
                <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 block mb-1">Desde</label>
                            <input
                                type="date"
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500/50"
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 block mb-1">Hasta</label>
                            <input
                                type="date"
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500/50"
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadHistory}
                        disabled={isDownloading}
                        className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold py-2 rounded border border-blue-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[14px]">download</span>
                        )}
                        {isDownloading ? 'Descargando...' : 'Descargar Periodo'}
                    </button>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-8">
                {!hasHistory && (
                    <div className="text-center text-gray-600 py-12 flex flex-col items-center">
                        <span className="material-symbols-outlined text-3xl mb-2 opacity-20">history_toggle_off</span>
                        <p className="text-xs font-medium opacity-50">No hay actividad reciente.</p>
                    </div>
                )}

                {hasHistory && (
                    <div className="relative">
                        {/* Main vertical line for timeline */}
                        <div className="absolute left-[15px] top-2 bottom-4 w-px bg-gradient-to-b from-white/10 to-transparent"></div>

                        {displayedHistory.map((item, index) => {
                            const styles = getIconForType(item.type);
                            return (
                                <div key={item.id} className="flex gap-4 mb-6 relative group">
                                    <div className="flex-none relative z-10">
                                        <div className={`${styles.bg} ${styles.text} rounded-full size-8 flex items-center justify-center border ${styles.border} shadow-lg group-hover:shadow-glow transition-shadow duration-300`}>
                                            <span className="material-symbols-outlined text-[14px]">{styles.icon}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className="text-gray-200 font-semibold text-xs tracking-wide">{item.title}</span>

                                            <div className="flex items-center gap-2">
                                                {/* Link al sitio web si existe */}
                                                {item.clientWebsite && (
                                                    <a
                                                        href={item.clientWebsite}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-500 hover:text-blue-400 transition-colors flex items-center justify-center size-4 rounded hover:bg-white/5"
                                                        title="Ir al sitio web"
                                                    >
                                                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                                    </a>
                                                )}
                                                <span className="text-gray-600 text-[10px] whitespace-nowrap font-mono">{item.timestamp}</span>
                                            </div>
                                        </div>

                                        {/* AQUI SE AGREGA EL NOMBRE DE LA EMPRESA SIEMPRE, SIN CONDICION DE FILTRO */}
                                        {item.clientName && item.clientName !== 'Cliente Desconocido' && (
                                            <div className="mb-2 flex items-center">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                                                    <span className="material-symbols-outlined text-[12px] text-blue-400">domain</span>
                                                    <span className="text-[10px] font-bold text-blue-300 truncate max-w-[180px]">{item.clientName}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="glass-panel p-3 rounded-lg border-white/5">
                                            <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">{item.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 pl-1">
                                            {item.user.avatarUrl ? (
                                                <div
                                                    className="size-4 rounded-full bg-cover bg-center ring-1 ring-white/10"
                                                    style={{ backgroundImage: `url("${item.user.avatarUrl}")` }}
                                                ></div>
                                            ) : (
                                                <div className="size-4 rounded-full bg-white/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[10px] text-gray-400">person</span>
                                                </div>
                                            )}
                                            <span className="text-gray-500 text-[10px] font-medium">{item.user.name}</span>
                                            {item.isSynced && (
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-2.5 h-2.5 grayscale opacity-30 ml-auto hover:opacity-100 transition-opacity" alt="synced" title="Desde Notion" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default RightSidebar;
