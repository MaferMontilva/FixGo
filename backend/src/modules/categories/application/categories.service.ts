import { Inject, Injectable } from "@nestjs/common";
import { CATEGORIES_REPOSITORY, CategoriesRepository } from "../domain/categories.repository";
import { CategoryEntity } from "../domain/category.entity";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: CategoriesRepository
  ) {}

  findAll(): Promise<CategoryEntity[]> {
    return this.categoriesRepository.findAllActive();
  }
}
