import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { BudgetEntity, BudgetItemEntity, BudgetStatus } from "../../domain/budget.entity";
import { BudgetsRepository, CreateBudgetData, ServiceRequestForBudget } from "../../domain/budgets.repository";

type BudgetRecord = {
  id: number;
  serviceRequestId: number;
  professionalId: number;
  status: string;
  currency: string;
  subtotal: number;
  taxes: number;
  platformFee: number;
  totalPrice: number;
  estimatedDurationValue: number | null;
  estimatedDurationUnit: string | null;
  availableFrom: string | null;
  validUntil: string | null;
  observations: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PrismaBudgetsRepository implements BudgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfessionalIdByUserId(userId: number): Promise<number | null> {
    const profile = await this.prisma.professionalProfiles.findUnique({ where: { userId }, select: { id: true } });
    return profile?.id ?? null;
  }

  async findServiceRequestForBudget(serviceRequestId: number): Promise<ServiceRequestForBudget | null> {
    const request = await this.prisma.serviceRequests.findUnique({
      where: { id: serviceRequestId },
      select: { id: true, clientUserId: true, categoryId: true, status: true, title: true, deletedAt: true }
    });

    return request ?? null;
  }

  async professionalHasCategory(professionalId: number, categoryId: number): Promise<boolean> {
    const link = await this.prisma.professionalCategories.findFirst({
      where: { professionalId, categoryId },
      select: { professionalId: true }
    });

    return Boolean(link);
  }

  async findExistingBudget(serviceRequestId: number, professionalId: number): Promise<BudgetEntity | null> {
    const budget = await this.prisma.budgets.findUnique({
      where: { serviceRequestId_professionalId: { serviceRequestId, professionalId } }
    });

    if (!budget) return null;

    return this.hydrate([budget as BudgetRecord]).then((list) => list[0] ?? null);
  }

  async createBudget(data: CreateBudgetData): Promise<BudgetEntity> {
    const now = new Date().toISOString();

    const budget = await this.prisma.$transaction(async (tx) => {
      const created = await tx.budgets.create({
        data: {
          serviceRequestId: data.serviceRequestId,
          professionalId: data.professionalId,
          status: "SENT",
          currency: data.currency,
          subtotal: data.subtotal,
          taxes: data.taxes,
          platformFee: data.platformFee,
          totalPrice: data.totalPrice,
          estimatedDurationValue: data.estimatedDurationValue ?? null,
          estimatedDurationUnit: data.estimatedDurationUnit ?? null,
          availableFrom: data.availableFrom ?? null,
          validUntil: data.validUntil ?? null,
          observations: data.observations ?? null,
          sentAt: now,
          createdAt: now,
          updatedAt: now
        }
      });

      await Promise.all(
        data.items.map((item, index) =>
          tx.budgetItems.create({
            data: {
              budgetId: created.id,
              itemType: item.itemType ?? "SERVICE",
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              sortOrder: index,
              createdAt: now
            }
          })
        )
      );

      await tx.serviceRequests.updateMany({
        where: { id: data.serviceRequestId, status: "PUBLISHED" },
        data: { status: "RECEIVING_BUDGETS", updatedAt: now }
      });

      return created;
    });

    const [hydrated] = await this.hydrate([budget as BudgetRecord]);
    return hydrated;
  }

  async findBudgetsByProfessionalId(professionalId: number): Promise<BudgetEntity[]> {
    const budgets = await this.prisma.budgets.findMany({
      where: { professionalId },
      orderBy: [{ createdAt: "desc" }]
    });

    return this.hydrate(budgets as BudgetRecord[]);
  }

  async findBudgetsByServiceRequestId(serviceRequestId: number): Promise<BudgetEntity[]> {
    const budgets = await this.prisma.budgets.findMany({
      where: { serviceRequestId },
      orderBy: [{ totalPrice: "asc" }, { createdAt: "asc" }]
    });

    return this.hydrate(budgets as BudgetRecord[]);
  }

  private async hydrate(budgets: BudgetRecord[]): Promise<BudgetEntity[]> {
    if (budgets.length === 0) return [];

    const budgetIds = budgets.map((budget) => budget.id);
    const professionalIds = [...new Set(budgets.map((budget) => budget.professionalId))];

    const [items, professionals] = await Promise.all([
      this.prisma.budgetItems.findMany({ where: { budgetId: { in: budgetIds } }, orderBy: [{ sortOrder: "asc" }] }),
      this.prisma.professionalProfiles.findMany({
        where: { id: { in: professionalIds } },
        select: { id: true, displayName: true, businessName: true, ratingAverage: true, ratingsCount: true }
      })
    ]);

    const professionalsById = new Map(professionals.map((professional) => [professional.id, professional]));

    return budgets.map((budget) => {
      const professional = professionalsById.get(budget.professionalId) ?? null;

      const budgetItems: BudgetItemEntity[] = items
        .filter((item) => item.budgetId === budget.id)
        .map((item) => ({
          id: item.id,
          budgetId: item.budgetId,
          itemType: item.itemType,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          sortOrder: item.sortOrder
        }));

      return {
        id: budget.id,
        serviceRequestId: budget.serviceRequestId,
        professionalId: budget.professionalId,
        status: budget.status as BudgetStatus,
        currency: budget.currency,
        subtotal: budget.subtotal,
        taxes: budget.taxes,
        platformFee: budget.platformFee,
        totalPrice: budget.totalPrice,
        estimatedDurationValue: budget.estimatedDurationValue,
        estimatedDurationUnit: budget.estimatedDurationUnit,
        availableFrom: budget.availableFrom,
        validUntil: budget.validUntil,
        observations: budget.observations,
        sentAt: budget.sentAt,
        acceptedAt: budget.acceptedAt,
        rejectedAt: budget.rejectedAt,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
        items: budgetItems,
        professional: professional
          ? {
              id: professional.id,
              displayName: professional.displayName,
              businessName: professional.businessName,
              ratingAverage: professional.ratingAverage,
              ratingsCount: professional.ratingsCount
            }
          : null
      };
    });
  }
}
