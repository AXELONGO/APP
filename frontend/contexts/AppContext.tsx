import React, { createContext, useContext, useState } from 'react';

// Simplified context for now, can be expanded for global state like auth, theme, etc.
interface AppContextType {
    user: { name: string; email: string } | null;
    setUser: (user: { name: string; email: string } | null) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<{ name: string; email: string } | null>({ name: 'Demo User', email: 'demo@example.com' });
    const [activeTab, setActiveTab] = useState('dashboard'); // Default tab

    return (
        <AppContext.Provider value={{ user, setUser, activeTab, setActiveTab }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
