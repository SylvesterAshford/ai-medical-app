// Error Tracking Service
// Lightweight error capture — same API shape as Sentry for easy migration.
// In dev: logs to console. In production: stores in buffer for future reporting.

interface ErrorContext {
    screen?: string;
    userId?: string;
    extra?: Record<string, unknown>;
}

interface CapturedError {
    message: string;
    stack?: string;
    context: ErrorContext;
    timestamp: string;
    level: 'error' | 'warning' | 'info';
}

// ── Internal State ──────────────────────────────────────────────

const MAX_BUFFER_SIZE = 50;
const errorBuffer: CapturedError[] = [];
let userContext: { id?: string; email?: string } = {};

// ── Public API ──────────────────────────────────────────────────

/**
 * Set the current user context for error reports.
 * Call this after login.
 */
export function setUserContext(user: { id?: string; email?: string } | null) {
    userContext = user ? { id: user.id, email: user.email } : {};
}

/**
 * Capture an error with optional context.
 * Logs to console in __DEV__ and stores in buffer.
 */
export function captureError(
    error: Error | string,
    context?: ErrorContext
): void {
    const entry: CapturedError = {
        message: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'string' ? undefined : error.stack,
        context: {
            ...context,
            userId: context?.userId || userContext.id,
        },
        timestamp: new Date().toISOString(),
        level: 'error',
    };

    if (__DEV__) {
        console.error('[ErrorTracking]', entry.message, entry.context);
    }

    pushToBuffer(entry);
}

/**
 * Capture a warning or informational message.
 */
export function captureMessage(
    message: string,
    level: 'warning' | 'info' = 'info',
    context?: ErrorContext
): void {
    const entry: CapturedError = {
        message,
        context: {
            ...context,
            userId: context?.userId || userContext.id,
        },
        timestamp: new Date().toISOString(),
        level,
    };

    if (__DEV__) {
        const logFn = level === 'warning' ? console.warn : console.info;
        logFn(`[ErrorTracking:${level}]`, message, entry.context);
    }

    pushToBuffer(entry);
}

/**
 * Get all captured errors (useful for debugging or future upload).
 */
export function getErrorBuffer(): readonly CapturedError[] {
    return errorBuffer;
}

/**
 * Clear the error buffer.
 */
export function clearErrorBuffer(): void {
    errorBuffer.length = 0;
}

// ── Internals ───────────────────────────────────────────────────

function pushToBuffer(entry: CapturedError): void {
    errorBuffer.push(entry);
    if (errorBuffer.length > MAX_BUFFER_SIZE) {
        errorBuffer.shift(); // Drop oldest
    }
}
