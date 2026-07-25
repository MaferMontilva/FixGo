import { ServiceRequestUrgency } from "../domain/service-request.entity";

export type CreateServiceRequestCommand = {
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
};
