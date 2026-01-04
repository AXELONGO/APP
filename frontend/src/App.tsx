import React, { useState } from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import MainLayout from './components/MainLayout';
import MainContent from './components/MainContent';
import ClientsView from './components/ClientsView';
import RightSidebar from './components/RightSidebar';
import Header from './components/Header';
import { Lead } from './types';

const AppContent: React.FC = () => {
    const { 
        activeTab, 
        leads, 
        handleSelectLead, 
        history, 
        handleClassChange,
        activeLeadId,
        setActiveTab,
        setIsLeftSidebarOpen
    } = useAppContext();

    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        // Simulate sync
        setTimeout(() => setIsSyncing(false), 2000);
    };

    const activeLead = leads.find(l => l.id === activeLeadId);

    const handleTabChange = (tab: any) => {
        // useAppContext expects the correct type, simple casting if needed or define types properly
        // AppContext defines types as 'ventas' | 'cotizaciones' | 'clientes' | 'masivos'
        // useAppContext's setActiveTab handles it.
        // We need to access setActiveTab from context.
        // destructuring was: const { activeTab, leads, handleSelectLead, history, handleClassChange, activeLeadId, setActiveTab, setIsLeftSidebarOpen } = useAppContext()
        // wait, I missed destructuring some of them in previous create call.
    };
    
    // REDO DESTRUCTURE to get setter
    
    return (
        <MainLayout>
             <Header 
                activeTab={activeTab}
                onTabChange={setActiveTab} // setActiveTab is from context
                onToggleLeftSidebar={() => setIsLeftSidebarOpen(prev => !prev)}
                onToggleRightSidebar={() => setIsRightSidebarOpen(prev => !prev)}
                onLogout={() => console.log("Logout")}
             />
             {activeTab === 'ventas' && (
                 <div className="flex flex-1 overflow-hidden relative">
                     <MainContent 
                        leads={leads} 
                        history={history}
                        toggleSelectLead={handleSelectLead}
                        onSyncToNotion={handleSync}
                        isSyncing={isSyncing}
                        onClassChange={handleClassChange}
                        onGenerateDailyReport={() => console.log("Generating Report...")}
                     />
                     
                     <RightSidebar 
                        history={history}
                        activeLeadId={activeLead?.id || null}
                        activeLeadName={activeLead?.name || null}
                        onClose={() => activeLeadId && handleSelectLead(activeLeadId)}
                        isOpen={!!activeLeadId || isRightSidebarOpen} // Force open if mobile toggle or lead selected
                     />
                 </div>
             )}
             {activeTab === 'clientes' && (
                 <ClientsView />
             )}
             {/* Add other tabs placeholders if needed */}
             {(activeTab !== 'ventas' && activeTab !== 'clientes') && (
                 <div className="flex items-center justify-center h-full text-white">
                     Sección en desarrollo: {activeTab}
                 </div>
             )}
        </MainLayout>
    );
};

const App = () => {
    return (
        <ToastProvider>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </ToastProvider>
    );
};

export default App;
