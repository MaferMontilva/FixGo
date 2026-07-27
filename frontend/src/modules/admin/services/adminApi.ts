import { httpGet, httpPatch } from "../../../shared/http/httpClient";
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
