import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { ServiceOrderEntity, ServiceOrderStatus } from "../../domain/service-order.entity";
import { ServiceOrdersRepository } from "../../domain/service-orders.repository";

type OrderRecord = {
  id: number;
  serviceRequestId: number;
  acceptedBudgetId: number;
  clientUserId: number;
  professionalId: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PrismaServiceOrdersRepository implements ServiceOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfessionalIdByUserId(userId: number): Promise<number | null> {
    const profile = await this.prisma.professionalProfiles.findUnique({ where: { userId }, select: { id: true } });
    return profile?.id ?? null;
  }

  async findProfessionalUserId(professionalId: number): Promise<number | null> {
    const profile = await this.prisma.professionalProfiles.findUnique({ where: { id: professionalId }, select: { userId: true } });
    return profile?.userId ?? null;
  }

  async acceptBudget(clientUserId: number, budgetId: number): Promise<ServiceOrderEntity> {
    const budget = await this.prisma.budgets.findUnique({ where: { id: budgetId } });
    if (!budget) throw new NotFoundException("El presupuesto no existe.");

    const request = await this.prisma.serviceRequests.findUnique({ where: { id: budget.serviceRequestId } });
    if (!request || request.deletedAt) throw new NotFoundException("La solicitud no existe.");
    if (request.clientUserId !== clientUserId) throw new ForbiddenException("Esta solicitud no es tuya.");
    if (!["PUBLISHED", "RECEIVING_BUDGETS"].includes(request.status)) {
      throw new ConflictException("Esta solicitud ya no permite aceptar presupuestos.");
    }
    if (!["SENT", "VIEWED"].includes(budget.status)) {
      throw new ConflictException("Este presupuesto ya no esta disponible.");
    }

    const now = new Date().toISOString();

    const orderId = await this.prisma.$transaction(async (tx) => {
      await tx.budgets.update({
        where: { id: budget.id },
        data: { status: "ACCEPTED", acceptedAt: now, updatedAt: now }
      });

      await tx.budgets.updateMany({
        where: { serviceRequestId: budget.serviceRequestId, id: { not: budget.id }, status: { in: ["SENT", "VIEWED"] } },
        data: { status: "REJECTED", rejectedAt: now, updatedAt: now }
      });

      await tx.serviceRequests.update({
        where: { id: budget.serviceRequestId },
        data: { status: "PROFESSIONAL_SELECTED", updatedAt: now }
      });

      const order = await tx.serviceOrders.create({
        data: {
          serviceRequestId: budget.serviceRequestId,
          acceptedBudgetId: budget.id,
          clientUserId,
          professionalId: budget.professionalId,
          status: "PENDING_START",
          createdAt: now,
          updatedAt: now
        }
      });

      return order.id;
    });

    const [hydrated] = await this.hydrate([(await this.prisma.serviceOrders.findUnique({ where: { id: orderId } })) as OrderRecord]);
    return hydrated;
  }

  async findOrdersByClientUserId(clientUserId: number): Promise<ServiceOrderEntity[]> {
    const orders = await this.prisma.serviceOrders.findMany({ where: { clientUserId }, orderBy: [{ createdAt: "desc" }] });
    return this.hydrate(orders as OrderRecord[]);
  }

  async findOrdersByProfessionalId(professionalId: number): Promise<ServiceOrderEntity[]> {
    const orders = await this.prisma.serviceOrders.findMany({ where: { professionalId }, orderBy: [{ createdAt: "desc" }] });
    return this.hydrate(orders as OrderRecord[]);
  }

  async findOrderByIdForClient(id: number, clientUserId: number): Promise<ServiceOrderEntity | null> {
    const order = await this.prisma.serviceOrders.findFirst({ where: { id, clientUserId } });
    if (!order) return null;
    const [hydrated] = await this.hydrate([order as OrderRecord]);
    return hydrated;
  }

  async findOrderByIdForProfessional(id: number, professionalId: number): Promise<ServiceOrderEntity | null> {
    const order = await this.prisma.serviceOrders.findFirst({ where: { id, professionalId } });
    if (!order) return null;
    const [hydrated] = await this.hydrate([order as OrderRecord]);
    return hydrated;
  }

  async updateStatusByProfessional(
    id: number,
    professionalId: number,
    fromStatuses: string[],
    toStatus: string,
    timestampField: "startedAt" | "completedAt" | null,
    requestStatus: string | null
  ): Promise<ServiceOrderEntity | null> {
    const order = await this.prisma.serviceOrders.findFirst({ where: { id, professionalId } });
    if (!order || !fromStatuses.includes(order.status)) return null;

    const now = new Date().toISOString();
    const data: Record<string, unknown> = { status: toStatus, updatedAt: now };
    if (timestampField) data[timestampField] = now;

    await this.prisma.$transaction(async (tx) => {
      await tx.serviceOrders.update({ where: { id }, data });
      if (requestStatus) {
        await tx.serviceRequests.update({ where: { id: order.serviceRequestId }, data: { status: requestStatus, updatedAt: now } });
      }
    });

    return this.findOrderByIdForProfessional(id, professionalId);
  }

  async confirmCompletionByClient(id: number, clientUserId: number): Promise<ServiceOrderEntity | null> {
    const order = await this.prisma.serviceOrders.findFirst({ where: { id, clientUserId } });
    if (!order || order.status !== "AWAITING_CLIENT_CONFIRMATION") return null;

    const now = new Date().toISOString();
    await this.prisma.$transaction(async (tx) => {
      await tx.serviceOrders.update({ where: { id }, data: { status: "COMPLETED", completedAt: order.completedAt ?? now, updatedAt: now } });
      await tx.serviceRequests.update({ where: { id: order.serviceRequestId }, data: { status: "COMPLETED", updatedAt: now } });
    });

    return this.findOrderByIdForClient(id, clientUserId);
  }

  private async hydrate(orders: OrderRecord[]): Promise<ServiceOrderEntity[]> {
    if (orders.length === 0) return [];

    const requestIds = [...new Set(orders.map((order) => order.serviceRequestId))];
    const professionalIds = [...new Set(orders.map((order) => order.professionalId))];
    const budgetIds = [...new Set(orders.map((order) => order.acceptedBudgetId))];
    const orderIds = orders.map((order) => order.id);

    const [requests, professionals, budgets, reviews] = await Promise.all([
      this.prisma.serviceRequests.findMany({ where: { id: { in: requestIds } }, select: { id: true, title: true, finalDescription: true, originalDescription: true } }),
      this.prisma.professionalProfiles.findMany({ where: { id: { in: professionalIds } }, select: { id: true, displayName: true, businessName: true, phone: true } }),
      this.prisma.budgets.findMany({ where: { id: { in: budgetIds } }, select: { id: true, totalPrice: true, currency: true } }),
      this.prisma.reviews.findMany({ where: { serviceOrderId: { in: orderIds } }, select: { serviceOrderId: true } })
    ]);

    const requestById = new Map(requests.map((request) => [request.id, request]));
    const professionalById = new Map(professionals.map((professional) => [professional.id, professional]));
    const budgetById = new Map(budgets.map((budget) => [budget.id, budget]));
    const reviewedOrderIds = new Set(reviews.map((review) => review.serviceOrderId));

    return orders.map((order) => {
      const request = requestById.get(order.serviceRequestId);
      const professional = professionalById.get(order.professionalId);
      const budget = budgetById.get(order.acceptedBudgetId);
      return {
        id: order.id,
        serviceRequestId: order.serviceRequestId,
        acceptedBudgetId: order.acceptedBudgetId,
        clientUserId: order.clientUserId,
        professionalId: order.professionalId,
        status: order.status as ServiceOrderStatus,
        startedAt: order.startedAt,
        completedAt: order.completedAt,
        cancellationReason: order.cancellationReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        requestTitle: request?.title ?? null,
        requestDescription: request?.finalDescription ?? request?.originalDescription ?? null,
        professionalName: professional?.businessName || professional?.displayName || null,
        professionalPhone: professional?.phone ?? null,
        totalPrice: budget?.totalPrice ?? null,
        currency: budget?.currency ?? null,
        hasReview: reviewedOrderIds.has(order.id)
      };
    });
  }
}
