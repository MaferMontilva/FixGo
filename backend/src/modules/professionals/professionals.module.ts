import { Module } from "@nestjs/common";
import { ProfessionalsService } from "./application/professionals.service";
import { PROFESSIONALS_REPOSITORY } from "./domain/professionals.repository";
import { PrismaProfessionalsRepository } from "./infrastructure/prisma/prisma-professionals.repository";
import { ProfessionalsController } from "./presentation/http/professionals.controller";

@Module({
  controllers: [ProfessionalsController],
  providers: [
    ProfessionalsService,
    {
      provide: PROFESSIONALS_REPOSITORY,
      useClass: PrismaProfessionalsRepository
    }
  ],
  exports: [ProfessionalsService]
})
export class ProfessionalsModule {}
