import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { CategoryEntity } from "../../domain/category.entity";
import { CategoriesRepository } from "../../domain/categories.repository";

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(category: {
    id: number;
    code: string;
    name: string;
    slug: string;
    description: string | null;
    iconName: string | null;
    imageUrl: string | null;
    parentId: number | null;
    sortOrder: number;
    isActive: number;
  }): CategoryEntity {
    return {
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
    };
  }

  async findAllActive(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.categories.findMany({
      where: { isActive: 1 },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });

    return categories.map((category) => this.toEntity(category));
  }

  async findActiveByCodes(codes: readonly string[]): Promise<CategoryEntity[]> {
    const categories = await this.prisma.categories.findMany({
      where: {
        code: { in: [...codes] },
        isActive: 1
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });

    return categories.map((category) => this.toEntity(category));
  }

  async findActiveBySlug(slug: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.categories.findFirst({
      where: {
        slug,
        isActive: 1
      }
    });

    return category ? this.toEntity(category) : null;
  }
}
