import { Inject, Injectable } from "@nestjs/common";
import { RefineServiceRequestDescriptionInput, RefineServiceRequestDescriptionResult } from "../domain/service-request-ai-analysis";
import {
  SERVICE_REQUEST_DESCRIPTION_REFINER,
  ServiceRequestDescriptionRefiner
} from "../domain/service-request-description-refiner";

@Injectable()
export class RefineServiceRequestDescriptionUseCase {
  constructor(
    @Inject(SERVICE_REQUEST_DESCRIPTION_REFINER)
    private readonly refiner: ServiceRequestDescriptionRefiner
  ) {}

  execute(input: RefineServiceRequestDescriptionInput): Promise<RefineServiceRequestDescriptionResult> {
    return this.refiner.refine(input);
  }
}
