import { Plus } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeFormModalProps {
  isOpen: boolean;
  editingEmployee: Employee | null;
  isDarkMode: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function EmployeeFormModal({ isOpen, editingEmployee, isDarkMode, onClose, onSubmit }: EmployeeFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
      <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
        <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'} flex justify-between items-center`}>
          <h3 id="employee-modal-title" className="text-2xl font-bold">{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
          <button onClick={onClose} aria-label="Fechar modal" className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-full`}>
            <Plus className="w-6 h-6 rotate-45" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label htmlFor="employee-name" className="block text-xs font-mono uppercase text-zinc-400 mb-2">Nome Completo</label>
            <input id="employee-name" name="name" required defaultValue={editingEmployee?.name} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div>
            <label htmlFor="employee-position" className="block text-xs font-mono uppercase text-zinc-400 mb-2">Cargo/Função</label>
            <input id="employee-position" name="position" required defaultValue={editingEmployee?.position} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div>
            <label htmlFor="employee-area" className="block text-xs font-mono uppercase text-zinc-400 mb-2">Área</label>
            <input id="employee-area" name="area" required defaultValue={editingEmployee?.area} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div>
            <label htmlFor="employee-role" className="block text-xs font-mono uppercase text-zinc-400 mb-2">Nível</label>
            <select id="employee-role" name="role" defaultValue={editingEmployee?.role || 'Junior'} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
              <option>Estagiário</option>
              <option>Junior</option>
              <option>Pleno</option>
              <option>Senior</option>
              <option>Gerente</option>
            </select>
          </div>
          <div>
            <label htmlFor="employee-section" className="block text-xs font-mono uppercase text-zinc-400 mb-2">Seção/Setor</label>
            <input id="employee-section" name="section" required defaultValue={editingEmployee?.section} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Salário (BRL)</label>
            <input name="salary" type="number" required defaultValue={editingEmployee?.salary} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Status</label>
            <select name="status" defaultValue={editingEmployee?.status || 'Disponível'} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
              <option>Disponível</option>
              <option>Na Empresa</option>
              <option>Home Office</option>
              <option>Férias</option>
              <option>Viagem a Trabalho</option>
              <option>Tratamento de Saúde</option>
              <option>Atestado</option>
              <option>Fora de Expediente</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Rendimento (1-10)</label>
            <input name="performance" type="number" min="1" max="10" defaultValue={editingEmployee?.performance || 5} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Reclamações</label>
            <input name="complaints" type="number" min="0" defaultValue={editingEmployee?.complaints || 0} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Atestados</label>
            <input name="medicalCertificatesCount" type="number" min="0" defaultValue={editingEmployee?.medicalCertificatesCount || 0} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
          </div>
          <div className="col-span-2 pt-4">
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
              {editingEmployee ? 'Atualizar Dados' : 'Salvar Funcionário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
