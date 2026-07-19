import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { ProfessionalEntity } from "../../domain/professional.entity";
import { ProfessionalsRepository } from "../../domain/professionals.repository";

@Injectable()
export class PrismaProfessionalsRepository implements ProfessionalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<ProfessionalEntity[]> {
    const professionals = await this.prisma.professionalProfiles.findMany({
      where: { profileStatus: "ACTIVE" },
      orderBy: [{ isHomologated: "desc" }, { ratingAverage: "desc" }, { displayName: "asc" }]
    });

    const categoryLinks = await this.prisma.professionalCategories.findMany({
      where: {
        professionalId: {
          in: professionals.map((professional) => professional.id)
        }
      },
      orderBy: [{ isPrimary: "desc" }, { yearsExperience: "desc" }]
    });

    const categories = await this.prisma.categories.findMany({
      where: {
        id: {
          in: [...new Set(categoryLinks.map((link) => link.categoryId))]
        }
      }
    });

    const categoriesById = new Map(categories.map((category) => [category.id, category]));

    return professionals.map((professional) => {
      const links = categoryLinks.filter((link) => link.professionalId === professional.id);
      const primaryCategory = categoriesById.get(links[0]?.categoryId ?? 0);

      return {
        id: professional.id,
        slug: professional.slug,
        displayName: professional.displayName,
        businessName: professional.businessName,
        bio: professional.bio,
        location: null,
        profileImageUrl: professional.profileImageUrl,
        coverImageUrl: professional.coverImageUrl,
        verified: professional.isVerified === 1,
        homologated: professional.isHomologated === 1,
        ratingAverage: professional.ratingAverage,
        ratingsCount: professional.ratingsCount,
        completedJobsCount: professional.completedJobsCount,
        responseTimeMinutes: professional.responseTimeMinutes,
        trade: primaryCategory?.name ?? "Profesional FixGo",
        categories: links
          .map((link) => categoriesById.get(link.categoryId))
          .filter(Boolean)
          .map((category) => ({
            id: category!.id,
            name: category!.name,
            slug: category!.slug,
            iconName: category!.iconName
          }))
      };
    });
  }
}
