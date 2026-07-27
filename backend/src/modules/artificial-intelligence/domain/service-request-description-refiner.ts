import { RefineServiceRequestDescriptionInput, RefineServiceRequestDescriptionResult } from "./service-request-ai-analysis";

export const SERVICE_REQUEST_DESCRIPTION_REFINER = Symbol("SERVICE_REQUEST_DESCRIPTION_REFINER");

export interface ServiceRequestDescriptionRefiner {
  refine(input: RefineServiceRequestDescriptionInput): Promise<RefineServiceRequestDescriptionResult>;
}
