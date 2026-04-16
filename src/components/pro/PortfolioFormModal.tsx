import { Plus } from 'lucide-react';
import { CompanyPortfolio } from '../../types';

interface PortfolioFormModalProps {
  isOpen: boolean;
  portfolio: CompanyPortfolio | null;
  isDarkMode: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function PortfolioFormModal({ isOpen, portfolio, isDarkMode, onClose, onSubmit }: PortfolioFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
        <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'} flex justify-between items-center`}>
          <h3 className="text-2xl font-bold">Editar Portfólio de Marketing</h3>
          <button onClick={onClose} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-full`}>
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Nome da Empresa</label>
              <input name="companyName" required defaultValue={portfolio?.companyName} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Slogan (Tagline)</label>
              <input name="tagline" defaultValue={portfolio?.tagline} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">URL do Logo</label>
            <input name="logoUrl" defaultValue={portfolio?.logoUrl} placeholder="https://exemplo.com/logo.png" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Descrição de Marketing</label>
            <textarea name="description" defaultValue={portfolio?.description} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-32`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Missão</label>
              <textarea name="mission" defaultValue={portfolio?.mission} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24`} />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Visão</label>
              <textarea name="vision" defaultValue={portfolio?.vision} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Valores (separados por vírgula)</label>
            <input name="values" defaultValue={portfolio?.values?.join(', ')} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
            Salvar Portfólio
          </button>
        </form>
      </div>
    </div>
  );
}
