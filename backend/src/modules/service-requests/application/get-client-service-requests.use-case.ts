import { Inject, Injectable } from "@nestjs/common";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";

@Injectable()
export class GetClientServiceRequestsUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  execute(clientUserId: number) {
    return this.serviceRequestsRepository.findAllOwnedServiceRequests(clientUserId);
  }
}
