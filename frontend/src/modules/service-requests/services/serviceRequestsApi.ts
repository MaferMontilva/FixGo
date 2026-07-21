import { httpPost } from "../../../shared/http/httpClient";
import type { CreateServiceRequestPayload, ServiceRequestResponse } from "../types/serviceRequest";

export function createServiceRequest(payload: CreateServiceRequestPayload) {
  return httpPost<ServiceRequestResponse, CreateServiceRequestPayload>("/service-requests", payload);
}
