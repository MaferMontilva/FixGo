export const BUDGET_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VIEWED: "VIEWED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  WITHDRAWN: "WITHDRAWN"
} as const;

export type BudgetStatus = (typeof BUDGET_STATUS)[keyof typeof BUDGET_STATUS];

export type BudgetItemEntity = {
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

export type BudgetEntity = {
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
  items: BudgetItemEntity[];
  professional: BudgetProfessionalSummary | null;
};
