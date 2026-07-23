import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { ServiceEntity } from "../../domain/service.entity";
import { ListServicesFilters, ServicesRepository } from "../../domain/services.repository";

type PrismaServiceWithCategory = {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  baseUnit: string | null;
  sortOrder: number;
  isActive: number;
  category: {
    id: number;
    code: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    isActive: number;
  };
};

type PrismaServiceRecord = Omit<PrismaServiceWithCategory, "category">;

type PrismaCategoryRecord = PrismaServiceWithCategory["category"];

@Injectable()
export class PrismaServicesRepository implements ServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(service: PrismaServiceWithCategory): ServiceEntity {
    return {
      id: service.id,
      categoryId: service.categoryId,
      code: service.code,
      name: service.name,
      slug: service.slug,
      description: service.description,
      baseUnit: service.baseUnit,
      sortOrder: service.sortOrder,
      active: service.isActive === 1,
      category: {
        id: service.category.id,
        code: service.category.code,
        name: service.category.name,
        slug: service.category.slug,
        description: service.category.description,
        sortOrder: service.category.sortOrder,
        active: service.category.isActive === 1
      }
    };
  }

  async findActive(filters: ListServicesFilters): Promise<ServiceEntity[]> {
    const category = filters.category?.trim();
    const search = filters.search?.trim();
    const matchingCategoryIds = new Set<number>();
    const categoryFilter = category
      ? await this.prisma.categories.findMany({
          where: {
            isActive: 1,
            OR: [{ slug: { equals: category } }, { code: { equals: category.toUpperCase() } }]
          }
        })
      : [];

    categoryFilter.forEach((item) => matchingCategoryIds.add(item.id));

    if (category && matchingCategoryIds.size === 0) {
      return [];
    }

    const services = await this.prisma.services.findMany({
      where: {
        isActive: 1,
        ...(category ? { categoryId: { in: [...matchingCategoryIds] } } : {})
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });

    const categoryIds = [...new Set(services.map((service) => service.categoryId))];
    const categories = await this.prisma.categories.findMany({
      where: {
        id: { in: categoryIds },
        isActive: 1
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
    const categoriesById = new Map(categories.map((item) => [item.id, item]));
    const searchLower = search?.toLowerCase();
    const rows = services
      .map((service): PrismaServiceWithCategory | null => {
        const serviceCategory = categoriesById.get(service.categoryId);
        if (!serviceCategory) return null;

        return {
          ...(service as PrismaServiceRecord),
          category: serviceCategory as PrismaCategoryRecord
        };
      })
      .filter((service): service is PrismaServiceWithCategory => Boolean(service))
      .filter((service) => {
        if (!searchLower) return true;
        return [
          service.name,
          service.description,
          service.code,
          service.slug,
          service.category.name,
          service.category.code,
          service.category.slug
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchLower));
      });

    return rows
      .sort((first, second) => {
        return (
          first.category.sortOrder - second.category.sortOrder ||
          first.sortOrder - second.sortOrder ||
          first.name.localeCompare(second.name)
        );
      })
      .map((service) => this.toEntity(service));
  }

  async findActiveBySlug(slug: string): Promise<ServiceEntity | null> {
    const service = await this.prisma.services.findFirst({
      where: {
        slug,
        isActive: 1
      }
    });

    if (!service) return null;

    const category = await this.prisma.categories.findFirst({
      where: {
        id: service.categoryId,
        isActive: 1
      }
    });

    return category
      ? this.toEntity({
          ...(service as PrismaServiceRecord),
          category: category as PrismaCategoryRecord
        })
      : null;
  }
}
