import { httpPost } from "../../../shared/http/httpClient";
import type {
  RefineServiceRequestDescriptionRequest,
  RefineServiceRequestDescriptionResponse,
  ServiceRequestAiAnalysis,
  ServiceRequestAiAnalysisRequest
} from "../types/serviceRequest";

export function analyzeServiceRequestWithAi(payload: ServiceRequestAiAnalysisRequest) {
  return httpPost<ServiceRequestAiAnalysis, ServiceRequestAiAnalysisRequest>("/ai/service-request-analysis", payload);
}

export function refineServiceRequestDescriptionWithAi(payload: RefineServiceRequestDescriptionRequest) {
  return httpPost<RefineServiceRequestDescriptionResponse, RefineServiceRequestDescriptionRequest>("/artificial-intelligence/refine-service-request-description", payload);
}
