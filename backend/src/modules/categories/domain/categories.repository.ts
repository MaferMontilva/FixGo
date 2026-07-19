import { CategoryEntity } from "./category.entity";

export abstract class CategoriesRepository {
  abstract findAllActive(): Promise<CategoryEntity[]>;
}
