export const SERVICE_REQUEST_STATUS = {
  DRAFT: "DRAFT",
  AI_PROCESSING: "AI_PROCESSING",
  READY_TO_PUBLISH: "READY_TO_PUBLISH",
  PUBLISHED: "PUBLISHED",
  RECEIVING_BUDGETS: "RECEIVING_BUDGETS",
  PROFESSIONAL_SELECTED: "PROFESSIONAL_SELECTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED"
} as const;

export const SERVICE_REQUEST_URGENCY = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  EMERGENCY: "EMERGENCY"
} as const;

export type ServiceRequestStatus = (typeof SERVICE_REQUEST_STATUS)[keyof typeof SERVICE_REQUEST_STATUS];
export type ServiceRequestUrgency = (typeof SERVICE_REQUEST_URGENCY)[keyof typeof SERVICE_REQUEST_URGENCY];

export type ServiceRequestEntity = {
  id: number;
  clientUserId: number;
  categoryId: number | null;
  serviceId: number | null;
  title: string | null;
  originalDescription: string;
  finalDescription: string | null;
  locationDescription: string | null;
  urgency: ServiceRequestUrgency;
  status: ServiceRequestStatus;
  preferredDateFrom: string | null;
  preferredDateTo: string | null;
  flexibleSchedule: boolean;
  budgetMin: number | null;
  budgetMax: number | null;
  aiAssisted: boolean;
  publishedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: unknown | null;
  service: unknown | null;
};
