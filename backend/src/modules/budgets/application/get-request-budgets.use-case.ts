import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BudgetEntity } from "../domain/budget.entity";
import { BUDGETS_REPOSITORY, BudgetsRepository } from "../domain/budgets.repository";

@Injectable()
export class GetRequestBudgetsUseCase {
  constructor(
    @Inject(BUDGETS_REPOSITORY)
    private readonly budgetsRepository: BudgetsRepository
  ) {}

  async execute(serviceRequestId: number, clientUserId: number): Promise<BudgetEntity[]> {
    const request = await this.budgetsRepository.findServiceRequestForBudget(serviceRequestId);

    if (!request || request.deletedAt) {
      throw new NotFoundException("La solicitud no existe.");
    }

    if (request.clientUserId !== clientUserId) {
      throw new ForbiddenException("No puedes ver los presupuestos de esta solicitud.");
    }

    return this.budgetsRepository.findBudgetsByServiceRequestId(serviceRequestId);
  }
}
