export type RequestStep = 1 | 2 | 3 | 4;

export type RequestUrgency = "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";

export type ServiceRequestDraftPayload = {
  categoryId: number;
  serviceId?: number | null;
  title?: string | null;
  originalDescription: string;
  locationDescription: string;
  urgency: RequestUrgency;
  preferredDateFrom?: string | null;
  preferredDateTo?: string | null;
  flexibleSchedule: boolean;
};

export type ServiceRequestStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | string;

export type ServiceRequestResponse = {
  id: number;
  categoryId: number | null;
  serviceId: number | null;
  title: string | null;
  originalDescription: string;
  locationDescription: string | null;
  urgency: RequestUrgency;
  preferredDateFrom: string | null;
  preferredDateTo: string | null;
  flexibleSchedule: boolean;
  status: ServiceRequestStatus;
  publishedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RequestSubmissionStatus = "idle" | "saving" | "publishing" | "saved" | "published" | "error";

export type ServiceRequestDraft = {
  categoryId: number | null;
  categorySlug: string;
  currentStep: RequestStep;
  flexibleSchedule: boolean;
  locationDescription: string;
  originalDescription: string;
  preferredDateFrom: string;
  preferredDateTo: string;
  serverDraftId: string | null;
  serviceId: number | null;
  serviceSlug: string;
  title: string;
  updatedAt: string;
  urgency: RequestUrgency;
};
