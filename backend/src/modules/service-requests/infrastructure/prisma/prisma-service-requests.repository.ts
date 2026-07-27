import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { ServiceRequestEntity } from "../../domain/service-request.entity";
import {
  CreateServiceRequestData,
  ServiceRequestsRepository
} from "../../domain/service-requests.repository";

@Injectable()
export class PrismaServiceRequestsRepository implements ServiceRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRecent(): Promise<ServiceRequestEntity[]> {
    const requests = await this.prisma.serviceRequests.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const categoryIds = requests
      .map((request) => request.categoryId)
      .filter((id): id is number => typeof id === "number");

    const serviceIds = requests
      .map((request) => request.serviceId)
      .filter((id): id is number => typeof id === "number");

    const [categories, services] = await Promise.all([
      this.prisma.categories.findMany({ where: { id: { in: [...new Set(categoryIds)] } } }),
      this.prisma.services.findMany({ where: { id: { in: [...new Set(serviceIds)] } } })
    ]);

    const categoriesById = new Map(categories.map((category) => [category.id, category]));
    const servicesById = new Map(services.map((service) => [service.id, service]));

    return requests.map((request) => ({
      id: request.id,
      clientUserId: request.clientUserId,
      title: request.title,
      originalDescription: request.originalDescription,
      finalDescription: request.finalDescription,
      locationDescription: request.locationDescription,
      urgency: request.urgency,
      status: request.status,
      budgetMin: request.budgetMin,
      budgetMax: request.budgetMax,
      aiAssisted: request.aiAssisted === 1,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      category: request.categoryId ? categoriesById.get(request.categoryId) ?? null : null,
      service: request.serviceId ? servicesById.get(request.serviceId) ?? null : null
    }));
  }

  create(command: CreateServiceRequestData) {
    const now = new Date().toISOString();

    return this.prisma.serviceRequests.create({
      data: {
        clientUserId: command.clientUserId,
        categoryId: command.categoryId,
        serviceId: command.serviceId,
        addressId: command.addressId,
        title: command.title,
        originalDescription: command.originalDescription,
        finalDescription: command.finalDescription,
        locationDescription: command.locationDescription,
        urgency: command.urgency ?? "NORMAL",
        status: "DRAFT",
        budgetMin: command.budgetMin,
        budgetMax: command.budgetMax,
        aiAssisted: command.aiAssisted ? 1 : 0,
        createdAt: now,
        updatedAt: now
      }
    });
  }
}
