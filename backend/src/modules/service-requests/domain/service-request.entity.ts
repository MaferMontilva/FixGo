export type ServiceRequestEntity = {
  id: number;
  clientUserId: number;
  title: string | null;
  originalDescription: string;
  finalDescription: string | null;
  locationDescription: string | null;
  urgency: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  aiAssisted: boolean;
  createdAt: string;
  updatedAt: string;
  category: unknown | null;
  service: unknown | null;
};
