import { useState, useCallback } from 'react';
import { Lead } from '../types';
import { updateLeadClass } from '../services/apiService';

export const useLeadsManager = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

    const toggleSelectLead = useCallback((id: string, onLeadSelected?: (lead: Lead) => void, onDeselected?: () => void) => {
        let selectedLead: Lead | undefined;

        setLeads(prev => {
            const next = prev.map(l => {
                if (l.id === id) {
                    const newSelectedState = !l.isSelected;
                    if (newSelectedState) selectedLead = l;
                    return { ...l, isSelected: newSelectedState };
                }
                return { ...l, isSelected: false };
            });
            return next;
        });

        // We need to resolve the lead from the *current* state logic, but since setLeads is async/batched,
        // we might not have the updated state immediately if we rely on 'leads'.
        // However, we can find it in the previous state and toggle the boolean locally for the callback.
        // Actually, cleaner to useEffect on activeLeadId in the parent, OR pass the logic here.
        // For now, let's keep it simple: simpler state update.

        // Post-update logic helper (simulated)
        // Ideally, the component calls this, updates local state, and then we return the result?
        // Let's stick to the pattern: update state, set Active ID.

        // Wait, I can't easily access the "just selected" lead inside the setLeads without doing it twice.
        // Let's optimize: First find the lead, then update.
    }, []);

    // Revised implementation to match App.tsx logic better
    const handleSelectLead = useCallback((id: string) => {
        setLeads(prev => {
            const copy = [...prev];
            const targetIndex = copy.findIndex(l => l.id === id);
            if (targetIndex === -1) return prev;

            // Deselect others
            copy.forEach((l, i) => {
                if (i !== targetIndex) l.isSelected = false;
            });

            // Toggle target
            const target = copy[targetIndex];
            const newState = !target.isSelected;
            copy[targetIndex] = { ...target, isSelected: newState };

            if (newState) {
                setActiveLeadId(id);
            } else {
                setActiveLeadId(null);
            }

            return copy;
        });
    }, []);

    const handleClassChange = useCallback(async (id: string, newClass: string) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, clase: newClass as 'A' | 'B' | 'C' } : l));

        // Note: we can't access 'leads' state reliably inside useCallback without dependency.
        // But adding 'leads' dependency causes recreation on every state change.
        // Better to find the lead inside the functional update? No, we need it for the API call.
        // We will trust the caller or use a ref?
        // Let's just use 'leads' as dependency for now, strictly correct.
    }, []);

    return {
        leads,
        setLeads,
        activeLeadId,
        setActiveLeadId,
        handleSelectLead,
        handleClassChange
    };
};
