export type CreateServiceRequestPayload = {
  clientUserId: number;
  categoryId?: number | null;
  originalDescription: string;
  aiInterpretedSummary?: string | null;
  addressText?: string | null;
  city?: string | null;
  postalCode?: string | null;
  urgencyLevel?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
};

export type ServiceRequestResponse = {
  id: number;
  status: string;
};

export type RequestStep = 1 | 2 | 3 | 4;

export type ServiceRequestDraft = {
  categoryId: number | null;
  categorySlug: string;
  currentStep: RequestStep;
  originalDescription: string;
  serviceId: number | null;
  serviceSlug: string;
  title: string;
};
