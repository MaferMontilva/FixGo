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
}
