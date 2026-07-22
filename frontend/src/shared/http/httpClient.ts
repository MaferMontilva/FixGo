import type { ApiError } from "../types/apiError";

const DEFAULT_API_URL = "http://127.0.0.1:3000/api";

function normalizeApiUrl(url: string) {
  const cleanUrl = url.replace(/\/+$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
}

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL ?? DEFAULT_API_URL);

async function parseJsonResponse<T>(response: Response, path: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const error: ApiError = {
    status: response.status,
    message: `La API respondió con estado ${response.status}`,
    path
  };

  throw error;
}

export async function httpGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json"
    }
  });

  return parseJsonResponse<T>(response, path);
}

export async function httpPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return parseJsonResponse<TResponse>(response, path);
}
