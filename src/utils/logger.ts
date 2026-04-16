type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` | ${error.name}: ${error.message}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedLog = this.formatLog(entry);

    // Console output in development
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedLog);
          break;
        case 'info':
          console.info(formattedLog);
          break;
        case 'warn':
          console.warn(formattedLog);
          break;
        case 'error':
          console.error(formattedLog, error);
          break;
      }
    }

    // In production, only log warnings and errors to console
    if (!this.isDevelopment && (level === 'warn' || level === 'error')) {
      console[level](formattedLog, error);
    }

    // Send to external monitoring (Sentry will capture console.error automatically)
    if (level === 'error' && error) {
      // Sentry integration will capture this
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: {
            custom: context,
          },
          level: 'error',
        });
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }
}

export const logger = new Logger();

// Extend Window interface for Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: { contexts?: { custom?: LogContext }; level?: string }) => void;
    };
  }
}
