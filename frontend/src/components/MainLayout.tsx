import React from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
            {/* Sidebar con glassmorphism integrado */}
            <Sidebar />

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
