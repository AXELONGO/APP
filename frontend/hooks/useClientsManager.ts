import { useState, useCallback } from 'react';
import { Lead } from '../types';

export const useClientsManager = () => {
    const [clients, setClients] = useState<Lead[]>([]);
    const [activeClientId, setActiveClientId] = useState<string | null>(null);

    const handleSelectClient = useCallback((id: string) => {
        setClients(prev => {
            const copy = [...prev];
            const targetIndex = copy.findIndex(c => c.id === id);
            if (targetIndex === -1) return prev;

            // Deselect others
            copy.forEach((c, i) => {
                if (i !== targetIndex) c.isSelected = false;
            });

            // Toggle target
            const target = copy[targetIndex];
            const newState = !target.isSelected;
            copy[targetIndex] = { ...target, isSelected: newState };

            if (newState) {
                setActiveClientId(id);
            } else {
                setActiveClientId(null);
            }

            return copy;
        });
    }, []);

    return {
        clients,
        setClients,
        activeClientId,
        setActiveClientId,
        handleSelectClient
    };
};
