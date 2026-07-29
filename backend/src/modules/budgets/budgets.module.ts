import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { CreateBudgetUseCase } from "./application/create-budget.use-case";
import { GetMyBudgetsUseCase } from "./application/get-my-budgets.use-case";
import { GetRequestBudgetsUseCase } from "./application/get-request-budgets.use-case";
import { BUDGETS_REPOSITORY } from "./domain/budgets.repository";
import { PrismaBudgetsRepository } from "./infrastructure/prisma/prisma-budgets.repository";
import { BudgetsController } from "./presentation/http/budgets.controller";

@Module({
  imports: [NotificationsModule],
  controllers: [BudgetsController],
  providers: [
    CreateBudgetUseCase,
    GetMyBudgetsUseCase,
    GetRequestBudgetsUseCase,
    {
      provide: BUDGETS_REPOSITORY,
      useClass: PrismaBudgetsRepository
    }
  ],
  exports: []
})
export class BudgetsModule {}
