import React, { useState } from 'react';

interface DateRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: (startDate: Date, endDate: Date) => void;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({ isOpen, onClose, onDownload }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate) {
            onDownload(new Date(startDate), new Date(endDate));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-xl w-80 shadow-2xl">
                <h3 className="text-white font-bold mb-4">Descargar Historial</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 rounded">Desde</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Hasta</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="text-gray-400 text-sm hover:text-white px-3 py-1">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded hover:bg-blue-500">Descargar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DateRangeModal;
