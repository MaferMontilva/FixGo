import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { ProfessionalEntity, ProfessionalMeEntity, ProfessionalOpportunityEntity, UpsertProfessionalProfileData } from "../../domain/professional.entity";
import { ProfessionalsRepository } from "../../domain/professionals.repository";

@Injectable()
export class PrismaProfessionalsRepository implements ProfessionalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<ProfessionalEntity[]> {
    // Solo se listan profesionales con perfil activo Y verificacion aprobada.
    // Ademas se excluyen los que pertenecen a un usuario suspendido por administracion.
    const approved = await this.prisma.professionalProfiles.findMany({
      where: { profileStatus: "ACTIVE", verificationStatus: "APPROVED" },
      orderBy: [{ isHomologated: "desc" }, { ratingAverage: "desc" }, { displayName: "asc" }]
    });
    const activeUsers = await this.prisma.users.findMany({
      where: { id: { in: approved.map((profile) => profile.userId) }, status: "ACTIVE" },
      select: { id: true }
    });
    const activeUserIds = new Set(activeUsers.map((user) => user.id));
    const professionals = approved.filter((profile) => activeUserIds.has(profile.userId));

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

  async findMeByUserId(userId: number): Promise<ProfessionalMeEntity | null> {
    const profile = await this.prisma.professionalProfiles.findUnique({ where: { userId } });
    if (!profile) return null;

    return this.hydrateProfessionalMe(profile);
  }

  async upsertMe(userId: number, data: UpsertProfessionalProfileData): Promise<ProfessionalMeEntity> {
    const now = new Date().toISOString();
    const categoryIds = [...new Set(data.categoryIds)];
    const validCategories = await this.prisma.categories.findMany({
      where: { id: { in: categoryIds }, isActive: 1 }
    });
    const validCategoryIds = validCategories.map((category) => category.id);

    const validServices = data.serviceIds.length
      ? await this.prisma.services.findMany({
          where: {
            id: { in: [...new Set(data.serviceIds)] },
            isActive: 1,
            categoryId: { in: validCategoryIds }
          }
        })
      : [];

    const serviceIds = validServices.map((service) => service.id);
    const existing = await this.prisma.professionalProfiles.findUnique({ where: { userId } });
    const displayName = data.displayName.trim();
    const slug = existing?.slug ?? `${displayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "profesional"}-${userId}`;
    const profileStatus = validCategoryIds.length && data.province && data.municipality && data.postalCode ? "ACTIVE" : "INCOMPLETE";

    const profile = await this.prisma.$transaction(async (tx) => {
      const savedProfile = existing
        ? await tx.professionalProfiles.update({
            where: { userId },
            data: {
              displayName,
              businessName: data.businessName?.trim() || null,
              phone: data.phone || null,
              taxId: data.document?.trim() || null,
              bio: data.bio?.trim() || null,
              yearsExperience: data.yearsExperience ?? 0,
              province: data.province,
              municipality: data.municipality,
              postalCode: data.postalCode,
              referenceAddress: data.referenceAddress?.trim() || null,
              workRadius: data.workRadius,
              availability: data.availability || null,
              profileImageUrl: data.profileImageUrl || null,
              profileStatus,
              updatedAt: now
            }
          })
        : await tx.professionalProfiles.create({
            data: {
              userId,
              slug,
              displayName,
              businessName: data.businessName?.trim() || null,
              phone: data.phone || null,
              taxId: data.document?.trim() || null,
              bio: data.bio?.trim() || null,
              yearsExperience: data.yearsExperience ?? 0,
              province: data.province,
              municipality: data.municipality,
              postalCode: data.postalCode,
              referenceAddress: data.referenceAddress?.trim() || null,
              workRadius: data.workRadius,
              availability: data.availability || null,
              profileImageUrl: data.profileImageUrl || null,
              verificationStatus: "PENDING",
              profileStatus,
              ratingAverage: 0,
              createdAt: now,
              updatedAt: now
            }
          });

      if (data.email?.trim()) {
        const email = data.email.trim();
        const emailInUse = await tx.users.findFirst({ where: { email, id: { not: userId } }, select: { id: true } });
        if (!emailInUse) {
          await tx.users.update({
            where: { id: userId },
            data: { email, updatedAt: now }
          });
        }
      }

      await tx.professionalCategories.deleteMany({ where: { professionalId: savedProfile.id } });
      if (validCategoryIds.length) {
        await tx.professionalCategories.createMany({
          data: validCategoryIds.map((categoryId, index) => ({
            professionalId: savedProfile.id,
            categoryId,
            isPrimary: index === 0 ? 1 : 0,
            yearsExperience: data.yearsExperience ?? 0,
            createdAt: now
          }))
        });
      }

      await tx.professionalServices.deleteMany({ where: { professionalId: savedProfile.id } });
      if (serviceIds.length) {
        await tx.professionalServices.createMany({
          data: serviceIds.map((serviceId) => ({
            professionalId: savedProfile.id,
            serviceId,
            createdAt: now
          }))
        });
      }

      await tx.professionalServiceAreas.deleteMany({ where: { professionalId: savedProfile.id } });
      await tx.professionalServiceAreas.create({
        data: {
          professionalId: savedProfile.id,
          postalCode: data.postalCode,
          radiusKm: data.workRadius,
          isActive: 1,
          createdAt: now
        }
      });

      return savedProfile;
    });

    return this.hydrateProfessionalMe(profile);
  }

  async countCompatibleProfessionals(categoryId: number, location: string | null): Promise<number> {
    const links = await this.prisma.professionalCategories.findMany({ where: { categoryId }, select: { professionalId: true } });
    if (links.length === 0) return 0;
    const professionalIds = [...new Set(links.map((link) => link.professionalId))];
    const profiles = await this.prisma.professionalProfiles.findMany({
      where: { id: { in: professionalIds }, profileStatus: "ACTIVE", verificationStatus: "APPROVED" },
      select: { userId: true, province: true }
    });
    const loc = (location ?? "").toLowerCase();
    const inProvince = profiles.filter((profile) => profile.province && loc.includes(profile.province.toLowerCase()));
    if (inProvince.length === 0) return 0;
    const activeUsers = await this.prisma.users.findMany({
      where: { id: { in: inProvince.map((profile) => profile.userId) }, status: "ACTIVE" },
      select: { id: true }
    });
    return activeUsers.length;
  }

  async findCompatibleOpportunities(userId: number): Promise<ProfessionalOpportunityEntity[]> {
    const profile = await this.findMeByUserId(userId);
    if (!profile?.categories.length) return [];

    const categoryIds = profile.categories.map((category) => category.id);
    const requests = await this.prisma.serviceRequests.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        categoryId: { in: categoryIds }
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 50
    });

    return this.hydrateOpportunities(requests, profile.province);
  }

  async findCompatibleOpportunityById(userId: number, opportunityId: number): Promise<ProfessionalOpportunityEntity | null> {
    const opportunities = await this.findCompatibleOpportunities(userId);
    return opportunities.find((opportunity) => opportunity.id === opportunityId) ?? null;
  }

  private async hydrateProfessionalMe(profile: {
    id: number;
    userId: number;
    displayName: string;
    businessName: string | null;
    phone: string | null;
    taxId: string | null;
    bio: string | null;
    yearsExperience: number;
    province: string | null;
    municipality: string | null;
    postalCode: string | null;
    referenceAddress: string | null;
    workRadius: number | null;
    availability: string | null;
    profileStatus: string;
    profileImageUrl: string | null;
    ratingAverage: number;
    ratingsCount: number;
    createdAt: string;
    updatedAt: string;
  }): Promise<ProfessionalMeEntity> {
    const user = await this.prisma.users.findUnique({ where: { id: profile.userId } });
    const [categoryLinks, serviceLinks] = await Promise.all([
      this.prisma.professionalCategories.findMany({ where: { professionalId: profile.id }, orderBy: [{ isPrimary: "desc" }] }),
      this.prisma.professionalServices.findMany({ where: { professionalId: profile.id } })
    ]);
    const [categories, services] = await Promise.all([
      this.prisma.categories.findMany({ where: { id: { in: categoryLinks.map((link) => link.categoryId) } } }),
      this.prisma.services.findMany({ where: { id: { in: serviceLinks.map((link) => link.serviceId) } } })
    ]);

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      businessName: profile.businessName,
      email: user?.email ?? null,
      phone: profile.phone,
      document: profile.taxId,
      bio: profile.bio,
      yearsExperience: profile.yearsExperience,
      province: profile.province,
      municipality: profile.municipality,
      postalCode: profile.postalCode,
      referenceAddress: profile.referenceAddress,
      workRadius: profile.workRadius,
      availability: profile.availability,
      status: profile.profileStatus,
      profileImageUrl: profile.profileImageUrl,
      ratingAverage: profile.ratingAverage,
      ratingsCount: profile.ratingsCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        iconName: category.iconName
      })),
      services: services.map((service) => ({
        id: service.id,
        categoryId: service.categoryId,
        name: service.name,
        slug: service.slug
      }))
    };
  }

  private async hydrateOpportunities(requests: Array<{
    id: number;
    title: string | null;
    finalDescription: string | null;
    originalDescription: string;
    categoryId: number | null;
    serviceId: number | null;
    locationDescription: string | null;
    urgency: string;
    budgetMin: number | null;
    budgetMax: number | null;
    preferredDateFrom: string | null;
    preferredDateTo: string | null;
    flexibleSchedule: number;
    publishedAt: string | null;
    createdAt: string;
  }>, province: string | null): Promise<ProfessionalOpportunityEntity[]> {
    const categoryIds = requests.map((request) => request.categoryId).filter((id): id is number => typeof id === "number");
    const serviceIds = requests.map((request) => request.serviceId).filter((id): id is number => typeof id === "number");
    const [categories, services] = await Promise.all([
      this.prisma.categories.findMany({ where: { id: { in: [...new Set(categoryIds)] } } }),
      this.prisma.services.findMany({ where: { id: { in: [...new Set(serviceIds)] } } })
    ]);
    const categoriesById = new Map(categories.map((category) => [category.id, category]));
    const servicesById = new Map(services.map((service) => [service.id, service]));

    // Emparejamiento por CATEGORIA + PROVINCIA: el profesional solo ve las
    // solicitudes de su categoria cuya ubicacion corresponde a su provincia.
    return requests
      .filter((request) => {
        if (!province || !request.locationDescription) return false;
        return request.locationDescription.toLowerCase().includes(province.toLowerCase());
      })
      .map((request) => {
        const category = request.categoryId ? categoriesById.get(request.categoryId) : null;
        const service = request.serviceId ? servicesById.get(request.serviceId) : null;
        return {
          id: request.id,
          title: request.title,
          description: request.finalDescription ?? request.originalDescription,
          category: category
            ? { id: category.id, name: category.name, slug: category.slug, iconName: category.iconName }
            : null,
          service: service
            ? { id: service.id, categoryId: service.categoryId, name: service.name, slug: service.slug }
            : null,
          location: request.locationDescription,
          province: province && request.locationDescription?.toLowerCase().includes(province.toLowerCase()) ? province : null,
          municipality: request.locationDescription,
          urgency: request.urgency,
          budgetMin: request.budgetMin,
          budgetMax: request.budgetMax,
          preferredDateFrom: request.preferredDateFrom,
          preferredDateTo: request.preferredDateTo,
          flexibleSchedule: request.flexibleSchedule === 1,
          publishedAt: request.publishedAt,
          createdAt: request.createdAt
        };
      });
  }
}
