import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { AcceptBudgetUseCase } from "./application/accept-budget.use-case";
import { CompleteOrderUseCase, ConfirmOrderUseCase, StartOrderUseCase } from "./application/advance-order.use-case";
import { GetClientOrdersUseCase } from "./application/get-client-orders.use-case";
import { GetProfessionalOrdersUseCase } from "./application/get-professional-orders.use-case";
import { SERVICE_ORDERS_REPOSITORY } from "./domain/service-orders.repository";
import { PrismaServiceOrdersRepository } from "./infrastructure/prisma/prisma-service-orders.repository";
import { ServiceOrdersController } from "./presentation/http/service-orders.controller";

@Module({
  imports: [NotificationsModule],
  controllers: [ServiceOrdersController],
  providers: [
    AcceptBudgetUseCase,
    GetClientOrdersUseCase,
    GetProfessionalOrdersUseCase,
    StartOrderUseCase,
    CompleteOrderUseCase,
    ConfirmOrderUseCase,
    {
      provide: SERVICE_ORDERS_REPOSITORY,
      useClass: PrismaServiceOrdersRepository
    }
  ]
})
export class ServiceOrdersModule {}
