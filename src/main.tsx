import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { initializeSentry } from './sentry';

// Initialize Sentry before rendering
initializeSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorBoundary />} showDialog>
      <ErrorBoundary>
        <Toaster position="top-right" toastOptions={{
          className: 'dark:bg-zinc-900 dark:text-white border dark:border-zinc-800',
          duration: 4000,
        }} />
        <App />
      </ErrorBoundary>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
