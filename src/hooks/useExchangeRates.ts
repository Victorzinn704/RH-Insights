import { useState, useEffect, useCallback, useRef } from 'react';
import { Currency } from '../types';

const DEFAULT_RATES = { USD: 5.0, EUR: 5.4, BRL: 1.0 };
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export function useExchangeRates() {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchRates = useCallback(async (attempt = 0) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL', {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const newRates = {
        USD: Number(data.USDBRL.ask),
        EUR: Number(data.EURBRL.ask),
        BRL: 1.0,
      };

      if (mountedRef.current) {
        setRates(newRates);
        setLastFetched(new Date());
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);

      if (attempt < MAX_RETRIES) {
        setTimeout(() => fetchRates(attempt + 1), RETRY_DELAY_MS);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchRates();
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchRates]);

  const [displayCurrency, setDisplayCurrency] = useState<Currency>('BRL');

  return { rates, displayCurrency, setDisplayCurrency, isLoading, lastFetched, error, refetch: fetchRates };
}
