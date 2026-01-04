
import React, { useState } from 'react';

interface AddClientModalProps {
    onClose: () => void;
    onSave: (client: any) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [category, setCategory] = useState('Transporte');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newClient = {
            id: Date.now(),
            name,
            phone,
            email,
            address,
            category,
            status: 'Active',
            lastContact: new Date().toISOString()
        };
        
        onSave(newClient);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Nuevo Cliente</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-white uppercase">Nombre</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                            placeholder="Nombre del Cliente o Empresa"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-white uppercase">Teléfono</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                            placeholder="+52 ..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-white uppercase">Correo (Opcional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                placeholder="contacto@..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-white uppercase">Categoría</label>
                            <select
                                value={category}
                                // @ts-ignore
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all appearance-none"
                            >
                                <option value="Transporte">Transporte</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Software">Software</option>
                                <option value="Consultoría">Consultoría</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-white uppercase">Dirección (Opcional)</label>
                        <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                            placeholder="Calle, Número, Colonia..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Guardar Cliente
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientModal;
