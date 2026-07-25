import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";

@Injectable()
export class GetClientServiceRequestDetailUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  async execute(id: number, clientUserId: number) {
    const request = await this.serviceRequestsRepository.findOwnedServiceRequestById(id, clientUserId);

    if (!request) {
      throw new NotFoundException("Solicitud no encontrada.");
    }

    return request;
  }
}
