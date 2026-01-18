/**
 * Structured Logger Utility
 * - JSON structured output for production
 * - Human-readable output for development
 * - Sentry integration for errors in production
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

interface LogContext {
  [key: string]: unknown;
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  action?: string;
  platform?: string;
}

interface StructuredLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: LogContext;
}

/**
 * Format log entry as JSON for production, human-readable for dev
 */
function formatLog(log: StructuredLog): string {
  if (isProd) {
    return JSON.stringify(log);
  }
  
  const contextStr = log.context 
    ? ` | ${Object.entries(log.context).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' ')}`
    : '';
  return `[${log.level.toUpperCase()}] ${log.message}${contextStr}`;
}

/**
 * Report error to Sentry if available in production
 */
async function reportToSentry(message: string, context?: LogContext): Promise<void> {
  if (!isProd) return;
  
  try {
    const Sentry = await import('@sentry/react');
    Sentry.captureMessage(message, {
      level: 'error',
      extra: context,
    });
  } catch {
    // Sentry not available, ignore
  }
}

export const logger = {
  debug: (message: string, context?: LogContext): void => {
    if (isDev) {
      const log = formatLog({ timestamp: new Date().toISOString(), level: 'debug', message, context });
      console.debug(log);
    }
  },

  info: (message: string, context?: LogContext): void => {
    const log = formatLog({ timestamp: new Date().toISOString(), level: 'info', message, context });
    console.info(log);
  },

  warn: (message: string, context?: LogContext): void => {
    const log = formatLog({ timestamp: new Date().toISOString(), level: 'warn', message, context });
    console.warn(log);
  },

  error: (message: string, context?: LogContext): void => {
    const log = formatLog({ timestamp: new Date().toISOString(), level: 'error', message, context });
    console.error(log);
    
    // Report to Sentry in production (fire-and-forget with error handling)
    reportToSentry(message, context).catch(() => {
      // Silently ignore Sentry failures - don't break the app
    });
  },

  /**
   * Create a child logger with preset context
   */
  withContext: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => logger.debug(message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) => logger.info(message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) => logger.warn(message, { ...baseContext, ...context }),
    error: (message: string, context?: LogContext) => logger.error(message, { ...baseContext, ...context }),
  }),
};

export default logger;
