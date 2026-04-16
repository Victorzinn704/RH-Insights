import { BrainCircuit } from 'lucide-react';
import Markdown from 'react-markdown';
import { Employee } from '../../types';
import { sanitizeMarkdown } from '../../utils/sanitize';

interface AiTabProps {
  employees: Employee[];
  isAnalyzing: boolean;
  aiAnalysis: string | null;
  isDarkMode: boolean;
  onRunStrategicDecision: () => void;
}

export function AiTab({
  employees,
  isAnalyzing,
  aiAnalysis,
  isDarkMode,
  onRunStrategicDecision,
}: AiTabProps) {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <div className={`inline-flex p-3 rounded-2xl mb-2 ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight">Decisão Estratégica IA</h2>
        <p className={`${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Nossa inteligência artificial analisa os dados de RH e Financeiro para sugerir as melhores rotas para sua empresa.</p>
        <button
          onClick={onRunStrategicDecision}
          disabled={isAnalyzing}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analisando...' : 'Gerar Análise Estratégica'}
        </button>
      </header>

      <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'}`}>
          <h4 className="font-bold">Tabela Comparativa de Rendimento</h4>
          <p className="text-sm text-zinc-500">Comparativo direto para suporte à decisão gerencial.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`${isDarkMode ? 'bg-zinc-950 text-zinc-400' : 'bg-zinc-50 text-zinc-400'} border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'}`}>
                <th className="px-6 py-4 text-xs font-mono uppercase">Funcionário</th>
                <th className="px-6 py-4 text-xs font-mono uppercase">Rendimento</th>
                <th className="px-6 py-4 text-xs font-mono uppercase">Atestados</th>
                <th className="px-6 py-4 text-xs font-mono uppercase">Reclamações</th>
                <th className="px-6 py-4 text-xs font-mono uppercase">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-black/5'}`}>
              {[...employees].sort((a, b) => b.performance - a.performance).map(emp => (
                <tr key={emp.id} className={`${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'} transition-colors`}>
                  <td className="px-6 py-4">
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{emp.name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{emp.area}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 w-24 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                        <div className={`h-full ${emp.performance > 7 ? 'bg-emerald-500' : emp.performance > 4 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${emp.performance * 10}%` }} />
                      </div>
                      <span className={`font-mono font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{emp.performance}/10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-mono ${emp.medicalCertificatesCount > 3 ? 'text-red-600 font-bold' : isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {emp.medicalCertificatesCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-mono ${emp.complaints > 0 ? 'text-orange-600 font-bold' : isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {emp.complaints}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>{emp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {aiAnalysis && !isAnalyzing && (
        <div className={`max-w-4xl mx-auto p-10 rounded-[40px] shadow-xl border prose prose-emerald ${isDarkMode ? 'bg-zinc-900 border-zinc-800 prose-invert' : 'bg-white border-black/5'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold m-0">Resultado da Análise Estratégica</h3>
          </div>
          <Markdown>{sanitizeMarkdown(aiAnalysis)}</Markdown>
        </div>
      )}
    </div>
  );
}
