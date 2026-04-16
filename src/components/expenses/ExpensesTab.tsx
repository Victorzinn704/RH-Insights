import { Plus, BrainCircuit, TrendingUp, FileText, Filter } from 'lucide-react';
import { Expense, Currency } from '../../types';
import { convertAmount, formatCurrency } from '../../utils/currency';

interface ExpensesTabProps {
  expenses: Expense[];
  displayCurrency: Currency;
  rates: { USD: number; EUR: number; BRL: number };
  isDarkMode: boolean;
  onCurrencyChange: (currency: Currency) => void;
  onAddExpense: () => void;
}

export function ExpensesTab({
  expenses,
  displayCurrency,
  rates,
  isDarkMode,
  onCurrencyChange,
  onAddExpense,
}: ExpensesTabProps) {
  const totalMonthlyExpenses = expenses.reduce((acc, curr) => acc + convertAmount(curr.amount, curr.currency, displayCurrency, rates), 0);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
       <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gastos & Finanças</h2>
          <p className="text-zinc-500">Controle de despesas operacionais e conversão de moedas.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex p-1 rounded-lg border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            {(['BRL', 'USD', 'EUR'] as Currency[]).map(c => (
              <button
                key={c}
                onClick={() => onCurrencyChange(c)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                  displayCurrency === c
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={onAddExpense}
            className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-black transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" /> Registrar Gasto
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
          <p className="text-xs font-mono uppercase text-zinc-400 mb-1">Câmbio {displayCurrency === 'USD' ? 'BRL' : 'USD'}</p>
          <p className="text-xl font-bold">{formatCurrency(convertAmount(1, displayCurrency === 'USD' ? 'BRL' : 'USD', displayCurrency, rates), displayCurrency)}</p>
        </div>
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
          <p className="text-xs font-mono uppercase text-zinc-400 mb-1">Câmbio {displayCurrency === 'EUR' ? 'BRL' : 'EUR'}</p>
          <p className="text-xl font-bold">{formatCurrency(convertAmount(1, displayCurrency === 'EUR' ? 'BRL' : 'EUR', displayCurrency, rates), displayCurrency)}</p>
        </div>
        <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
          <p className="text-xs font-mono uppercase text-emerald-100 mb-1">Total Mensal ({displayCurrency})</p>
          <p className="text-2xl font-bold">{formatCurrency(totalMonthlyExpenses, displayCurrency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
          <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-zinc-800' : 'border-black/5'}`}>
            <h4 className="font-bold">Relatório Consolidado por Categoria</h4>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border-b`}>
                  <th className="px-6 py-3 text-xs font-mono uppercase text-zinc-400">Categoria</th>
                  <th className="px-6 py-3 text-xs font-mono uppercase text-zinc-400">Total ({displayCurrency})</th>
                  <th className="px-6 py-3 text-xs font-mono uppercase text-zinc-400">%</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-black/5'}`}>
                {['API', 'Cloud', 'Licença', 'Água', 'Luz', 'Internet'].map(cat => {
                  const total = expenses.filter(ex => ex.type === cat).reduce((a, c) => a + convertAmount(c.amount, c.currency, displayCurrency, rates), 0);
                  const percentage = totalMonthlyExpenses > 0 ? (total / totalMonthlyExpenses) * 100 : 0;
                  return (
                    <tr key={cat} className={isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50/50'}>
                      <td className="px-6 py-4 font-medium">{cat}</td>
                      <td className="px-6 py-4 font-mono">{formatCurrency(total, displayCurrency)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                            <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-xs font-mono">{percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
          <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-zinc-800' : 'border-black/5'}`}>
            <h4 className="font-bold">Histórico de Despesas</h4>
            <Filter className="w-5 h-5 text-zinc-400" />
          </div>
          <div className={`divide-y max-h-[400px] overflow-y-auto ${isDarkMode ? 'divide-zinc-800' : 'divide-black/5'}`}>
            {expenses.map(ex => (
                  <div key={ex.id} className={`p-6 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        ex.type === 'API' ? (isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700') :
                        ex.type === 'Cloud' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700') :
                        (isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-700')
                      }`}>
                        {ex.type === 'API' ? <BrainCircuit className="w-6 h-6" /> :
                         ex.type === 'Cloud' ? <TrendingUp className="w-6 h-6" /> :
                         <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{ex.type}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{ex.description || 'Sem descrição'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{ex.currency} {ex.amount.toLocaleString()}</p>
                      <p className="text-xs text-emerald-500 font-medium">≈ {formatCurrency(convertAmount(ex.amount, ex.currency, displayCurrency, rates), displayCurrency)}</p>
                    </div>
                  </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
