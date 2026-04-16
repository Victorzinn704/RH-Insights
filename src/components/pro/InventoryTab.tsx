import { Plus, Package } from 'lucide-react';
import { InventoryItem, Currency } from '../../types';
import { convertAmount, formatCurrency } from '../../utils/currency';

interface InventoryTabProps {
  inventory: InventoryItem[];
  isDarkMode: boolean;
  displayCurrency: Currency;
  rates: { USD: number; EUR: number; BRL: number };
  onOpenModal: () => void;
}

export function InventoryTab({ inventory, isDarkMode, displayCurrency, rates, onOpenModal }: InventoryTabProps) {
  return (
    <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xl'}`}>
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
          Gestão de Estoque
        </h4>
        <button
          onClick={onOpenModal}
          className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.length === 0 ? (
          <p className="col-span-full text-center py-20 text-zinc-500 text-sm italic">Nenhum item no estoque.</p>
        ) : (
          inventory.map(item => (
            <div key={item.id} className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                  <Package className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-zinc-500 shadow-sm'}`}>
                  {item.category}
                </span>
              </div>
              <h5 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{item.name}</h5>
              <div className="flex justify-between items-end mt-6">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Quantidade</p>
                  <p className={`font-mono text-xl font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{item.quantity} <span className="text-xs font-normal opacity-50">un</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Valor Total</p>
                  <p className="text-emerald-500 font-bold">{formatCurrency(convertAmount(item.quantity * item.unitPrice, 'BRL', displayCurrency, rates), displayCurrency)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
