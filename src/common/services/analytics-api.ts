import { useAuthStore } from '@/common/stores/useAuthStore';
import { AnalyticsEventName } from '@/common/types/analytics';

const SESSION_STORAGE_KEY = 'decantd-session-id';

function getSessionId() {
  if (typeof window === 'undefined') return 'server';

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-auth-token'] = token;
  return headers;
}

export async function trackEvent(
  eventName: AnalyticsEventName,
  properties?: Record<string, unknown>,
) {
  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        eventName,
        sessionId: getSessionId(),
        path: typeof window !== 'undefined' ? window.location.pathname : null,
        properties: properties || {},
      }),
    });
  } catch {
    // Silent failure; analytics should never block user actions.
  }
}
