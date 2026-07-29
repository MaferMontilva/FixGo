export const SERVICE_ORDER_STATUS = {
  PENDING_START: "PENDING_START",
  SCHEDULED: "SCHEDULED",
  PROFESSIONAL_EN_ROUTE: "PROFESSIONAL_EN_ROUTE",
  IN_PROGRESS: "IN_PROGRESS",
  PAUSED: "PAUSED",
  AWAITING_CLIENT_CONFIRMATION: "AWAITING_CLIENT_CONFIRMATION",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
} as const;

export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUS)[keyof typeof SERVICE_ORDER_STATUS];

export type ServiceOrderEntity = {
  id: number;
  serviceRequestId: number;
  acceptedBudgetId: number;
  clientUserId: number;
  professionalId: number;
  status: ServiceOrderStatus;
  startedAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  requestTitle: string | null;
  requestDescription: string | null;
  professionalName: string | null;
  professionalPhone: string | null;
  clientName: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  totalPrice: number | null;
  currency: string | null;
  hasReview: boolean;
};
