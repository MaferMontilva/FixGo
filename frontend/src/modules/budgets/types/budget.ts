export type BudgetStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "WITHDRAWN";

export type BudgetItem = {
  id: number;
  budgetId: number;
  itemType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sortOrder: number;
};

export type BudgetProfessionalSummary = {
  id: number;
  displayName: string;
  businessName: string | null;
  ratingAverage: number;
  ratingsCount: number;
};

export type Budget = {
  id: number;
  serviceRequestId: number;
  professionalId: number;
  status: BudgetStatus;
  currency: string;
  subtotal: number;
  taxes: number;
  platformFee: number;
  totalPrice: number;
  estimatedDurationValue: number | null;
  estimatedDurationUnit: string | null;
  availableFrom: string | null;
  validUntil: string | null;
  observations: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: BudgetItem[];
  professional: BudgetProfessionalSummary | null;
};

export type CreateBudgetItemPayload = {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType?: string;
};

export type CreateBudgetPayload = {
  serviceRequestId: number;
  items: CreateBudgetItemPayload[];
  observations?: string;
  estimatedDurationValue?: number;
  estimatedDurationUnit?: string;
  availableFrom?: string;
  validUntil?: string;
};
