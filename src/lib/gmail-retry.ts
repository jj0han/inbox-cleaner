/**
 * withRetry — Wraps a Gmail API call with exponential backoff retry.
 * Retries on HTTP 429 (rate limit) and 503 (service unavailable) only.
 * Max 3 attempts. Delays: 500ms → 1000ms → 2000ms.
 */

const RETRY_DELAYS_MS = [500, 1000, 2000];

function isRetryableError(e: unknown): boolean {
  if (e instanceof Error) {
    // googleapis surfaces HTTP status in the message or as a .code / .status property
    const msg = e.message.toLowerCase();
    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("quota")) return true;
    if (msg.includes("503") || msg.includes("service unavailable")) return true;
  }
  // googleapis GaxiosError has a .status field
  const asAny = e as { status?: number; code?: number };
  if (asAny.status === 429 || asAny.status === 503) return true;
  if (asAny.code === 429 || asAny.code === 503) return true;
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (!isRetryableError(e)) throw e; // non-retryable: fail fast
      if (attempt < RETRY_DELAYS_MS.length) {
        const waitMs = RETRY_DELAYS_MS[attempt];
        console.warn(
          `Gmail API retryable error (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}). Retrying in ${waitMs}ms...`
        );
        await delay(waitMs);
      }
    }
  }
  throw lastError;
}
