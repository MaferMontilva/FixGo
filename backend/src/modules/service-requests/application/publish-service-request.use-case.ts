import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateNotificationService } from "../../notifications/application/create-notification.use-case";
import { SERVICE_REQUEST_STATUS } from "../domain/service-request.entity";
import {
  SERVICE_REQUESTS_REPOSITORY,
  ServiceRequestsRepository
} from "../domain/service-requests.repository";
import { DraftInput, ensureClientProfile, validateDraftInput } from "./draft-validation";

@Injectable()
export class PublishServiceRequestUseCase {
  constructor(
    @Inject(SERVICE_REQUESTS_REPOSITORY)
    private readonly serviceRequestsRepository: ServiceRequestsRepository,
    private readonly createNotificationService: CreateNotificationService
  ) {}

  async execute(id: number, clientUserId: number) {
    await ensureClientProfile(this.serviceRequestsRepository, clientUserId);

    const currentRequest = await this.serviceRequestsRepository.findOwnedServiceRequestById(id, clientUserId);

    if (!currentRequest) {
      throw new NotFoundException("Solicitud no encontrada.");
    }

    if (currentRequest.status !== SERVICE_REQUEST_STATUS.DRAFT) {
      throw new ConflictException("Solo puedes publicar solicitudes en borrador.");
    }

    await validateDraftInput(this.serviceRequestsRepository, this.toDraftInput(currentRequest));

    const publishedRequest = await this.serviceRequestsRepository.publishOwnedDraft(id, clientUserId);

    if (!publishedRequest) {
      const latestRequest = await this.serviceRequestsRepository.findOwnedServiceRequestById(id, clientUserId);

      if (!latestRequest) {
        throw new NotFoundException("Solicitud no encontrada.");
      }

      throw new ConflictException("La solicitud ya no está disponible para publicación.");
    }

    await this.notifyCompatibleProfessionals(
      publishedRequest.id,
      publishedRequest.categoryId,
      publishedRequest.title,
      publishedRequest.locationDescription
    );

    return publishedRequest;
  }

  private async notifyCompatibleProfessionals(
    serviceRequestId: number,
    categoryId: number | null,
    title: string | null,
    location: string | null
  ): Promise<void> {
    if (!categoryId) return;

    try {
      const professionalUserIds = await this.serviceRequestsRepository.findCompatibleProfessionalUserIds(categoryId, location);
      await Promise.all(
        professionalUserIds.map((userId) =>
          this.createNotificationService.execute({
            userId,
            type: "OPPORTUNITY_AVAILABLE",
            title: "Nueva oportunidad",
            body: `Hay una nueva solicitud compatible con tu perfil: "${title ?? "Solicitud"}".`,
            data: { serviceRequestId }
          })
        )
      );
    } catch {
      // La notificacion nunca debe interrumpir la publicacion.
    }
  }

  private toDraftInput(request: Awaited<ReturnType<ServiceRequestsRepository["findOwnedServiceRequestById"]>>): DraftInput {
    if (!request) {
      throw new NotFoundException("Solicitud no encontrada.");
    }

    return {
      categoryId: request.categoryId ?? 0,
      serviceId: request.serviceId,
      title: request.title,
      originalDescription: request.originalDescription,
      locationDescription: request.locationDescription ?? "",
      urgency: request.urgency,
      preferredDateFrom: request.preferredDateFrom,
      preferredDateTo: request.preferredDateTo,
      flexibleSchedule: request.flexibleSchedule,
      budgetMin: request.budgetMin,
      budgetMax: request.budgetMax,
      aiAssisted: request.aiAssisted
    };
  }
}
