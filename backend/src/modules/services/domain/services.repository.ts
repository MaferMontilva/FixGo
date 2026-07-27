import { ServiceEntity } from "./service.entity";

export const SERVICES_REPOSITORY = Symbol("SERVICES_REPOSITORY");

export type ListServicesFilters = {
  category?: string;
  search?: string;
};

export abstract class ServicesRepository {
  abstract findActive(filters: ListServicesFilters): Promise<ServiceEntity[]>;
  abstract findActiveBySlug(slug: string): Promise<ServiceEntity | null>;
}
