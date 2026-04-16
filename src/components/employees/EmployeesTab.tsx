import { Plus, BrainCircuit, Edit2, Trash2 } from 'lucide-react';
import { Employee, Currency } from '../../types';
import { ROLE_HIERARCHY, convertAmount, formatCurrency } from '../../utils/currency';

interface EmployeesTabProps {
  employees: Employee[];
  isDarkMode: boolean;
  displayCurrency: Currency;
  rates: { USD: number; EUR: number; BRL: number };
  onAddNew: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onAiAnalysis: (employee: Employee) => void;
}

export function EmployeesTab({
  employees,
  isDarkMode,
  displayCurrency,
  rates,
  onAddNew,
  onEdit,
  onDelete,
  onAiAnalysis,
}: EmployeesTabProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Funcionários</h2>
          <p className="text-zinc-500">Gerencie sua equipe e acompanhe disponibilidades.</p>
        </div>
        <button
          onClick={onAddNew}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> Novo Funcionário
        </button>
      </header>

      <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border-b`}>
                <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Funcionário</th>
                <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Cargo & Nível</th>
                <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Salário</th>
                <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-black/5'}`}>
              {[...employees].sort((a, b) => {
                const roleDiff = ROLE_HIERARCHY[a.role] - ROLE_HIERARCHY[b.role];
                if (roleDiff !== 0) return roleDiff;
                return b.salary - a.salary;
              }).map(emp => (
                <tr key={emp.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{emp.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{emp.section}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{emp.position}</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      emp.role === 'Gerente' ? (isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700') :
                      emp.role === 'Senior' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700') :
                      emp.role === 'Pleno' ? (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700') :
                      emp.role === 'Junior' ? (isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-700') :
                      (isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                        emp.status === 'Disponível' || emp.status === 'Na Empresa' ? 'bg-emerald-500 shadow-emerald-500/40 animate-pulse' :
                        emp.status === 'Home Office' ? 'bg-blue-500 shadow-blue-500/40' :
                        ['Atestado', 'Tratamento de Saúde'].includes(emp.status) ? 'bg-red-500 shadow-red-500/40' :
                        'bg-zinc-400'
                      }`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{emp.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">
                    <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}>{formatCurrency(convertAmount(emp.salary, 'BRL', displayCurrency, rates), displayCurrency)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAiAnalysis(emp)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-emerald-500' : 'hover:bg-emerald-50 text-emerald-600'}`}
                        title="Análise IA"
                      >
                        <BrainCircuit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(emp)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-blue-500' : 'hover:bg-blue-50 text-blue-600'}`}
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(emp.id!)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-red-500' : 'hover:bg-red-50 text-red-600'}`}
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
