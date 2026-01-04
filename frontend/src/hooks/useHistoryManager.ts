import { useState } from 'react';
import { HistoryItem } from '../types';

export const useHistoryManager = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [globalHistory, setGlobalHistory] = useState<HistoryItem[]>([]);
    const [clientsHistory, setClientsHistory] = useState<HistoryItem[]>([]);

    return {
        history,
        setHistory,
        globalHistory,
        setGlobalHistory,
        clientsHistory,
        setClientsHistory
    };
};
