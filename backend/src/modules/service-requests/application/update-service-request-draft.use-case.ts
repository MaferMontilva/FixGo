import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SERVICE_REQUEST_STATUS } from "../domain/service-request.entity";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { combineDraft, ensureClientProfile, DraftInput, validateDraftInput } from "./draft-validation";

export type UpdateServiceRequestDraftCommand = Partial<DraftInput>;

@Injectable()
export class UpdateServiceRequestDraftUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository
  ) {}

  async execute(id: number, clientUserId: number, command: UpdateServiceRequestDraftCommand) {
    await ensureClientProfile(this.serviceRequestsRepository, clientUserId);

    const currentDraft = await this.serviceRequestsRepository.findOwnedDraftById(id, clientUserId);

    if (!currentDraft) {
      throw new NotFoundException("Borrador de solicitud no encontrado.");
    }

    if (currentDraft.status !== SERVICE_REQUEST_STATUS.DRAFT) {
      throw new ConflictException("Solo puedes editar solicitudes en borrador.");
    }

    const combined = combineDraft(currentDraft, command);
    const data = await validateDraftInput(this.serviceRequestsRepository, combined);
    const updatedDraft = await this.serviceRequestsRepository.updateOwnedDraft(id, clientUserId, data);

    if (!updatedDraft) {
      throw new ConflictException("El borrador ya no está disponible para edición.");
    }

    return updatedDraft;
  }
}
