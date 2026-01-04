import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface GlobalHistoryCardProps {
    selectedLeadName?: string;
}

const AGENTS = ['Asesor 1', 'Asesor 2', 'Asesor 3'];
const INTERACTION_TYPES = ['Tickets', 'Prospecto', 'Decisión'];

const GlobalHistoryCard: React.FC<GlobalHistoryCardProps> = ({ selectedLeadName }) => {
    const { saveNote } = useAppContext();
    const [noteText, setNoteText] = useState('');
    const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
    const [interactionType, setInteractionType] = useState('Tickets');

    const [isSent, setIsSent] = useState(false);

    const handleSave = async () => {
        if (!noteText.trim()) return;
        await saveNote(noteText, selectedAgent, interactionType);
        setNoteText('');
        setInteractionType('Tickets');

        // Show verification
        setIsSent(true);
        setTimeout(() => setIsSent(false), 2000);
    };

    return (
        <div className="sidebar-card rounded-xl p-5 transition-all duration-300 group hover:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {selectedLeadName ? 'Nota Cliente' : 'Nota Rápida'}
                </h3>
                {selectedLeadName && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 truncate max-w-[100px]">
                        {selectedLeadName}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg text-sm p-3 resize-none h-24 focus:ring-1 focus:ring-accent-purple/50 focus:border-accent-purple/50 outline-none text-white placeholder-gray-500 transition-all"
                    placeholder={selectedLeadName ? `Nota para ${selectedLeadName}...` : "Escribir nota general..."}
                ></textarea>

                <div className="flex gap-2">
                    <select
                        value={interactionType}
                        onChange={(e) => setInteractionType(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg text-xs px-2 py-2 text-gray-300 outline-none flex-1 hover:border-white/20 transition-colors cursor-pointer"
                    >
                        {INTERACTION_TYPES.map(t => <option key={t} value={t} className="bg-surface text-white">{t}</option>)}
                    </select>

                    <button
                        onClick={handleSave}
                        className={`
                            p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 flex items-center justify-center
                            ${isSent
                                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                                : 'bg-accent-purple hover:bg-accent-purple/80 shadow-accent-purple/20'}
                        `}
                        disabled={!selectedLeadName && !noteText.trim()}
                        title={isSent ? "Enviado" : "Guardar Nota"}
                    >
                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isSent ? 'scale-110' : ''}`}>
                            {isSent ? 'check' : 'send'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalHistoryCard;
