import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { CreateBudgetUseCase } from "../../application/create-budget.use-case";
import { GetMyBudgetsUseCase } from "../../application/get-my-budgets.use-case";
import { GetRequestBudgetsUseCase } from "../../application/get-request-budgets.use-case";
import { BudgetEntity } from "../../domain/budget.entity";
import { CreateBudgetDto } from "../dto/create-budget.dto";

@Controller("budgets")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BudgetsController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getMyBudgetsUseCase: GetMyBudgetsUseCase,
    private readonly getRequestBudgetsUseCase: GetRequestBudgetsUseCase
  ) {}

  @Post()
  @Roles("PROFESSIONAL")
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: RequestUser, @Body() dto: CreateBudgetDto) {
    const budget = await this.createBudgetUseCase.execute({
      professionalUserId: user.id,
      serviceRequestId: dto.serviceRequestId,
      observations: dto.observations,
      estimatedDurationValue: dto.estimatedDurationValue,
      estimatedDurationUnit: dto.estimatedDurationUnit,
      availableFrom: dto.availableFrom,
      validUntil: dto.validUntil,
      items: dto.items
    });

    return this.toResponse(budget);
  }

  @Get("mine")
  @Roles("PROFESSIONAL")
  async findMine(@CurrentUser() user: RequestUser) {
    const budgets = await this.getMyBudgetsUseCase.execute(user.id);
    return budgets.map((budget) => this.toResponse(budget));
  }

  @Get("request/:requestId")
  @Roles("CLIENT")
  async findByRequest(@CurrentUser() user: RequestUser, @Param("requestId", ParseIntPipe) requestId: number) {
    const budgets = await this.getRequestBudgetsUseCase.execute(requestId, user.id);
    return budgets.map((budget) => this.toResponse(budget));
  }

  private toResponse(budget: BudgetEntity) {
    return {
      id: budget.id,
      serviceRequestId: budget.serviceRequestId,
      professionalId: budget.professionalId,
      status: budget.status,
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
      items: budget.items,
      professional: budget.professional
    };
  }
}
