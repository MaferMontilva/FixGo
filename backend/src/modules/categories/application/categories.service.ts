import { Injectable } from "@nestjs/common";
import { CategoryEntity } from "../domain/category.entity";
import { PrismaCategoriesRepository } from "../infrastructure/prisma/prisma-categories.repository";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: PrismaCategoriesRepository) {}

  findAll(): Promise<CategoryEntity[]> {
    return this.categoriesRepository.findAllActive();
  }
}
