import { ServiceRequestEntity, ServiceRequestStatus, ServiceRequestUrgency } from "./service-request.entity";

export const SERVICE_REQUESTS_REPOSITORY = Symbol("SERVICE_REQUESTS_REPOSITORY");

export type ServiceRequestDraftData = {
  clientUserId: number;
  categoryId: number;
  serviceId?: number | null;
  title?: string | null;
  originalDescription: string;
  locationDescription: string;
  urgency: ServiceRequestUrgency;
  preferredDateFrom?: string | null;
  preferredDateTo?: string | null;
  flexibleSchedule: boolean;
  budgetMin?: number | null;
  budgetMax?: number | null;
  aiAssisted?: boolean;
};

export type UpdateServiceRequestDraftData = Omit<ServiceRequestDraftData, "clientUserId">;

export type CategoryReference = {
  id: number;
  active: boolean;
  code: string;
  name: string;
};

export type ServiceReference = {
  id: number;
  categoryId: number;
  active: boolean;
};

export type CancelServiceRequestData = {
  cancellationReason: string | null;
};

export abstract class ServiceRequestsRepository {
  abstract clientProfileExists(clientUserId: number): Promise<boolean>;
  abstract findActiveCategoryById(categoryId: number): Promise<CategoryReference | null>;
  abstract findActiveServiceById(serviceId: number): Promise<ServiceReference | null>;
  abstract createDraft(data: ServiceRequestDraftData): Promise<ServiceRequestEntity>;
  abstract updateOwnedDraft(
    id: number,
    clientUserId: number,
    data: UpdateServiceRequestDraftData
  ): Promise<ServiceRequestEntity | null>;
  abstract findDraftsByClientUserId(clientUserId: number): Promise<ServiceRequestEntity[]>;
  abstract findOwnedDraftById(id: number, clientUserId: number): Promise<ServiceRequestEntity | null>;
  abstract findAllOwnedServiceRequests(clientUserId: number): Promise<ServiceRequestEntity[]>;
  abstract findOwnedServiceRequestById(id: number, clientUserId: number): Promise<ServiceRequestEntity | null>;
  abstract publishOwnedDraft(id: number, clientUserId: number): Promise<ServiceRequestEntity | null>;
  abstract findCompatibleProfessionalUserIds(categoryId: number, location: string | null): Promise<number[]>;
  abstract cancelOwnedServiceRequest(
    id: number,
    clientUserId: number,
    allowedStatuses: readonly ServiceRequestStatus[],
    data: CancelServiceRequestData
  ): Promise<ServiceRequestEntity | null>;
  abstract duplicateOwnedCancelledAsDraft(id: number, clientUserId: number): Promise<ServiceRequestEntity | null>;
  abstract softDeleteOwnedRequest(
    id: number,
    clientUserId: number,
    allowedStatuses: readonly ServiceRequestStatus[]
  ): Promise<ServiceRequestEntity | null>;
}
