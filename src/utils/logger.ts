/**
 * Logger utility with log levels
 * Only logs debug messages in development mode
 */

const isDev = import.meta.env.DEV;

export const logger = {
    debug: (message: string, ...args: unknown[]): void => {
        if (isDev) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },

    info: (message: string, ...args: unknown[]): void => {
        console.info(`[INFO] ${message}`, ...args);
    },

    warn: (message: string, ...args: unknown[]): void => {
        console.warn(`[WARN] ${message}`, ...args);
    },

    error: (message: string, ...args: unknown[]): void => {
        console.error(`[ERROR] ${message}`, ...args);
    },
};

export default logger;
