import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma.service";
import { ServiceRequestsService } from "./application/service-requests.service";
import { PrismaServiceRequestsRepository } from "./infrastructure/prisma/prisma-service-requests.repository";
import { ServiceRequestsController } from "./presentation/http/service-requests.controller";

@Module({
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService, PrismaServiceRequestsRepository, PrismaService],
  exports: [ServiceRequestsService]
})
export class ServiceRequestsModule {}
