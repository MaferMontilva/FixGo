import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SERVICE_REQUEST_STATUS, ServiceRequestStatus } from "../domain/service-request.entity";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { ensureClientProfile } from "./draft-validation";

const SOFT_DELETABLE_STATUSES: readonly ServiceRequestStatus[] = [
  SERVICE_REQUEST_STATUS.CANCELLED,
  SERVICE_REQUEST_STATUS.DRAFT
];

@Injectable()
export class SoftDeleteServiceRequestUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  async execute(id: number, clientUserId: number) {
    await ensureClientProfile(this.serviceRequestsRepository, clientUserId);

    const request = await this.serviceRequestsRepository.findOwnedServiceRequestById(id, clientUserId);
    if (!request) throw new NotFoundException("Solicitud no encontrada.");
    if (!SOFT_DELETABLE_STATUSES.includes(request.status)) {
      throw new ConflictException("La solicitud no puede ocultarse en su estado actual.");
    }

    const deletedRequest = await this.serviceRequestsRepository.softDeleteOwnedRequest(id, clientUserId, SOFT_DELETABLE_STATUSES);
    if (!deletedRequest) throw new ConflictException("La solicitud ya no está disponible para ocultarse.");

    return deletedRequest;
  }
}
