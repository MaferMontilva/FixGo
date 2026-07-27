import { Module } from "@nestjs/common";
import { AdminService } from "./application/admin.service";
import { ADMIN_REPOSITORY } from "./domain/admin.repository";
import { PrismaAdminRepository } from "./infrastructure/prisma/prisma-admin.repository";
import { AdminController } from "./presentation/http/admin.controller";

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: ADMIN_REPOSITORY,
      useClass: PrismaAdminRepository
    }
  ]
})
export class AdministrationModule {}
