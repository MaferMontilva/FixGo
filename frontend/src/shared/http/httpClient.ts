import type { ApiError } from "../types/apiError";

const DEFAULT_API_URL = "http://127.0.0.1:3000/api";

function normalizeApiUrl(url: string) {
  const cleanUrl = url.replace(/\/+$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
}

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL ?? DEFAULT_API_URL);

type AccessTokenProvider = () => string | null;

let accessTokenProvider: AccessTokenProvider | null = null;

export function setAccessTokenProvider(provider: AccessTokenProvider | null) {
  accessTokenProvider = provider;
}

function getHeaders(hasJsonBody = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  const accessToken = accessTokenProvider?.();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function parseJsonResponse<T>(response: Response, path: string): Promise<T> {
  const payload = (await response.json().catch(() => null)) as unknown;

  if (response.ok) {
    return payload as T;
  }

  const responseMessage = (payload as { message?: unknown } | null)?.message;
  const details = Array.isArray(responseMessage) ? responseMessage : undefined;

  const error: ApiError = {
    status: response.status,
    message:
      typeof responseMessage === "string"
        ? responseMessage
        : details?.[0] ?? `La API respondio con estado ${response.status}`,
    path,
    details
  };

  throw error;
}

export async function httpGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getHeaders()
  });

  return parseJsonResponse<T>(response, path);
}

export async function httpPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(body)
  });

  return parseJsonResponse<TResponse>(response, path);
}

export async function httpPatch<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(body)
  });

  return parseJsonResponse<TResponse>(response, path);
}

export async function httpDelete<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: getHeaders()
  });

  return parseJsonResponse<TResponse>(response, path);
}
