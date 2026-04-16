import { Plus } from 'lucide-react';

interface InventoryFormModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function InventoryFormModal({ isOpen, isDarkMode, onClose, onSubmit }: InventoryFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
        <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'} flex justify-between items-center`}>
          <h3 className="text-2xl font-bold">Novo Item de Estoque</h3>
          <button onClick={onClose} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-full`}>
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Nome do Item</label>
            <input name="name" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Quantidade</label>
              <input name="quantity" type="number" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Preço Unitário (BRL)</label>
              <input name="unitPrice" type="number" step="0.01" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Categoria</label>
            <input name="category" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Adicionar ao Estoque
          </button>
        </form>
      </div>
    </div>
  );
}
