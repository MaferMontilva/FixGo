import { Inject, Injectable } from "@nestjs/common";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { ensureClientProfile } from "./draft-validation";

@Injectable()
export class GetClientServiceRequestDraftsUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  async execute(clientUserId: number) {
    await ensureClientProfile(this.serviceRequestsRepository, clientUserId);

    return this.serviceRequestsRepository.findDraftsByClientUserId(clientUserId);
  }
}
