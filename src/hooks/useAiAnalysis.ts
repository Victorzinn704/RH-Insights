import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Employee } from '../types';
import { analyzeEmployeePerformance, getStrategicDecision } from '../services/geminiService';

export interface UseAiAnalysisReturn {
  aiAnalysis: string | null;
  isAnalyzing: boolean;
  aiError: string | null;
  runAiAnalysis: (employee: Employee) => Promise<void>;
  runStrategicDecision: () => Promise<void>;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro inesperado na análise de IA.';
}

export function useAiAnalysis(employees: Employee[], expenses: unknown[]): UseAiAnalysisReturn {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const employeesRef = useRef(employees);
  const expensesRef = useRef(expenses);
  useEffect(() => {
    employeesRef.current = employees;
    expensesRef.current = expenses;
  }, [employees, expenses]);

  const runAiAnalysis = useCallback(async (employee: Employee) => {
    setAiAnalysis(null);
    setAiError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeEmployeePerformance(employee);
      setAiAnalysis(result || 'A análise não retornou resultado.');
    } catch (error) {
      const message = extractErrorMessage(error);
      setAiError(message);
      toast.error(`Falha na análise: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const runStrategicDecision = useCallback(async () => {
    setAiAnalysis(null);
    setAiError(null);
    setIsAnalyzing(true);
    try {
      const result = await getStrategicDecision(employeesRef.current, expensesRef.current);
      setAiAnalysis(result || 'A análise estratégica não retornou resultado.');
    } catch (error) {
      const message = extractErrorMessage(error);
      setAiError(message);
      toast.error(`Falha na análise estratégica: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { aiAnalysis, isAnalyzing, aiError, runAiAnalysis, runStrategicDecision };
}
