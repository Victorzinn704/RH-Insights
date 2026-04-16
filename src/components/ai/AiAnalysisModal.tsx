import { Plus } from 'lucide-react';
import Markdown from 'react-markdown';
import { Employee } from '../../types';
import { sanitizeMarkdown } from '../../utils/sanitize';

interface AiAnalysisModalProps {
  selectedEmployee: Employee | null;
  aiAnalysis: string | null;
  aiError: string | null;
  isAnalyzing: boolean;
  isDarkMode: boolean;
  onClose: () => void;
}

export function AiAnalysisModal({ selectedEmployee, aiAnalysis, aiError, isAnalyzing, isDarkMode, onClose }: AiAnalysisModalProps) {
  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col`}>
        <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-black/5 bg-emerald-50/50'} flex justify-between items-center`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {selectedEmployee.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{selectedEmployee.name}</h3>
              <p className="text-sm text-zinc-500">Análise de Performance IA</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-white'} rounded-full shadow-sm`}>
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
        <div className={`p-10 overflow-y-auto flex-1 prose prose-emerald max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-medium text-zinc-500">A IA está processando os dados...</p>
            </div>
          ) : aiError ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-bold text-red-500">Falha na Análise</p>
              <p className={`text-sm text-center max-w-md ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{aiError}</p>
            </div>
          ) : (
            <Markdown>{sanitizeMarkdown(aiAnalysis)}</Markdown>
          )}
        </div>
        <div className={`p-6 border-t ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-black/5 bg-zinc-50'} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-white border-black/10 hover:bg-zinc-100'} border rounded-xl font-medium transition-colors`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
