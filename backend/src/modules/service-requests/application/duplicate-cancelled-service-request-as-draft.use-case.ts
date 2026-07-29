import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SERVICE_REQUEST_STATUS } from "../domain/service-request.entity";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { ensureClientProfile } from "./draft-validation";

@Injectable()
export class DuplicateCancelledServiceRequestAsDraftUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  async execute(id: number, clientUserId: number) {
    await ensureClientProfile(this.serviceRequestsRepository, clientUserId);

    const request = await this.serviceRequestsRepository.findOwnedServiceRequestById(id, clientUserId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    if (request.status !== SERVICE_REQUEST_STATUS.CANCELLED) {
      throw new ConflictException("Solo puedes crear una copia editable de una solicitud cancelada.");
    }

    const draft = await this.serviceRequestsRepository.duplicateOwnedCancelledAsDraft(id, clientUserId);
    if (!draft) throw new ConflictException("No fue posible crear la copia editable.");

    return draft;
  }
}
