import { Inject, Injectable } from "@nestjs/common";
import { ServiceOrderEntity } from "../domain/service-order.entity";
import { SERVICE_ORDERS_REPOSITORY, ServiceOrdersRepository } from "../domain/service-orders.repository";

@Injectable()
export class AcceptBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDERS_REPOSITORY)
    private readonly repository: ServiceOrdersRepository
  ) {}

  execute(clientUserId: number, budgetId: number): Promise<ServiceOrderEntity> {
    return this.repository.acceptBudget(clientUserId, budgetId);
  }
}
