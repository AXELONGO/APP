import React, { useState } from 'react';
import { useClientsManager } from '../hooks/useClientsManager';
import AddClientModal from './AddClientModal';

const ClientsView: React.FC = () => {
    const { clients, loading, error, addClient } = useClientsManager();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm)
    );

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando clientes...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

    const getClaseColor = (clase: string) => {
        switch (clase) {
            case 'A': return 'bg-green-500/20 text-green-400';
            case 'B': return 'bg-yellow-500/20 text-yellow-400';
            case 'C': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Cartera de Clientes
                </h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Cliente
                </button>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, teléfono o email..." 
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#1a1a1a] rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Clase</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ubicación</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Agente</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredClients.map(client => (
                            <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-medium text-white">{client.name}</div>
                                    <div className="text-xs text-gray-500">{client.email}</div>
                                </td>
                                <td className="p-4 text-gray-300">{client.phone || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getClaseColor(client.clase)}`}>
                                        Clase {client.clase}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400 truncate max-w-[200px]" title={client.address}>{client.address || '-'}</td>
                                <td className="p-4 text-gray-400">{client.agent}</td>
                                <td className="p-4">
                                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${client.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="capitalize text-sm text-gray-400">{client.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredClients.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron clientes.
                    </div>
                )}
            </div>
            
            <AddClientModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={addClient} 
            />
        </div>
    );
};

export default ClientsView;
