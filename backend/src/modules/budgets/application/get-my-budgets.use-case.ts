import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { BudgetEntity } from "../domain/budget.entity";
import { BUDGETS_REPOSITORY, BudgetsRepository } from "../domain/budgets.repository";

@Injectable()
export class GetMyBudgetsUseCase {
  constructor(
    @Inject(BUDGETS_REPOSITORY)
    private readonly budgetsRepository: BudgetsRepository
  ) {}

  async execute(professionalUserId: number): Promise<BudgetEntity[]> {
    const professionalId = await this.budgetsRepository.findProfessionalIdByUserId(professionalUserId);

    if (!professionalId) {
      throw new ForbiddenException("Completa tu perfil profesional para ver tus presupuestos.");
    }

    return this.budgetsRepository.findBudgetsByProfessionalId(professionalId);
  }
}
