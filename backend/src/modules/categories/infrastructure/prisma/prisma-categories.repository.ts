import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { CategoryEntity } from "../../domain/category.entity";
import { CategoriesRepository } from "../../domain/categories.repository";

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.categories.findMany({
      where: { isActive: 1 },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });

    return categories.map((category) => ({
      id: category.id,
      code: category.code,
      name: category.name,
      slug: category.slug,
      description: category.description,
      iconName: category.iconName,
      imageUrl: category.imageUrl,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      active: category.isActive === 1
    }));
  }
}
