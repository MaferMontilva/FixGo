import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { AcceptBudgetUseCase } from "../../application/accept-budget.use-case";
import { CompleteOrderUseCase, ConfirmOrderUseCase, StartOrderUseCase } from "../../application/advance-order.use-case";
import { GetClientOrdersUseCase } from "../../application/get-client-orders.use-case";
import { GetProfessionalOrdersUseCase } from "../../application/get-professional-orders.use-case";
import { ServiceOrderEntity } from "../../domain/service-order.entity";
import { AcceptBudgetDto } from "../dto/accept-budget.dto";

@Controller("service-orders")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceOrdersController {
  constructor(
    private readonly acceptBudgetUseCase: AcceptBudgetUseCase,
    private readonly getClientOrdersUseCase: GetClientOrdersUseCase,
    private readonly getProfessionalOrdersUseCase: GetProfessionalOrdersUseCase,
    private readonly startOrderUseCase: StartOrderUseCase,
    private readonly completeOrderUseCase: CompleteOrderUseCase,
    private readonly confirmOrderUseCase: ConfirmOrderUseCase
  ) {}

  @Post("accept-budget")
  @Roles("CLIENT")
  @HttpCode(HttpStatus.CREATED)
  async acceptBudget(@CurrentUser() user: RequestUser, @Body() dto: AcceptBudgetDto) {
    return this.toResponse(await this.acceptBudgetUseCase.execute(user.id, dto.budgetId));
  }

  @Get("client")
  @Roles("CLIENT")
  async clientOrders(@CurrentUser() user: RequestUser) {
    const orders = await this.getClientOrdersUseCase.execute(user.id);
    return orders.map((order) => this.toResponse(order));
  }

  @Get("professional")
  @Roles("PROFESSIONAL")
  async professionalOrders(@CurrentUser() user: RequestUser) {
    const orders = await this.getProfessionalOrdersUseCase.execute(user.id);
    return orders.map((order) => this.toResponse(order));
  }

  @Post(":id/start")
  @Roles("PROFESSIONAL")
  @HttpCode(HttpStatus.OK)
  async start(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    return this.toResponse(await this.startOrderUseCase.execute(id, user.id));
  }

  @Post(":id/complete")
  @Roles("PROFESSIONAL")
  @HttpCode(HttpStatus.OK)
  async complete(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    return this.toResponse(await this.completeOrderUseCase.execute(id, user.id));
  }

  @Post(":id/confirm")
  @Roles("CLIENT")
  @HttpCode(HttpStatus.OK)
  async confirm(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    return this.toResponse(await this.confirmOrderUseCase.execute(id, user.id));
  }

  private toResponse(order: ServiceOrderEntity) {
    return {
      id: order.id,
      serviceRequestId: order.serviceRequestId,
      acceptedBudgetId: order.acceptedBudgetId,
      professionalId: order.professionalId,
      status: order.status,
      startedAt: order.startedAt,
      completedAt: order.completedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      requestTitle: order.requestTitle,
      requestDescription: order.requestDescription,
      professionalName: order.professionalName,
      professionalPhone: order.professionalPhone,
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      clientAddress: order.clientAddress,
      totalPrice: order.totalPrice,
      currency: order.currency,
      hasReview: order.hasReview
    };
  }
}
