import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar'; // Left Sidebar
import RightSidebar from './RightSidebar';
import MainContent from './MainContent';
import { useApp } from '../contexts/AppContext';

const MainLayout: React.FC = () => {
    const { activeTab } = useApp();
    const [isRightSidebarOpen, setIsRightSidebarOpen] = React.useState(false);

    // Only show right sidebar on sales tab for now, or per requirement
    const showRightSidebar = activeTab === 'ventas'; 

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Left Sidebar (Navigation/Filters) */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] relative">
                {/* Top Header */}
                <Header onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)} />

                {/* Content Area */}
                <main className="flex-1 overflow-hidden relative z-0 flex">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0 relative">
                        <MainContent />
                    </div>
                </main>
            </div>

            {/* Right Sidebar (History/Details) - Collapsible on Mobile, Persistent on Desktop if needed */}
            {showRightSidebar && (
                <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
            )}
        </div>
    );
};

export default MainLayout;
