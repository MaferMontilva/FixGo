import { CategoryEntity } from "./category.entity";

export const CATEGORIES_REPOSITORY = Symbol("CATEGORIES_REPOSITORY");

export abstract class CategoriesRepository {
  abstract findAllActive(): Promise<CategoryEntity[]>;
}
