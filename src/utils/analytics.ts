import { getAnalytics, logEvent as firebaseLogEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { logger } from './logger';

let analytics: ReturnType<typeof getAnalytics> | null = null;

export function initializeAnalytics(app: any) {
  try {
    if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      analytics = getAnalytics(app);
      logger.info('Firebase Analytics initialized');
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Analytics', error as Error);
  }
}

export function setAnalyticsUserId(userId: string) {
  if (analytics) {
    setUserId(analytics, userId);
    logger.debug('Analytics user ID set', { userId });
  }
}

export function setAnalyticsUserProperties(properties: Record<string, string>) {
  if (analytics) {
    setUserProperties(analytics, properties);
    logger.debug('Analytics user properties set', { properties });
  }
}

// Critical events
export function trackLogin(method: string) {
  if (analytics) {
    firebaseLogEvent(analytics, 'login', { method });
    logger.info('User logged in', { action: 'login', method });
  }
}

export function trackUpgrade(plan: string) {
  if (analytics) {
    firebaseLogEvent(analytics, 'upgrade', { plan });
    logger.info('User upgraded', { action: 'upgrade', plan });
  }
}

export function trackAiAnalysis(type: 'employee' | 'strategic', success: boolean) {
  if (analytics) {
    firebaseLogEvent(analytics, 'ai_analysis', { type, success });
    logger.info('AI analysis performed', { action: 'ai_analysis', type, success });
  }
}

export function trackError(errorName: string, errorMessage: string, component?: string) {
  if (analytics) {
    firebaseLogEvent(analytics, 'error', {
      error_name: errorName,
      error_message: errorMessage,
      component,
    });
    logger.error('Error tracked', new Error(errorMessage), { component, errorName });
  }
}

export function trackPageView(pageName: string) {
  if (analytics) {
    firebaseLogEvent(analytics, 'page_view', { page_name: pageName });
    logger.debug('Page view tracked', { action: 'page_view', pageName });
  }
}

export function trackCustomEvent(eventName: string, params?: Record<string, any>) {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
    logger.debug('Custom event tracked', { action: eventName, params });
  }
}
