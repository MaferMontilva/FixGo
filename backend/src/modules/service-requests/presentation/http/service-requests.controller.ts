import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../../../auth/presentation/current-user";
import { JwtAuthGuard } from "../../../auth/presentation/jwt-auth.guard";
import { Roles } from "../../../auth/presentation/roles.decorator";
import { RolesGuard } from "../../../auth/presentation/roles.guard";
import { CreateServiceRequestDraftUseCase } from "../../application/create-service-request-draft.use-case";
import { GetClientServiceRequestDraftDetailUseCase } from "../../application/get-client-service-request-draft-detail.use-case";
import { GetClientServiceRequestDraftsUseCase } from "../../application/get-client-service-request-drafts.use-case";
import { UpdateServiceRequestDraftUseCase } from "../../application/update-service-request-draft.use-case";
import { ServiceRequestEntity } from "../../domain/service-request.entity";
import { CreateServiceRequestDto } from "../dto/create-service-request.dto";
import { UpdateServiceRequestDraftDto } from "../dto/update-service-request-draft.dto";

@Controller("service-requests")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("CLIENT")
export class ServiceRequestsController {
  constructor(
    private readonly createServiceRequestDraftUseCase: CreateServiceRequestDraftUseCase,
    private readonly getClientServiceRequestDraftsUseCase: GetClientServiceRequestDraftsUseCase,
    private readonly getClientServiceRequestDraftDetailUseCase: GetClientServiceRequestDraftDetailUseCase,
    private readonly updateServiceRequestDraftUseCase: UpdateServiceRequestDraftUseCase
  ) {}

  @Post("drafts")
  async createDraft(@CurrentUser() user: RequestUser, @Body() dto: CreateServiceRequestDto) {
    const draft = await this.createServiceRequestDraftUseCase.execute({
      ...dto,
      clientUserId: user.id
    });

    return this.toDraftResponse(draft);
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
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt
    };
  }
}
