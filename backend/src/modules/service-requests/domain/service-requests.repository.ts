import { ServiceRequestEntity } from "./service-request.entity";

export const SERVICE_REQUESTS_REPOSITORY = Symbol("SERVICE_REQUESTS_REPOSITORY");

export type CreateServiceRequestData = {
  clientUserId: number;
  categoryId?: number;
  serviceId?: number;
  addressId?: number;
  title?: string;
  originalDescription: string;
  finalDescription?: string;
  locationDescription?: string;
  urgency?: "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";
  budgetMin?: number;
  budgetMax?: number;
  aiAssisted?: boolean;
};

export abstract class ServiceRequestsRepository {
  abstract findRecent(): Promise<ServiceRequestEntity[]>;
  abstract create(data: CreateServiceRequestData): Promise<unknown>;
}
