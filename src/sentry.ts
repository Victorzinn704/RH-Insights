import * as Sentry from '@sentry/react';
import { logger } from './utils/logger';

export function initializeSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    logger.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filter out non-critical errors in production
      if (import.meta.env.PROD) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Ignore network errors that are expected
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return null;
          }
        }
      }
      return event;
    },
  });

  logger.info('Sentry initialized', { environment: import.meta.env.MODE });
}
