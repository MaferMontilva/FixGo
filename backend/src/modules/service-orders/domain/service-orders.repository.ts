import { ServiceOrderEntity } from "./service-order.entity";

export const SERVICE_ORDERS_REPOSITORY = Symbol("SERVICE_ORDERS_REPOSITORY");

export abstract class ServiceOrdersRepository {
  abstract findProfessionalIdByUserId(userId: number): Promise<number | null>;
  abstract acceptBudget(clientUserId: number, budgetId: number): Promise<ServiceOrderEntity>;
  abstract findOrdersByClientUserId(clientUserId: number): Promise<ServiceOrderEntity[]>;
  abstract findOrdersByProfessionalId(professionalId: number): Promise<ServiceOrderEntity[]>;
  abstract findOrderByIdForClient(id: number, clientUserId: number): Promise<ServiceOrderEntity | null>;
  abstract findOrderByIdForProfessional(id: number, professionalId: number): Promise<ServiceOrderEntity | null>;
  abstract updateStatusByProfessional(
    id: number,
    professionalId: number,
    fromStatuses: string[],
    toStatus: string,
    timestampField: "startedAt" | "completedAt" | null,
    requestStatus: string | null
  ): Promise<ServiceOrderEntity | null>;
  abstract confirmCompletionByClient(id: number, clientUserId: number): Promise<ServiceOrderEntity | null>;
}
