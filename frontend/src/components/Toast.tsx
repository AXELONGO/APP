import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    return (
        <div className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] opacity-90 hover:opacity-100 transition-opacity duration-300`}>
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 focus:outline-none">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule=\"evenodd\" d=\"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z\" clipRule=\"evenodd\" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
