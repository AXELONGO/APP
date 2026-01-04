import React from 'react';

interface GlobalHistoryCardProps {
    selectedLeadName?: string;
}

const GlobalHistoryCard: React.FC<GlobalHistoryCardProps> = ({ selectedLeadName }) => {
    if (!selectedLeadName) return null;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <div className="text-xs text-blue-400 uppercase font-bold mb-1">Actividad Reciente</div>
            <div className="text-white font-medium truncat">{selectedLeadName}</div>
        </div>
    );
};

export default GlobalHistoryCard;
