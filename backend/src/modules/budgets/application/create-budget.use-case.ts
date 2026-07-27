import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BudgetEntity } from "../domain/budget.entity";
import { BUDGETS_REPOSITORY, BudgetsRepository, CreateBudgetItemData } from "../domain/budgets.repository";

export type CreateBudgetCommand = {
  professionalUserId: number;
  serviceRequestId: number;
  observations?: string | null;
  estimatedDurationValue?: number | null;
  estimatedDurationUnit?: string | null;
  availableFrom?: string | null;
  validUntil?: string | null;
  items: CreateBudgetItemData[];
};

const BUDGETABLE_REQUEST_STATUSES = ["PUBLISHED", "RECEIVING_BUDGETS"];

@Injectable()
export class CreateBudgetUseCase {
  constructor(
    @Inject(BUDGETS_REPOSITORY)
    private readonly budgetsRepository: BudgetsRepository
  ) {}

  async execute(command: CreateBudgetCommand): Promise<BudgetEntity> {
    const professionalId = await this.budgetsRepository.findProfessionalIdByUserId(command.professionalUserId);

    if (!professionalId) {
      throw new ForbiddenException("Completa tu perfil profesional antes de enviar presupuestos.");
    }

    const request = await this.budgetsRepository.findServiceRequestForBudget(command.serviceRequestId);

    if (!request || request.deletedAt) {
      throw new NotFoundException("La solicitud no existe o ya no esta disponible.");
    }

    if (!BUDGETABLE_REQUEST_STATUSES.includes(request.status)) {
      throw new ConflictException("La solicitud ya no admite nuevos presupuestos.");
    }

    if (!request.categoryId || !(await this.budgetsRepository.professionalHasCategory(professionalId, request.categoryId))) {
      throw new ForbiddenException("Esta solicitud no corresponde a tus categorias de servicio.");
    }

    const existing = await this.budgetsRepository.findExistingBudget(command.serviceRequestId, professionalId);

    if (existing) {
      throw new ConflictException("Ya enviaste un presupuesto para esta solicitud.");
    }

    const items = command.items.map((item) => ({
      description: item.description.trim(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemType: item.itemType?.trim() || "SERVICE",
      total: this.round(item.quantity * item.unitPrice)
    }));

    const subtotal = this.round(items.reduce((sum, item) => sum + item.total, 0));

    return this.budgetsRepository.createBudget({
      serviceRequestId: command.serviceRequestId,
      professionalId,
      currency: "EUR",
      subtotal,
      taxes: 0,
      platformFee: 0,
      totalPrice: subtotal,
      estimatedDurationValue: command.estimatedDurationValue ?? null,
      estimatedDurationUnit: command.estimatedDurationUnit ?? null,
      availableFrom: command.availableFrom ?? null,
      validUntil: command.validUntil ?? null,
      observations: command.observations?.trim() || null,
      items
    });
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
