import { httpGet, httpPatch, httpPost } from "../../../shared/http/httpClient";
import type { AuthResponse, AuthUser, ClientProfile, LoginPayload, RegisterPayload, RegisterProfessionalPayload } from "../types/auth";

export function registerClient(payload: RegisterPayload) {
  return httpPost<AuthResponse, RegisterPayload>("/auth/register", payload);
}

export function registerProfessional(payload: RegisterProfessionalPayload) {
  return httpPost<AuthResponse, RegisterProfessionalPayload>("/auth/register-professional", payload);
}

export function login(payload: LoginPayload) {
  return httpPost<AuthResponse, LoginPayload>("/auth/login", payload);
}

export type ResetPasswordPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export function resetPassword(payload: ResetPasswordPayload) {
  return httpPost<{ updated: boolean }, ResetPasswordPayload>("/auth/reset-password", payload);
}

export function changePassword(password: string) {
  return httpPost<{ changed: true }, { password: string }>("/auth/change-password", { password });
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
