import { httpGet, httpPatch, httpPost } from "../../../shared/http/httpClient";
import type { AuthResponse, AuthUser, ClientProfile, LoginPayload, RegisterPayload } from "../types/auth";

export function registerClient(payload: RegisterPayload) {
  return httpPost<AuthResponse, RegisterPayload>("/auth/register", payload);
}

export function login(payload: LoginPayload) {
  return httpPost<AuthResponse, LoginPayload>("/auth/login", payload);
}

export function refreshSession(refreshToken: string) {
  return httpPost<AuthResponse, { refreshToken: string }>("/auth/refresh", { refreshToken });
}

export function logout(refreshToken: string) {
  return httpPost<{ success: true }, { refreshToken: string }>("/auth/logout", { refreshToken });
}

export function getCurrentUser() {
  return httpGet<AuthUser>("/users/me");
}

export function getMyClientProfile() {
  return httpGet<ClientProfile>("/clients/me");
}

export function updateMyClientProfile(payload: { displayName?: string; notes?: string }) {
  return httpPatch<ClientProfile, { displayName?: string; notes?: string }>("/clients/me", payload);
}
