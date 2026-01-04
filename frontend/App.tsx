import React from 'react';
import MainLayout from './components/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <AppProvider>
                <ToastProvider>
                    <MainLayout />
                </ToastProvider>
            </AppProvider>
        </ErrorBoundary>
    );
};

export default App;
