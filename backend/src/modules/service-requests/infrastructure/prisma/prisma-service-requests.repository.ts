import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma.service";
import { SERVICE_REQUEST_STATUS, ServiceRequestEntity, ServiceRequestUrgency } from "../../domain/service-request.entity";
import {
  CancelServiceRequestData,
  CategoryReference,
  ServiceReference,
  ServiceRequestDraftData,
  UpdateServiceRequestDraftData,
  ServiceRequestsRepository
} from "../../domain/service-requests.repository";

@Injectable()
export class PrismaServiceRequestsRepository implements ServiceRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async clientProfileExists(clientUserId: number): Promise<boolean> {
    const profile = await this.prisma.clientProfiles.findUnique({
      where: { userId: clientUserId },
      select: { id: true }
    });

    return Boolean(profile);
  }

  async findActiveCategoryById(categoryId: number): Promise<CategoryReference | null> {
    const category = await this.prisma.categories.findFirst({
      where: {
        id: categoryId,
        isActive: 1
      },
      select: {
        id: true,
        isActive: true
      }
    });

    return category
      ? {
          id: category.id,
          active: category.isActive === 1
        }
      : null;
  }

  async findActiveServiceById(serviceId: number): Promise<ServiceReference | null> {
    const service = await this.prisma.services.findFirst({
      where: {
        id: serviceId,
        isActive: 1
      },
      select: {
        id: true,
        categoryId: true,
        isActive: true
      }
    });

    return service
      ? {
          id: service.id,
          categoryId: service.categoryId,
          active: service.isActive === 1
        }
      : null;
  }

  async createDraft(command: ServiceRequestDraftData): Promise<ServiceRequestEntity> {
    const now = new Date().toISOString();

    const request = await this.prisma.serviceRequests.create({
      data: {
        clientUserId: command.clientUserId,
        categoryId: command.categoryId,
        serviceId: command.serviceId ?? null,
        title: command.title,
        originalDescription: command.originalDescription,
        locationDescription: command.locationDescription,
        urgency: command.urgency,
        status: SERVICE_REQUEST_STATUS.DRAFT,
        preferredDateFrom: command.preferredDateFrom ?? null,
        preferredDateTo: command.preferredDateTo ?? null,
        flexibleSchedule: command.flexibleSchedule ? 1 : 0,
        publishedAt: null,
        cancelledAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now
      }
    });

    return this.toEntity(request);
  }

  async updateOwnedDraft(
    id: number,
    clientUserId: number,
    data: UpdateServiceRequestDraftData
  ): Promise<ServiceRequestEntity | null> {
    const existing = await this.prisma.serviceRequests.findFirst({
      where: {
        id,
        clientUserId,
        status: SERVICE_REQUEST_STATUS.DRAFT,
        deletedAt: null
      },
      select: { id: true }
    });

    if (!existing) return null;

    const request = await this.prisma.serviceRequests.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        serviceId: data.serviceId ?? null,
        title: data.title,
        originalDescription: data.originalDescription,
        locationDescription: data.locationDescription,
        urgency: data.urgency,
        preferredDateFrom: data.preferredDateFrom ?? null,
        preferredDateTo: data.preferredDateTo ?? null,
        flexibleSchedule: data.flexibleSchedule ? 1 : 0,
        updatedAt: new Date().toISOString()
      }
    });

    return this.toEntity(request);
  }

  async findDraftsByClientUserId(clientUserId: number): Promise<ServiceRequestEntity[]> {
    const requests = await this.prisma.serviceRequests.findMany({
      where: {
        clientUserId,
        status: SERVICE_REQUEST_STATUS.DRAFT,
        deletedAt: null
      },
      orderBy: { updatedAt: "desc" }
    });

    return requests.map((request) => this.toEntity(request));
  }

  async findOwnedDraftById(id: number, clientUserId: number): Promise<ServiceRequestEntity | null> {
    const request = await this.prisma.serviceRequests.findFirst({
      where: {
        id,
        clientUserId,
        deletedAt: null
      }
    });

    return request ? this.toEntity(request) : null;
  }

  async findAllOwnedServiceRequests(clientUserId: number): Promise<ServiceRequestEntity[]> {
    const requests = await this.prisma.serviceRequests.findMany({
      where: {
        clientUserId,
        deletedAt: null
      },
      orderBy: { updatedAt: "desc" }
    });

    return requests.map((request) => this.toEntity(request));
  }

  async findOwnedServiceRequestById(id: number, clientUserId: number): Promise<ServiceRequestEntity | null> {
    const request = await this.prisma.serviceRequests.findFirst({
      where: {
        id,
        clientUserId,
        deletedAt: null
      }
    });

    return request ? this.toEntity(request) : null;
  }

  async publishOwnedDraft(id: number, clientUserId: number): Promise<ServiceRequestEntity | null> {
    const now = new Date().toISOString();
    const updateResult = await this.prisma.serviceRequests.updateMany({
      where: {
        id,
        clientUserId,
        status: SERVICE_REQUEST_STATUS.DRAFT,
        deletedAt: null
      },
      data: {
        status: SERVICE_REQUEST_STATUS.PUBLISHED,
        publishedAt: now,
        updatedAt: now
      }
    });

    if (updateResult.count === 0) return null;

    return this.findOwnedServiceRequestById(id, clientUserId);
  }

  async cancelOwnedServiceRequest(
    id: number,
    clientUserId: number,
    allowedStatuses: readonly string[],
    data: CancelServiceRequestData
  ): Promise<ServiceRequestEntity | null> {
    const now = new Date().toISOString();
    const updateResult = await this.prisma.serviceRequests.updateMany({
      where: {
        id,
        clientUserId,
        status: { in: [...allowedStatuses] },
        deletedAt: null
      },
      data: {
        status: SERVICE_REQUEST_STATUS.CANCELLED,
        cancelledAt: now,
        cancellationReason: data.cancellationReason,
        updatedAt: now
      }
    });

    if (updateResult.count === 0) return null;

    return this.findOwnedServiceRequestById(id, clientUserId);
  }

  private toEntity(request: {
    id: number;
    clientUserId: number;
    categoryId: number | null;
    serviceId: number | null;
    title: string | null;
    originalDescription: string;
    finalDescription: string | null;
    locationDescription: string | null;
    urgency: string;
    status: string;
    preferredDateFrom: string | null;
    preferredDateTo: string | null;
    flexibleSchedule: number;
    budgetMin: number | null;
    budgetMax: number | null;
    aiAssisted: number;
    publishedAt: string | null;
    expiresAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }): ServiceRequestEntity {
    return {
      id: request.id,
      clientUserId: request.clientUserId,
      categoryId: request.categoryId,
      serviceId: request.serviceId,
      title: request.title,
      originalDescription: request.originalDescription,
      finalDescription: request.finalDescription,
      locationDescription: request.locationDescription,
      urgency: request.urgency as ServiceRequestUrgency,
      status: request.status as ServiceRequestEntity["status"],
      preferredDateFrom: request.preferredDateFrom,
      preferredDateTo: request.preferredDateTo,
      flexibleSchedule: request.flexibleSchedule === 1,
      budgetMin: request.budgetMin,
      budgetMax: request.budgetMax,
      aiAssisted: request.aiAssisted === 1,
      publishedAt: request.publishedAt,
      expiresAt: request.expiresAt,
      cancelledAt: request.cancelledAt,
      cancellationReason: request.cancellationReason,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      deletedAt: request.deletedAt,
      category: null,
      service: null
    };
  }
}
