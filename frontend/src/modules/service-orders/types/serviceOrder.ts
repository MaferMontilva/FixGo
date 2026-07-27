export type ServiceOrderStatus =
  | "PENDING_START"
  | "SCHEDULED"
  | "PROFESSIONAL_EN_ROUTE"
  | "IN_PROGRESS"
  | "PAUSED"
  | "AWAITING_CLIENT_CONFIRMATION"
  | "COMPLETED"
  | "CANCELLED";

export type ServiceOrder = {
  id: number;
  serviceRequestId: number;
  acceptedBudgetId: number;
  professionalId: number;
  status: ServiceOrderStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requestTitle: string | null;
  requestDescription: string | null;
  professionalName: string | null;
  totalPrice: number | null;
  currency: string | null;
  hasReview: boolean;
};
