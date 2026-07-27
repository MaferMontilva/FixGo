import { httpDelete, httpGet, httpPatch, httpPost } from "../../../shared/http/httpClient";
import type { ServiceRequestDraftPayload, ServiceRequestResponse } from "../types/serviceRequest";

export function createServiceRequestDraft(payload: ServiceRequestDraftPayload) {
  return httpPost<ServiceRequestResponse, ServiceRequestDraftPayload>("/service-requests/drafts", payload);
}

export function updateServiceRequestDraft(id: string, payload: ServiceRequestDraftPayload) {
  return httpPatch<ServiceRequestResponse, ServiceRequestDraftPayload>(`/service-requests/drafts/${id}`, payload);
}

export function publishServiceRequestDraft(id: string) {
  return httpPost<ServiceRequestResponse, Record<string, never>>(`/service-requests/drafts/${id}/publish`, {});
}

export function getMyServiceRequests() {
  return httpGet<ServiceRequestResponse[]>("/service-requests/mine");
}

export function getMyServiceRequestDetail(id: number) {
  return httpGet<ServiceRequestResponse>(`/service-requests/mine/${id}`);
}

export function getMyServiceRequestDraftDetail(id: number) {
  return httpGet<ServiceRequestResponse>(`/service-requests/drafts/${id}`);
}

export function cancelMyServiceRequest(id: number, reason?: string) {
  return httpPost<ServiceRequestResponse, { reason?: string }>(`/service-requests/${id}/cancel`, {
    ...(reason?.trim() ? { reason: reason.trim() } : {})
  });
}

export function duplicateCancelledServiceRequestAsDraft(id: number) {
  return httpPost<ServiceRequestResponse, Record<string, never>>(`/service-requests/${id}/duplicate-as-draft`, {});
}

export function hideMyServiceRequest(id: number) {
  return httpDelete<ServiceRequestResponse>(`/service-requests/${id}`);
}
