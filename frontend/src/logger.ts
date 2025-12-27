const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

const currentLogLevel = (import.meta.env.VITE_LOG_LEVEL || 'INFO').toUpperCase();
const currentLevelValue = LOG_LEVELS[currentLogLevel as keyof typeof LOG_LEVELS] ?? LOG_LEVELS.INFO;

const logger = {
    debug: (message: string, ...args: any[]) => {
        if (currentLevelValue <= LOG_LEVELS.DEBUG) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
    info: (message: string, ...args: any[]) => {
        if (currentLevelValue <= LOG_LEVELS.INFO) {
            console.info(`[INFO] ${message}`, ...args);
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (currentLevelValue <= LOG_LEVELS.WARN) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },
    error: (message: string, ...args: any[]) => {
        if (currentLevelValue <= LOG_LEVELS.ERROR) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    },
};

export default logger;
