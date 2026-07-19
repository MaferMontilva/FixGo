import { Module } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma.service";
import { CategoriesService } from "./application/categories.service";
import { PrismaCategoriesRepository } from "./infrastructure/prisma/prisma-categories.repository";
import { CategoriesController } from "./presentation/http/categories.controller";

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaCategoriesRepository, PrismaService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
