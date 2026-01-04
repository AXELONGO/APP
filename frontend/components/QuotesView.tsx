import React, { useState } from 'react';
import { generatePDF } from '../services/pdfService';
import { useClientsManager } from '../hooks/useClientsManager';
import { useToast } from '../contexts/ToastContext';

interface QuoteItem {
    id: number;
    description: string;
    quantity: number;
    unitPrice: string; // Keep as string for input handling
    amount: number;
}

const QuotesView: React.FC = () => {
    // --- State ---
    const { clients } = useClientsManager();
    const { showToast } = useToast();
    
    // Header Info
    const [quoteNumber, setQuoteNumber] = useState(Math.floor(Math.random() * 10000));
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClient, setSelectedClient] = useState('');
    
    // Items
    const [items, setItems] = useState<QuoteItem[]>([
        { id: 1, description: '', quantity: 1, unitPrice: '0', amount: 0 }
    ]);
    
    // Notes & Meta
    const [notes, setNotes] = useState('');
    const [isSending, setIsSending] = useState(false);

    // --- Calculations ---
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const iva = subtotal * 0.08;
    const retIsr = subtotal * 0.0125;
    const total = subtotal + iva - retIsr;

    // --- Handlers ---
    const handleItemChange = (id: number, field: keyof QuoteItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            
            const updates: any = { [field]: value };
            
            // Auto calc amount if qty or price changes
            if (field === 'quantity' || field === 'unitPrice') {
                const qty = field === 'quantity' ? value : item.quantity;
                const priceStr = field === 'unitPrice' ? value : item.unitPrice;
                const price = parseFloat(priceStr) || 0;
                updates.amount = qty * price;
            }
            
            return { ...item, ...updates };
        }));
    };

    const addItem = () => {
        setItems(prev => [...prev, { 
            id: Date.now(), 
            description: '', 
            quantity: 1, 
            unitPrice: '0', 
            amount: 0 
        }]);
    };

    const removeItem = (id: number) => {
        if (items.length === 1) return; // Prevent deleting last row
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const handleSendQuote = async () => {
        if (!selectedClient) {
            showToast('Por favor selecciona un cliente', 'error');
            return;
        }

        setIsSending(true);
        try {
            const clientObj = clients.find(c => c.name === selectedClient) || { name: selectedClient, address: 'Dirección Generica', phone: '555-0000' };
            
            const quoteData = {
                number: quoteNumber,
                date,
                client: clientObj,
                items,
                subtotal,
                iva,
                retIsr,
                total,
                notes
            };

            // Generate PDF
            const pdfBlob = await generatePDF(quoteData);
            
            // Here you would upload the PDF or send it to backend to email/whatsapp
            // For now, we simulate success and download it
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Cotizacion_${quoteNumber}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);

            showToast('Cotización generada y descargada', 'success');
            
            // Optionally clear form
            // setItems([{ id: Date.now(), description: '', quantity: 1, unitPrice: '0', amount: 0 }]);
        } catch (error) {
            console.error('Failed to generate quote:', error);
            showToast('Error al generar cotización', 'error');
        } finally {
            setIsSending(false);
        }
    };

    // --- Styles ---
    const inputClass = "w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500/50 text-sm placeholder-gray-600 transition-colors hover:border-white/20";
    const labelClass = "block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 ml-1";

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            {/* Main Content Area */}
            <section className="flex-1 overflow-auto p-2 md:p-6 lg:p-8 pb-32"> {/* Added pb-32 to prevent content hiding behind FAB if we had one on mobile */}
                <div className="max-w-5xl mx-auto bg-[#141414] rounded-2xl shadow-2xl p-8 border border-white/5 ring-1 ring-white/5">
                    
                    {/* Header: Logo & Title */}
                    <div className="flex justify-between items-start mb-10 border-b border-white/5 pb-8">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">COTIZACIÓN</h1>
                            <p className="text-gray-500 text-sm">Folio: <span className="text-blue-400 font-mono font-bold">#{quoteNumber}</span></p>
                        </div>
                        <div className="text-right">
                            {/* Logo Placeholder */}
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg mb-2 ml-auto">
                                CR
                            </div>
                            <div className="text-gray-400 text-xs">Empresa Demo S.A. de C.V.</div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white/[0.02] p-6 rounded-xl border border-white/5">
                        {/* Client Selection */}
                        <div className="md:col-span-1">
                            <label className={labelClass}>Cliente</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 material-symbols-outlined text-gray-500 text-[18px]">person_search</span>
                                <input 
                                    list="clients-list"
                                    className={`${inputClass} pl-10`}
                                    placeholder="Buscar o escribir cliente..."
                                    value={selectedClient}
                                    onChange={e => setSelectedClient(e.target.value)}
                                />
                                <datalist id="clients-list">
                                    {clients.map(c => <option key={c.id} value={c.name} />)}
                                </datalist>
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className={labelClass}>Fecha de Emisión</label>
                            <input 
                                type="date" 
                                className={`${inputClass} font-mono`}
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                            />
                        </div>

                        {/* Folio (Editable) */}
                        <div>
                            <label className={labelClass}>Número de Folio</label>
                            <input 
                                type="number" 
                                className={`${inputClass} font-mono`}
                                value={quoteNumber} 
                                onChange={e => setQuoteNumber(parseInt(e.target.value) || 0)} 
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8 overflow-hidden rounded-xl border border-white/5 bg-[#1a1a1a]">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-3 w-20 text-center">Cant.</th>
                                    <th className="py-3 px-3">Descripción</th>
                                    <th className="py-3 px-3 w-32">P. Unitario</th>
                                    <th className="py-3 px-3 w-36 text-right">Importe</th>
                                    <th className="py-3 px-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                                        <td className="py-2 px-2">
                                            <input
                                                type="number" min="1"
                                                className={`${inputClass} text-center font-bold`}
                                                value={item.quantity}
                                                onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="Descripción"
                                                value={item.description}
                                                onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-2 px-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-white text-xs font-bold z-10">$</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    className={`${inputClass} text-right pl-6`}
                                                    value={item.unitPrice}
                                                    onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 text-right text-white font-mono font-bold">
                                            ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-white hover:text-red-400 transition-colors p-2 rounded hover:bg-white/10"
                                                title="Eliminar fila"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            onClick={addItem}
                            className="m-2 text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-bold uppercase tracking-wide px-3 py-2 rounded hover:bg-blue-500/10"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span> Agregar Producto
                        </button>
                    </div>

                    {/* Totals & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className={labelClass}>Notas</label>
                            <textarea
                                className={`${inputClass} h-32 resize-none`}
                                placeholder="Condiciones de pago, tiempo de entrega, datos bancarios..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/5">
                            <div className="flex justify-between text-white text-sm">
                                <span>Subtotal</span>
                                <span className="font-mono text-white">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-300 text-sm">
                                <span>Subtotal</span>
                                <span className="font-mono text-white">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-white text-sm">
                                <span>IVA (8%)</span>
                                <span className="font-mono text-white">${iva.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-white text-sm">
                                <span>Ret. ISR (1.25%)</span>
                                <span className="font-mono text-red-400">-${retIsr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-white text-xl font-bold border-t border-white/10 pt-4 mt-2">
                                <span>Total</span>
                                <span className="font-mono text-blue-400">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 border-t border-white/10 pt-6 relative z-[100]">
                        <button
                            type="button"
                            onClick={handleSendQuote}
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-8 rounded-lg flex items-center gap-2 transition-all shadow-lg active:scale-95 hover:scale-105 cursor-pointer relative z-[100]"
                        >
                            {isSending ? (
                                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[24px]">send</span>
                            )}
                            <span className="text-lg">{isSending ? "Enviando..." : "Envio de Cotizacion"}</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* FLOATING ACTION BUTTON REMOVED TO CLEAR RIGHT SIDE */}
        </div>
    );
};

export default QuotesView;
