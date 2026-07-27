import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { CancelServiceRequestUseCase } from "../../application/cancel-service-request.use-case";
import { CreateServiceRequestDraftUseCase } from "../../application/create-service-request-draft.use-case";
import { DuplicateCancelledServiceRequestAsDraftUseCase } from "../../application/duplicate-cancelled-service-request-as-draft.use-case";
import { GetClientServiceRequestDetailUseCase } from "../../application/get-client-service-request-detail.use-case";
import { GetClientServiceRequestDraftDetailUseCase } from "../../application/get-client-service-request-draft-detail.use-case";
import { GetClientServiceRequestDraftsUseCase } from "../../application/get-client-service-request-drafts.use-case";
import { GetClientServiceRequestsUseCase } from "../../application/get-client-service-requests.use-case";
import { PublishServiceRequestUseCase } from "../../application/publish-service-request.use-case";
import { SoftDeleteServiceRequestUseCase } from "../../application/soft-delete-service-request.use-case";
import { UpdateServiceRequestDraftUseCase } from "../../application/update-service-request-draft.use-case";
import { ServiceRequestEntity } from "../../domain/service-request.entity";
import { CancelServiceRequestDto } from "../dto/cancel-service-request.dto";
import { CreateServiceRequestDto } from "../dto/create-service-request.dto";
import { UpdateServiceRequestDraftDto } from "../dto/update-service-request-draft.dto";

@Controller("service-requests")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("CLIENT")
export class ServiceRequestsController {
  constructor(
    private readonly createServiceRequestDraftUseCase: CreateServiceRequestDraftUseCase,
    private readonly getClientServiceRequestsUseCase: GetClientServiceRequestsUseCase,
    private readonly getClientServiceRequestDetailUseCase: GetClientServiceRequestDetailUseCase,
    private readonly getClientServiceRequestDraftsUseCase: GetClientServiceRequestDraftsUseCase,
    private readonly getClientServiceRequestDraftDetailUseCase: GetClientServiceRequestDraftDetailUseCase,
    private readonly updateServiceRequestDraftUseCase: UpdateServiceRequestDraftUseCase,
    private readonly publishServiceRequestUseCase: PublishServiceRequestUseCase,
    private readonly cancelServiceRequestUseCase: CancelServiceRequestUseCase,
    private readonly duplicateCancelledServiceRequestAsDraftUseCase: DuplicateCancelledServiceRequestAsDraftUseCase,
    private readonly softDeleteServiceRequestUseCase: SoftDeleteServiceRequestUseCase
  ) {}

  @Post("drafts")
  async createDraft(@CurrentUser() user: RequestUser, @Body() dto: CreateServiceRequestDto) {
    const draft = await this.createServiceRequestDraftUseCase.execute({
      ...dto,
      clientUserId: user.id
    });

    return this.toDraftResponse(draft);
  }

  @Get("mine")
  async findMine(@CurrentUser() user: RequestUser) {
    const requests = await this.getClientServiceRequestsUseCase.execute(user.id);

    return requests.map((request) => this.toServiceRequestResponse(request));
  }

  @Get("mine/:id")
  async findMineById(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    const request = await this.getClientServiceRequestDetailUseCase.execute(id, user.id);

    return this.toServiceRequestResponse(request);
  }

  @Get("drafts")
  async findMyDrafts(@CurrentUser() user: RequestUser) {
    const drafts = await this.getClientServiceRequestDraftsUseCase.execute(user.id);

    return drafts.map((draft) => this.toDraftResponse(draft));
  }

  @Get("drafts/:id")
  async findMyDraft(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    const draft = await this.getClientServiceRequestDraftDetailUseCase.execute(id, user.id);

    return this.toDraftResponse(draft);
  }

  @Patch("drafts/:id")
  async updateDraft(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateServiceRequestDraftDto
  ) {
    const draft = await this.updateServiceRequestDraftUseCase.execute(id, user.id, dto);

    return this.toDraftResponse(draft);
  }

  @Post("drafts/:id/publish")
  @HttpCode(HttpStatus.OK)
  async publishDraft(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    const request = await this.publishServiceRequestUseCase.execute(id, user.id);

    return this.toServiceRequestResponse(request);
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  async cancelRequest(
    @CurrentUser() user: RequestUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CancelServiceRequestDto
  ) {
    const request = await this.cancelServiceRequestUseCase.execute(id, user.id, dto);

    return this.toServiceRequestResponse(request);
  }

  @Post(":id/duplicate-as-draft")
  @HttpCode(HttpStatus.CREATED)
  async duplicateCancelledAsDraft(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    const draft = await this.duplicateCancelledServiceRequestAsDraftUseCase.execute(id, user.id);

    return this.toDraftResponse(draft);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async softDeleteRequest(@CurrentUser() user: RequestUser, @Param("id", ParseIntPipe) id: number) {
    const request = await this.softDeleteServiceRequestUseCase.execute(id, user.id);

    return this.toServiceRequestResponse(request);
  }

  private toDraftResponse(draft: ServiceRequestEntity) {
    return {
      id: draft.id,
      categoryId: draft.categoryId,
      serviceId: draft.serviceId,
      title: draft.title,
      originalDescription: draft.originalDescription,
      locationDescription: draft.locationDescription,
      urgency: draft.urgency,
      preferredDateFrom: draft.preferredDateFrom,
      preferredDateTo: draft.preferredDateTo,
      flexibleSchedule: draft.flexibleSchedule,
      budgetMin: draft.budgetMin,
      budgetMax: draft.budgetMax,
      aiAssisted: draft.aiAssisted,
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt
    };
  }

  private toServiceRequestResponse(request: ServiceRequestEntity) {
    return {
      id: request.id,
      categoryId: request.categoryId,
      serviceId: request.serviceId,
      title: request.title,
      originalDescription: request.originalDescription,
      locationDescription: request.locationDescription,
      urgency: request.urgency,
      preferredDateFrom: request.preferredDateFrom,
      preferredDateTo: request.preferredDateTo,
      flexibleSchedule: request.flexibleSchedule,
      budgetMin: request.budgetMin,
      budgetMax: request.budgetMax,
      aiAssisted: request.aiAssisted,
      status: request.status,
      publishedAt: request.publishedAt,
      cancelledAt: request.cancelledAt,
      cancellationReason: request.cancellationReason,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
  }
}
