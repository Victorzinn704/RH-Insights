import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Import logger dynamically to avoid circular dependencies
    import('../utils/logger').then(({ logger }) => {
      logger.error('[ErrorBoundary] Uncaught error', error, {
        component: 'ErrorBoundary',
        componentStack: errorInfo.componentStack,
      });
    });
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Ops! Algo deu errado.</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Encontramos um erro inesperado. Tente recarregar a página.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
