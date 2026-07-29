import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateNotificationService } from "../../notifications/application/create-notification.use-case";
import { SERVICE_ORDER_STATUS, ServiceOrderEntity } from "../domain/service-order.entity";
import { SERVICE_ORDERS_REPOSITORY, ServiceOrdersRepository } from "../domain/service-orders.repository";

@Injectable()
export class StartOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDERS_REPOSITORY) private readonly repository: ServiceOrdersRepository,
    private readonly createNotificationService: CreateNotificationService
  ) {}

  async execute(orderId: number, professionalUserId: number): Promise<ServiceOrderEntity> {
    const professionalId = await this.ensureProfessional(professionalUserId);
    const order = await this.repository.updateStatusByProfessional(
      orderId,
      professionalId,
      [SERVICE_ORDER_STATUS.PENDING_START, SERVICE_ORDER_STATUS.SCHEDULED],
      SERVICE_ORDER_STATUS.IN_PROGRESS,
      "startedAt",
      "IN_PROGRESS"
    );
    const updated = this.ensureUpdated(order);

    // Avisamos al cliente de que su solicitud ya esta en progreso.
    try {
      await this.createNotificationService.execute({
        userId: updated.clientUserId,
        type: "WORK_STARTED",
        title: "Trabajo en progreso",
        body: `El profesional ha comenzado "${updated.requestTitle ?? "tu servicio"}". Cuando termine, deberás confirmarlo y dejar tu valoración.`,
        data: { serviceOrderId: updated.id, serviceRequestId: updated.serviceRequestId }
      });
    } catch {
      // La notificacion nunca debe impedir iniciar el trabajo.
    }

    return updated;
  }

  private async ensureProfessional(userId: number): Promise<number> {
    const professionalId = await this.repository.findProfessionalIdByUserId(userId);
    if (!professionalId) throw new ForbiddenException("Completa tu perfil profesional.");
    return professionalId;
  }

  private ensureUpdated(order: ServiceOrderEntity | null): ServiceOrderEntity {
    if (!order) throw new ConflictException("El trabajo no se puede iniciar en su estado actual.");
    return order;
  }
}

@Injectable()
export class CompleteOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDERS_REPOSITORY) private readonly repository: ServiceOrdersRepository,
    private readonly createNotificationService: CreateNotificationService
  ) {}

  async execute(orderId: number, professionalUserId: number): Promise<ServiceOrderEntity> {
    const professionalId = await this.repository.findProfessionalIdByUserId(professionalUserId);
    if (!professionalId) throw new ForbiddenException("Completa tu perfil profesional.");
    const order = await this.repository.updateStatusByProfessional(
      orderId,
      professionalId,
      [SERVICE_ORDER_STATUS.IN_PROGRESS, SERVICE_ORDER_STATUS.PAUSED],
      SERVICE_ORDER_STATUS.AWAITING_CLIENT_CONFIRMATION,
      "completedAt",
      null
    );
    if (!order) throw new ConflictException("El trabajo no se puede completar en su estado actual.");

    // Al terminar el profesional, se avisa al cliente para que confirme y valore.
    try {
      await this.createNotificationService.execute({
        userId: order.clientUserId,
        type: "WORK_COMPLETED",
        title: "Trabajo terminado",
        body: `El profesional terminó "${order.requestTitle ?? "tu servicio"}". Confírmalo y déjale tu valoración.`,
        data: { serviceOrderId: order.id, serviceRequestId: order.serviceRequestId }
      });
    } catch {
      // La notificacion nunca debe interrumpir el cierre del trabajo.
    }

    return order;
  }
}

@Injectable()
export class ConfirmOrderUseCase {
  constructor(@Inject(SERVICE_ORDERS_REPOSITORY) private readonly repository: ServiceOrdersRepository) {}

  async execute(orderId: number, clientUserId: number): Promise<ServiceOrderEntity> {
    const order = await this.repository.confirmCompletionByClient(orderId, clientUserId);
    if (!order) {
      throw new NotFoundException("No encontramos un trabajo pendiente de tu confirmacion.");
    }
    return order;
  }
}
