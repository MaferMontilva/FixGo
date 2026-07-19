export type CreateServiceRequestCommand = {
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
