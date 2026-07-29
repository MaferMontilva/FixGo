import { httpGet, httpPost } from "../../../shared/http/httpClient";
import type { ServiceOrder } from "../types/serviceOrder";

export function acceptBudget(budgetId: number) {
  return httpPost<ServiceOrder, { budgetId: number }>("/service-orders/accept-budget", { budgetId });
}

export function getClientOrders() {
  return httpGet<ServiceOrder[]>("/service-orders/client");
}

export function getProfessionalOrders() {
  return httpGet<ServiceOrder[]>("/service-orders/professional");
}

export function startOrder(id: number) {
  return httpPost<ServiceOrder, Record<string, never>>(`/service-orders/${id}/start`, {});
}

export function completeOrder(id: number) {
  return httpPost<ServiceOrder, Record<string, never>>(`/service-orders/${id}/complete`, {});
}

export function confirmOrder(id: number) {
  return httpPost<ServiceOrder, Record<string, never>>(`/service-orders/${id}/confirm`, {});
}
