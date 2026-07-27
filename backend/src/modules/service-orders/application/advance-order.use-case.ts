import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SERVICE_ORDER_STATUS, ServiceOrderEntity } from "../domain/service-order.entity";
import { SERVICE_ORDERS_REPOSITORY, ServiceOrdersRepository } from "../domain/service-orders.repository";

@Injectable()
export class StartOrderUseCase {
  constructor(@Inject(SERVICE_ORDERS_REPOSITORY) private readonly repository: ServiceOrdersRepository) {}

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
    return this.ensureUpdated(order);
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
  constructor(@Inject(SERVICE_ORDERS_REPOSITORY) private readonly repository: ServiceOrdersRepository) {}

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
