import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SERVICE_REQUEST_STATUS } from "../domain/service-request.entity";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { ensureClientProfile } from "./draft-validation";

@Injectable()
export class GetClientServiceRequestDraftDetailUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  async execute(id: number, clientUserId: number) {
    await ensureClientProfile(this.serviceRequestsRepository, clientUserId);

    const draft = await this.serviceRequestsRepository.findOwnedDraftById(id, clientUserId);

    if (!draft || draft.status !== SERVICE_REQUEST_STATUS.DRAFT) {
      throw new NotFoundException("Borrador de solicitud no encontrado.");
    }

    return draft;
  }
}
