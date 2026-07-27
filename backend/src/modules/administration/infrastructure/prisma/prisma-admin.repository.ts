import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import {
  AdminCategory,
  AdminProfessional,
  AdminServiceRequest,
  AdminStats,
  AdminUser
} from "../../domain/admin.entities";
import { AdminRepository, CreateCategoryData, UpdateCategoryData } from "../../domain/admin.repository";

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<AdminStats> {
    const [totalUsers, professionals, activeProfessionals, publishedRequests, serviceOrders, reviews, clientRole] =
      await Promise.all([
        this.prisma.users.count(),
        this.prisma.professionalProfiles.count(),
        this.prisma.professionalProfiles.count({ where: { profileStatus: "ACTIVE" } }),
        this.prisma.serviceRequests.count({ where: { status: "PUBLISHED" } }),
        this.prisma.serviceOrders.count(),
        this.prisma.reviews.count(),
        this.prisma.roles.findUnique({ where: { code: "CLIENT" }, select: { id: true } })
      ]);
    const clients = clientRole ? await this.prisma.userRoles.count({ where: { roleId: clientRole.id } }) : 0;
    return { totalUsers, clients, professionals, activeProfessionals, publishedRequests, serviceOrders, reviews };
  }

  async listUsers(): Promise<AdminUser[]> {
    const users = await this.prisma.users.findMany({ orderBy: [{ id: "asc" }] });
    const userRoles = await this.prisma.userRoles.findMany();
    const roles = await this.prisma.roles.findMany();
    const roleCodeById = new Map(roles.map((role) => [role.id, role.code]));
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roles: userRoles.filter((link) => link.userId === user.id).map((link) => roleCodeById.get(link.roleId) ?? "").filter(Boolean),
      createdAt: user.createdAt
    }));
  }

  async setUserStatus(userId: number, status: string): Promise<AdminUser | null> {
    const existing = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!existing) return null;
    await this.prisma.users.update({ where: { id: userId }, data: { status, updatedAt: new Date().toISOString() } });
    const [user] = await this.listUsersByIds([userId]);
    return user ?? null;
  }

  private async listUsersByIds(ids: number[]): Promise<AdminUser[]> {
    const all = await this.listUsers();
    return all.filter((user) => ids.includes(user.id));
  }

  async listProfessionals(): Promise<AdminProfessional[]> {
    const profiles = await this.prisma.professionalProfiles.findMany({ orderBy: [{ id: "asc" }] });
    const users = await this.prisma.users.findMany({
      where: { id: { in: profiles.map((profile) => profile.userId) } },
      select: { id: true, email: true }
    });
    const emailByUserId = new Map(users.map((user) => [user.id, user.email]));
    return profiles.map((profile) => ({
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      businessName: profile.businessName,
      email: emailByUserId.get(profile.userId) ?? null,
      verificationStatus: profile.verificationStatus,
      profileStatus: profile.profileStatus,
      isVerified: profile.isVerified === 1,
      ratingAverage: profile.ratingAverage,
      ratingsCount: profile.ratingsCount,
      createdAt: profile.createdAt
    }));
  }

  async setProfessionalVerification(profileId: number, verificationStatus: string): Promise<AdminProfessional | null> {
    const existing = await this.prisma.professionalProfiles.findUnique({ where: { id: profileId } });
    if (!existing) return null;
    await this.prisma.professionalProfiles.update({
      where: { id: profileId },
      data: {
        verificationStatus,
        isVerified: verificationStatus === "APPROVED" ? 1 : 0,
        updatedAt: new Date().toISOString()
      }
    });
    const professionals = await this.listProfessionals();
    return professionals.find((professional) => professional.id === profileId) ?? null;
  }

  async listServiceRequests(): Promise<AdminServiceRequest[]> {
    const requests = await this.prisma.serviceRequests.findMany({ where: { deletedAt: null }, orderBy: [{ id: "desc" }], take: 100 });
    const clientIds = [...new Set(requests.map((request) => request.clientUserId))];
    const categoryIds = [...new Set(requests.map((request) => request.categoryId).filter((id): id is number => id != null))];
    const [clients, categories] = await Promise.all([
      this.prisma.users.findMany({ where: { id: { in: clientIds } }, select: { id: true, firstName: true, lastName: true } }),
      this.prisma.categories.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
    ]);
    const clientById = new Map(clients.map((client) => [client.id, client]));
    const categoryById = new Map(categories.map((category) => [category.id, category.name]));
    return requests.map((request) => {
      const client = clientById.get(request.clientUserId);
      return {
        id: request.id,
        title: request.title,
        clientName: client ? `${client.firstName} ${client.lastName}` : `Cliente #${request.clientUserId}`,
        categoryName: request.categoryId ? categoryById.get(request.categoryId) ?? null : null,
        status: request.status,
        urgency: request.urgency,
        createdAt: request.createdAt
      };
    });
  }

  async listCategories(): Promise<AdminCategory[]> {
    const categories = await this.prisma.categories.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    const services = await this.prisma.services.findMany({ select: { categoryId: true } });
    return categories.map((category) => ({
      id: category.id,
      code: category.code,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive === 1,
      servicesCount: services.filter((service) => service.categoryId === category.id).length
    }));
  }

  async setCategoryActive(categoryId: number, isActive: boolean): Promise<AdminCategory | null> {
    const existing = await this.prisma.categories.findUnique({ where: { id: categoryId } });
    if (!existing) return null;
    await this.prisma.categories.update({
      where: { id: categoryId },
      data: { isActive: isActive ? 1 : 0, updatedAt: new Date().toISOString() }
    });
    const categories = await this.listCategories();
    return categories.find((category) => category.id === categoryId) ?? null;
  }

  async categoryCodeExists(code: string): Promise<boolean> {
    const found = await this.prisma.categories.findFirst({ where: { code }, select: { id: true } });
    return Boolean(found);
  }

  async createCategory(data: CreateCategoryData): Promise<AdminCategory> {
    const now = new Date().toISOString();
    const slugBase =
      data.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "categoria";
    const existingSlug = await this.prisma.categories.findFirst({ where: { slug: slugBase }, select: { id: true } });
    const slug = existingSlug ? `${slugBase}-${Date.now().toString(36)}` : slugBase;
    const maxSort = await this.prisma.categories.aggregate({ _max: { sortOrder: true } });
    const created = await this.prisma.categories.create({
      data: {
        code: data.code,
        name: data.name,
        slug,
        description: data.description ?? null,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        isActive: 1,
        createdAt: now,
        updatedAt: now
      }
    });
    return { id: created.id, code: created.code, name: created.name, slug: created.slug, isActive: created.isActive === 1, servicesCount: 0 };
  }

  async updateCategory(categoryId: number, data: UpdateCategoryData): Promise<AdminCategory | null> {
    const existing = await this.prisma.categories.findUnique({ where: { id: categoryId } });
    if (!existing) return null;
    await this.prisma.categories.update({
      where: { id: categoryId },
      data: {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        updatedAt: new Date().toISOString()
      }
    });
    const categories = await this.listCategories();
    return categories.find((category) => category.id === categoryId) ?? null;
  }

  async findCategoryUsage(categoryId: number): Promise<{ services: number; requests: number }> {
    const [services, requests] = await Promise.all([
      this.prisma.services.count({ where: { categoryId } }),
      this.prisma.serviceRequests.count({ where: { categoryId } })
    ]);
    return { services, requests };
  }

  async deleteCategory(categoryId: number): Promise<boolean> {
    const existing = await this.prisma.categories.findUnique({ where: { id: categoryId } });
    if (!existing) return false;
    await this.prisma.categories.delete({ where: { id: categoryId } });
    return true;
  }

  async cancelServiceRequest(requestId: number): Promise<AdminServiceRequest | null> {
    const existing = await this.prisma.serviceRequests.findUnique({ where: { id: requestId } });
    if (!existing) return null;
    const now = new Date().toISOString();
    await this.prisma.serviceRequests.update({
      where: { id: requestId },
      data: { status: "CANCELLED", cancelledAt: now, cancellationReason: "Cancelada por administracion", updatedAt: now }
    });
    const requests = await this.listServiceRequests();
    return requests.find((request) => request.id === requestId) ?? null;
  }

  async softDeleteServiceRequest(requestId: number): Promise<boolean> {
    const existing = await this.prisma.serviceRequests.findUnique({ where: { id: requestId } });
    if (!existing) return false;
    await this.prisma.serviceRequests.update({
      where: { id: requestId },
      data: { deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    });
    return true;
  }
}
