import { httpDelete, httpGet, httpPatch, httpPost } from "../../../shared/http/httpClient";
import type { AdminCategory, AdminProfessional, AdminServiceRequest, AdminStats, AdminUser } from "../types/admin";

export function getAdminStats() {
  return httpGet<AdminStats>("/admin/stats");
}
export function getAdminUsers() {
  return httpGet<AdminUser[]>("/admin/users");
}
export function setUserStatus(id: number, status: string) {
  return httpPatch<AdminUser, { status: string }>(`/admin/users/${id}/status`, { status });
}
export type CreateUserPayload = { firstName: string; lastName: string; email: string; password: string; role: "CLIENT" | "PROFESSIONAL" | "ADMIN" };
export function createUser(payload: CreateUserPayload) {
  return httpPost<AdminUser, CreateUserPayload>("/admin/users", payload);
}
export function setUserAdminRole(id: number, grant: boolean) {
  return httpPatch<AdminUser, { grant: boolean }>(`/admin/users/${id}/admin-role`, { grant });
}
export function getAdminProfessionals() {
  return httpGet<AdminProfessional[]>("/admin/professionals");
}
export function setProfessionalVerification(id: number, verificationStatus: string) {
  return httpPatch<AdminProfessional, { verificationStatus: string }>(`/admin/professionals/${id}/verification`, { verificationStatus });
}
export function getAdminServiceRequests() {
  return httpGet<AdminServiceRequest[]>("/admin/service-requests");
}
export function getAdminCategories() {
  return httpGet<AdminCategory[]>("/admin/categories");
}
export function setCategoryActive(id: number, isActive: boolean) {
  return httpPatch<AdminCategory, { isActive: boolean }>(`/admin/categories/${id}/active`, { isActive });
}

export function createCategory(payload: { code: string; name: string; description?: string }) {
  return httpPost<AdminCategory, { code: string; name: string; description?: string }>("/admin/categories", payload);
}
export function updateCategory(id: number, payload: { name?: string; description?: string }) {
  return httpPatch<AdminCategory, { name?: string; description?: string }>(`/admin/categories/${id}`, payload);
}
export function deleteCategory(id: number) {
  return httpDelete<{ deleted: boolean }>(`/admin/categories/${id}`);
}

export function cancelServiceRequest(id: number) {
  return httpPatch<AdminServiceRequest, Record<string, never>>(`/admin/service-requests/${id}/cancel`, {});
}
export function deleteServiceRequest(id: number) {
  return httpDelete<{ deleted: boolean }>(`/admin/service-requests/${id}`);
}
