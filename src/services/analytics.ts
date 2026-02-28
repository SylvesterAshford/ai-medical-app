// Analytics Service
// Lightweight event & screen tracking — same API shape as PostHog for easy migration.
// In dev: logs to console. In production: stores in buffer for future reporting.

interface AnalyticsEvent {
    name: string;
    properties?: Record<string, unknown>;
    timestamp: string;
    type: 'event' | 'screen_view';
}

// ── Internal State ──────────────────────────────────────────────

const MAX_BUFFER_SIZE = 200;
const eventBuffer: AnalyticsEvent[] = [];
let isEnabled = true;

// ── Public API ──────────────────────────────────────────────────

/**
 * Track a custom event (e.g., "chat_message_sent", "bmi_calculated").
 */
export function trackEvent(
    name: string,
    properties?: Record<string, unknown>
): void {
    if (!isEnabled) return;

    const entry: AnalyticsEvent = {
        name,
        properties,
        timestamp: new Date().toISOString(),
        type: 'event',
    };

    if (__DEV__) {
        console.log('[Analytics:event]', name, properties || '');
    }

    pushToBuffer(entry);
}

/**
 * Track a screen view. Call this when the user navigates to a new screen.
 */
export function trackScreenView(
    screenName: string,
    properties?: Record<string, unknown>
): void {
    if (!isEnabled) return;

    const entry: AnalyticsEvent = {
        name: screenName,
        properties,
        timestamp: new Date().toISOString(),
        type: 'screen_view',
    };

    if (__DEV__) {
        console.log('[Analytics:screen]', screenName);
    }

    pushToBuffer(entry);
}

/**
 * Enable or disable analytics (e.g., for user opt-out / privacy).
 */
export function setAnalyticsEnabled(enabled: boolean): void {
    isEnabled = enabled;
}

/**
 * Get all tracked events (useful for debugging or future upload).
 */
export function getEventBuffer(): readonly AnalyticsEvent[] {
    return eventBuffer;
}

/**
 * Clear the event buffer.
 */
export function clearEventBuffer(): void {
    eventBuffer.length = 0;
}

// ── Internals ───────────────────────────────────────────────────

function pushToBuffer(entry: AnalyticsEvent): void {
    eventBuffer.push(entry);
    if (eventBuffer.length > MAX_BUFFER_SIZE) {
        eventBuffer.shift(); // Drop oldest
    }
}
