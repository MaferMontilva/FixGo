import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SERVICE_REQUEST_STATUS, ServiceRequestStatus } from "../domain/service-request.entity";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { ensureClientProfile } from "./draft-validation";

export type CancelServiceRequestCommand = {
  reason?: string | null;
};

const CANCELLABLE_STATUSES: readonly ServiceRequestStatus[] = [
  SERVICE_REQUEST_STATUS.DRAFT,
  SERVICE_REQUEST_STATUS.PUBLISHED
];

@Injectable()
export class CancelServiceRequestUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  async execute(id: number, clientUserId: number, command: CancelServiceRequestCommand) {
    await ensureClientProfile(this.serviceRequestsRepository, clientUserId);

    const currentRequest = await this.serviceRequestsRepository.findOwnedServiceRequestById(id, clientUserId);

    if (!currentRequest) {
      throw new NotFoundException("Solicitud no encontrada.");
    }

    if (!CANCELLABLE_STATUSES.includes(currentRequest.status)) {
      throw new ConflictException("La solicitud no puede cancelarse en su estado actual.");
    }

    const cancelledRequest = await this.serviceRequestsRepository.cancelOwnedServiceRequest(
      id,
      clientUserId,
      CANCELLABLE_STATUSES,
      { cancellationReason: this.normalizeReason(command.reason) }
    );

    if (!cancelledRequest) {
      const latestRequest = await this.serviceRequestsRepository.findOwnedServiceRequestById(id, clientUserId);

      if (!latestRequest) {
        throw new NotFoundException("Solicitud no encontrada.");
      }

      throw new ConflictException("La solicitud ya no está disponible para cancelación.");
    }

    return cancelledRequest;
  }

  private normalizeReason(reason?: string | null) {
    const normalizedReason = reason?.trim();
    return normalizedReason ? normalizedReason : null;
  }
}
