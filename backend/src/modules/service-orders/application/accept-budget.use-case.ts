import { Inject, Injectable } from "@nestjs/common";
import { CreateNotificationService } from "../../notifications/application/create-notification.use-case";
import { ServiceOrderEntity } from "../domain/service-order.entity";
import { SERVICE_ORDERS_REPOSITORY, ServiceOrdersRepository } from "../domain/service-orders.repository";

@Injectable()
export class AcceptBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDERS_REPOSITORY)
    private readonly repository: ServiceOrdersRepository,
    private readonly createNotificationService: CreateNotificationService
  ) {}

  async execute(clientUserId: number, budgetId: number): Promise<ServiceOrderEntity> {
    const order = await this.repository.acceptBudget(clientUserId, budgetId);

    await this.notifyProfessional(order);
    await this.notifyRejectedProfessionals(order);

    return order;
  }

  private async notifyProfessional(order: ServiceOrderEntity): Promise<void> {
    try {
      const professionalUserId = await this.repository.findProfessionalUserId(order.professionalId);
      if (!professionalUserId) return;

      await this.createNotificationService.execute({
        userId: professionalUserId,
        type: "BUDGET_ACCEPTED",
        title: "Te seleccionaron",
        body: `Un cliente acepto tu presupuesto para "${order.requestTitle ?? "una solicitud"}".`,
        data: { serviceOrderId: order.id }
      });
    } catch {
      // La notificacion nunca debe interrumpir la aceptacion del presupuesto.
    }
  }

  // Avisa a los profesionales cuyo presupuesto no fue elegido (se marcó "No seleccionado").
  private async notifyRejectedProfessionals(order: ServiceOrderEntity): Promise<void> {
    try {
      const userIds = await this.repository.findRejectedProfessionalUserIds(order.serviceRequestId, order.acceptedBudgetId);
      for (const userId of userIds) {
        await this.createNotificationService.execute({
          userId,
          type: "BUDGET_NOT_SELECTED",
          title: "Presupuesto no seleccionado",
          body: `El cliente eligió otro presupuesto para "${order.requestTitle ?? "una solicitud"}". Gracias por participar; puedes seguir enviando ofertas a otras solicitudes.`,
          data: { serviceRequestId: order.serviceRequestId }
        });
      }
    } catch {
      // La notificacion nunca debe interrumpir la aceptacion del presupuesto.
    }
  }
}
