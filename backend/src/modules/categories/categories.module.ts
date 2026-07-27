import { Module } from "@nestjs/common";
import { CategoriesService } from "./application/categories.service";
import { CATEGORIES_REPOSITORY } from "./domain/categories.repository";
import { PrismaCategoriesRepository } from "./infrastructure/prisma/prisma-categories.repository";
import { CategoriesController } from "./presentation/http/categories.controller";

@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: CATEGORIES_REPOSITORY,
      useClass: PrismaCategoriesRepository
    }
  ],
  exports: [CategoriesService]
})
export class CategoriesModule {}
