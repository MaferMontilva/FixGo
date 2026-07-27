import { AnalyzeServiceRequestInput, ServiceRequestAiAnalysis } from "./service-request-ai-analysis";

export const SERVICE_REQUEST_AI_ANALYZER = Symbol("SERVICE_REQUEST_AI_ANALYZER");

export interface ServiceRequestAiAnalyzer {
  analyze(input: AnalyzeServiceRequestInput): Promise<ServiceRequestAiAnalysis>;
}
