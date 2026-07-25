import { httpPatch, httpPost } from "../../../shared/http/httpClient";
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
