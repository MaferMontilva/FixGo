import { Inject, Injectable } from "@nestjs/common";
import { CATEGORIES_REPOSITORY, CategoriesRepository } from "../domain/categories.repository";
import { CategoryEntity, MARKETPLACE_CATEGORY_CODES } from "../domain/category.entity";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: CategoriesRepository
  ) {}

  findAll(): Promise<CategoryEntity[]> {
    return this.categoriesRepository.findAllActive();
  }

  async findMarketplace(): Promise<CategoryEntity[]> {
    const categories = await this.categoriesRepository.findActiveByCodes(MARKETPLACE_CATEGORY_CODES);
    const orderByCode = new Map<string, number>(MARKETPLACE_CATEGORY_CODES.map((code, index) => [code, index]));

    return categories.sort((first, second) => {
      return (orderByCode.get(first.code) ?? 999) - (orderByCode.get(second.code) ?? 999);
    });
  }

  findBySlug(slug: string): Promise<CategoryEntity | null> {
    return this.categoriesRepository.findActiveBySlug(slug);
  }
}
