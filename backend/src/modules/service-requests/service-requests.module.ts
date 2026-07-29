import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { CancelServiceRequestUseCase } from "./application/cancel-service-request.use-case";
import { CreateServiceRequestDraftUseCase } from "./application/create-service-request-draft.use-case";
import { DuplicateCancelledServiceRequestAsDraftUseCase } from "./application/duplicate-cancelled-service-request-as-draft.use-case";
import { GetClientServiceRequestDetailUseCase } from "./application/get-client-service-request-detail.use-case";
import { GetClientServiceRequestDraftDetailUseCase } from "./application/get-client-service-request-draft-detail.use-case";
import { GetClientServiceRequestDraftsUseCase } from "./application/get-client-service-request-drafts.use-case";
import { GetClientServiceRequestsUseCase } from "./application/get-client-service-requests.use-case";
import { PublishServiceRequestUseCase } from "./application/publish-service-request.use-case";
import { ServiceRequestsService } from "./application/service-requests.service";
import { SoftDeleteServiceRequestUseCase } from "./application/soft-delete-service-request.use-case";
import { UpdateServiceRequestDraftUseCase } from "./application/update-service-request-draft.use-case";
import { SERVICE_REQUESTS_REPOSITORY } from "./domain/service-requests.repository";
import { PrismaServiceRequestsRepository } from "./infrastructure/prisma/prisma-service-requests.repository";
import { ServiceRequestsController } from "./presentation/http/service-requests.controller";

@Module({
  imports: [NotificationsModule],
  controllers: [ServiceRequestsController],
  providers: [
    ServiceRequestsService,
    CreateServiceRequestDraftUseCase,
    UpdateServiceRequestDraftUseCase,
    GetClientServiceRequestsUseCase,
    GetClientServiceRequestDetailUseCase,
    GetClientServiceRequestDraftsUseCase,
    GetClientServiceRequestDraftDetailUseCase,
    PublishServiceRequestUseCase,
    CancelServiceRequestUseCase,
    DuplicateCancelledServiceRequestAsDraftUseCase,
    SoftDeleteServiceRequestUseCase,
    {
      provide: SERVICE_REQUESTS_REPOSITORY,
      useClass: PrismaServiceRequestsRepository
    }
  ],
  exports: [ServiceRequestsService]
})
export class ServiceRequestsModule {}
