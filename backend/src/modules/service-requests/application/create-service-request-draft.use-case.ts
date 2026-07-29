import { Inject, Injectable } from "@nestjs/common";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { CreateServiceRequestCommand } from "./create-service-request.command";
import { ensureClientProfile, validateDraftInput } from "./draft-validation";

@Injectable()
export class CreateServiceRequestDraftUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  async execute(command: CreateServiceRequestCommand) {
    await ensureClientProfile(this.serviceRequestsRepository, command.clientUserId);
    const data = await validateDraftInput(this.serviceRequestsRepository, command);

    return this.serviceRequestsRepository.createDraft({
      ...data,
      clientUserId: command.clientUserId
    });
  }
}
