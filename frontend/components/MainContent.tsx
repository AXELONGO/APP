import React from 'react';
import ClientsView from './ClientsView';
import QuotesView from './QuotesView';
import MassSenderView from './MassSenderView';
import NotionDataViewer from './NotionDataViewer';
import { useApp } from '../contexts/AppContext';

const MainContent: React.FC = () => {
    const { activeTab } = useApp();

    switch (activeTab) {
        case 'clientes':
            return <ClientsView />;
        case 'cotizaciones':
            return <QuotesView />;
        case 'envios':
            return <MassSenderView />;
        case 'bases':
            return <NotionDataViewer />; // Placeholder for database management
        case 'dashboard':
        default:
            return (
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Bienvenido al Dashboard</h1>
                    <p className="text-gray-400">Selecciona una opción del menú para comenzar.</p>
                </div>
            );
    }
};

export default MainContent;
