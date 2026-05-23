// ─────────────────────────────────────────────────────────────────────────────
// Cookie-based token storage — persists across browser restarts.
// Falls back to localStorage read for backwards compat during migration.
// ─────────────────────────────────────────────────────────────────────────────

const COOKIE_NAME = 'swaplio_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

// ── Cookie helpers ────────────────────────────────────────────────────────────

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `max-age=${maxAge}`,
    'path=/',
    'SameSite=Strict',
    // 'Secure', // uncomment in production with HTTPS
  ].join('; ');
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split('=').slice(1).join('='));
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Strict`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Primary: cookie  |  Fallback: old localStorage key during migration
  return getCookie(COOKIE_NAME) ?? localStorage.getItem('swaplio_token');
}

export function setToken(token: string): void {
  setCookie(COOKIE_NAME, token, COOKIE_MAX_AGE);
  // Keep localStorage in sync so old code reading it still works
  try {
    localStorage.setItem('swaplio_token', token);
  } catch {
    /* ignore quota errors */
  }
}

export function clearToken(): void {
  deleteCookie(COOKIE_NAME);
  try {
    localStorage.removeItem('swaplio_token');
  } catch {
    /* ignore */
  }
}

export function clearAuth(): void {
  clearToken();
}
