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
