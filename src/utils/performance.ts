// Performance Monitoring Utilities
// Lightweight timing and performance tracking.

interface PerfEntry {
    label: string;
    durationMs: number;
    timestamp: string;
}

// ── Internal State ──────────────────────────────────────────────

const MAX_ENTRIES = 100;
const perfEntries: PerfEntry[] = [];

// ── Public API ──────────────────────────────────────────────────

/**
 * Measure the execution time of an async function.
 * Usage: const result = await measureTime('AI response', () => sendChatMessage(...));
 */
export async function measureTime<T>(
    label: string,
    fn: () => Promise<T>
): Promise<T> {
    const start = Date.now();
    try {
        const result = await fn();
        const durationMs = Date.now() - start;
        recordEntry(label, durationMs);
        return result;
    } catch (error) {
        const durationMs = Date.now() - start;
        recordEntry(`${label} [FAILED]`, durationMs);
        throw error;
    }
}

/**
 * Measure the execution time of a synchronous function.
 */
export function measureTimeSync<T>(label: string, fn: () => T): T {
    const start = Date.now();
    try {
        const result = fn();
        const durationMs = Date.now() - start;
        recordEntry(label, durationMs);
        return result;
    } catch (error) {
        const durationMs = Date.now() - start;
        recordEntry(`${label} [FAILED]`, durationMs);
        throw error;
    }
}

/**
 * Get all recorded performance entries.
 */
export function getPerfEntries(): readonly PerfEntry[] {
    return perfEntries;
}

/**
 * Log a summary of recent performance entries to the console.
 */
export function logPerformance(): void {
    if (perfEntries.length === 0) {
        console.log('[Perf] No entries recorded.');
        return;
    }

    console.log('[Perf] ─── Performance Summary ───');
    for (const entry of perfEntries.slice(-20)) {
        const status = entry.durationMs > 3000 ? '🔴' : entry.durationMs > 1000 ? '🟡' : '🟢';
        console.log(`  ${status} ${entry.label}: ${entry.durationMs}ms`);
    }
    console.log('[Perf] ──────────────────────────');
}

/**
 * Clear all recorded entries.
 */
export function clearPerfEntries(): void {
    perfEntries.length = 0;
}

// ── Internals ───────────────────────────────────────────────────

function recordEntry(label: string, durationMs: number): void {
    const entry: PerfEntry = {
        label,
        durationMs,
        timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
        const status = durationMs > 3000 ? '🔴' : durationMs > 1000 ? '🟡' : '🟢';
        console.log(`[Perf] ${status} ${label}: ${durationMs}ms`);
    }

    perfEntries.push(entry);
    if (perfEntries.length > MAX_ENTRIES) {
        perfEntries.shift();
    }
}
