import { Module } from "@nestjs/common";
import { GetServiceBySlugUseCase } from "./application/get-service-by-slug.use-case";
import { ListServicesUseCase } from "./application/list-services.use-case";
import { SERVICES_REPOSITORY } from "./domain/services.repository";
import { PrismaServicesRepository } from "./infrastructure/prisma/prisma-services.repository";
import { ServicesController } from "./presentation/http/services.controller";

@Module({
  controllers: [ServicesController],
  providers: [
    ListServicesUseCase,
    GetServiceBySlugUseCase,
    {
      provide: SERVICES_REPOSITORY,
      useClass: PrismaServicesRepository
    }
  ],
  exports: [ListServicesUseCase, GetServiceBySlugUseCase]
})
export class ServicesModule {}
