import { Module } from "@nestjs/common";
import { ServiceRequestsService } from "./application/service-requests.service";
import { SERVICE_REQUESTS_REPOSITORY } from "./domain/service-requests.repository";
import { PrismaServiceRequestsRepository } from "./infrastructure/prisma/prisma-service-requests.repository";
import { ServiceRequestsController } from "./presentation/http/service-requests.controller";

@Module({
  controllers: [ServiceRequestsController],
  providers: [
    ServiceRequestsService,
    {
      provide: SERVICE_REQUESTS_REPOSITORY,
      useClass: PrismaServiceRequestsRepository
    }
  ],
  exports: [ServiceRequestsService]
})
export class ServiceRequestsModule {}
