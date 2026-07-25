import { Module } from "@nestjs/common";
import { CancelServiceRequestUseCase } from "./application/cancel-service-request.use-case";
import { CreateServiceRequestDraftUseCase } from "./application/create-service-request-draft.use-case";
import { GetClientServiceRequestDraftDetailUseCase } from "./application/get-client-service-request-draft-detail.use-case";
import { GetClientServiceRequestDraftsUseCase } from "./application/get-client-service-request-drafts.use-case";
import { PublishServiceRequestUseCase } from "./application/publish-service-request.use-case";
import { ServiceRequestsService } from "./application/service-requests.service";
import { UpdateServiceRequestDraftUseCase } from "./application/update-service-request-draft.use-case";
import { SERVICE_REQUESTS_REPOSITORY } from "./domain/service-requests.repository";
import { PrismaServiceRequestsRepository } from "./infrastructure/prisma/prisma-service-requests.repository";
import { ServiceRequestsController } from "./presentation/http/service-requests.controller";

@Module({
  controllers: [ServiceRequestsController],
  providers: [
    ServiceRequestsService,
    CreateServiceRequestDraftUseCase,
    UpdateServiceRequestDraftUseCase,
    GetClientServiceRequestDraftsUseCase,
    GetClientServiceRequestDraftDetailUseCase,
    PublishServiceRequestUseCase,
    CancelServiceRequestUseCase,
    {
      provide: SERVICE_REQUESTS_REPOSITORY,
      useClass: PrismaServiceRequestsRepository
    }
  ],
  exports: [ServiceRequestsService]
})
export class ServiceRequestsModule {}
