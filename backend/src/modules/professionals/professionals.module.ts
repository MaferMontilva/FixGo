import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma.service";
import { ProfessionalsService } from "./application/professionals.service";
import { PrismaProfessionalsRepository } from "./infrastructure/prisma/prisma-professionals.repository";
import { ProfessionalsController } from "./presentation/http/professionals.controller";

@Module({
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService, PrismaProfessionalsRepository, PrismaService],
  exports: [ProfessionalsService]
})
export class ProfessionalsModule {}
