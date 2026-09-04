/**
 * Same-origin base URL. Requests go to this Next.js app; `next.config.ts`
 * rewrites `/api/auth/*` and `/api/v1/*` to the Express backend.
 * That keeps OAuth/session cookies first-party and avoids state_mismatch.
 */
export const API_URL = "";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.error ?? "Request failed",
      response.status,
      payload?.details,
    );
  }

  return payload as T;
}
