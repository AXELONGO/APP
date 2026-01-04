import React from 'react';
import { useHistoryManager } from '../hooks/useHistoryManager';
import HistoryTabs from './HistoryTabs';

interface RightSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose }) => {
    // This sidebar handles the history view on the RIGHT side.
    // It should display history items.
    const { history, loading } = useHistoryManager();

    return (
        <div className={`
            fixed inset-y-0 right-0 z-40 w-80 bg-[#141414] border-l border-white/5 shadow-2xl transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:relative lg:w-80 lg:block'}
        `}>
             <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]/50 backdrop-blur-sm">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Historial</h3>
                    <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
                        <span className=\"material-symbols-outlined\">close</span>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {loading ? (
                        <div className="text-center text-gray-500 py-4">Cargando...</div>
                    ) : (
                        <HistoryTabs history={history} supportTickets={[]} />
                    )}
                </div>
             </div>
        </div>
    );
};

export default RightSidebar;
