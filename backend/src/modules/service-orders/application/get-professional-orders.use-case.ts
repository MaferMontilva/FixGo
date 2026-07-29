import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ServiceOrderEntity } from "../domain/service-order.entity";
import { SERVICE_ORDERS_REPOSITORY, ServiceOrdersRepository } from "../domain/service-orders.repository";

@Injectable()
export class GetProfessionalOrdersUseCase {
  constructor(
    @Inject(SERVICE_ORDERS_REPOSITORY)
    private readonly repository: ServiceOrdersRepository
  ) {}

  async execute(professionalUserId: number): Promise<ServiceOrderEntity[]> {
    const professionalId = await this.repository.findProfessionalIdByUserId(professionalUserId);
    if (!professionalId) {
      throw new ForbiddenException("Completa tu perfil profesional para ver tus trabajos.");
    }
    return this.repository.findOrdersByProfessionalId(professionalId);
  }
}
