import React, { useState } from 'react';
import { useClientsManager } from '../hooks/useClientsManager';
import { useToast } from '../contexts/ToastContext';

const MassSenderView: React.FC = () => {
    const { clients } = useClientsManager();
    const { showToast } = useToast();
    const [message, setMessage] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);

    // Extract unique tags from clients
    const allTags = Array.from(new Set(
        clients.flatMap(c => c.tags?.split(',').map(t => t.trim()).filter(Boolean) || [])
    ));

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) 
            ? prev.filter(t => t !== tag)
            : [...prev, tag]
        );
    };

    const handleSend = async () => {
        if (!message) {
            showToast('Escribe un mensaje primero', 'error');
            return;
        }

        const targets = selectedTags.length > 0 
            ? clients.filter(c => c.tags && selectedTags.some(t => c.tags?.includes(t)))
            : clients; // If no tags selected, send to all (or maybe warn?)

        if (targets.length === 0) {
            showToast('No hay destinatarios para los filtros seleccionados', 'info');
            return;
        }

        if (!confirm(`¿Enviar mensaje a ${targets.length} clientes?`)) return;

        setIsSending(true);
        try {
            // Simulate sending API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Sending message to:', targets.map(c => c.email));
            
            showToast(`Mensaje enviado a ${targets.length} clientes`, 'success');
            setMessage('');
        } catch (error) {
            console.error('Failed to send mass message:', error);
            showToast('Error al enviar mensajes', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Campaña Masiva</h2>

            <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 flex-1 flex flex-col shadow-2xl">
                
                {/* Audience Selector */}
                <div className="mb-8">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 block">Destinatarios (Etiquetas)</label>
                    <div className="flex flex-wrap gap-2">
                        {allTags.length === 0 && <span className="text-gray-500 text-sm">No hay etiquetas disponibles.</span>}
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                    selectedTags.includes(tag)
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        {selectedTags.length > 0 
                            ? `Se enviará a clientes con etiquetas: ${selectedTags.join(', ')}`
                            : 'Se enviará a TODOS los clientes (Selecciona etiquetas para filtrar)'}
                    </p>
                </div>

                {/* Message Editor */}
                <div className="flex-1 flex flex-col mb-8">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 block">Mensaje</label>
                    <textarea
                        className="flex-1 w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none font-sans text-lg leading-relaxed"
                        placeholder="Escribe el contenido de tu campaña aquí..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    ></textarea>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className={`
                            bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 
                            text-white font-bold py-3 px-8 rounded-lg flex items-center gap-3 
                            transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {isSending ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined">send</span>
                        )}
                        <span>{isSending ? 'Enviando...' : 'Enviar Campaña'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MassSenderView;
