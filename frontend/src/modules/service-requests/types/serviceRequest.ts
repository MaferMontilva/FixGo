export type RequestStep = 1 | 2 | 3 | 4;

export type RequestUrgency = "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";

export type ServiceRequestDraftPayload = {
  categoryId: number;
  serviceId?: number | null;
  title?: string | null;
  originalDescription: string;
  locationDescription: string;
  postalCode?: string;
  urgency: RequestUrgency;
  preferredDateFrom?: string | null;
  preferredDateTo?: string | null;
  flexibleSchedule: boolean;
  budgetMin?: number | null;
  budgetMax?: number | null;
  aiAssisted?: boolean;
};

export type ServiceRequestStatus =
  | "DRAFT"
  | "AI_PROCESSING"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "RECEIVING_BUDGETS"
  | "PROFESSIONAL_SELECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | string;

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
  budgetMin: number | null;
  budgetMax: number | null;
  aiAssisted: boolean;
  status: ServiceRequestStatus;
  publishedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RequestSubmissionStatus = "idle" | "saving" | "publishing" | "saved" | "published" | "error";

export type AiAnalysisStatus = "idle" | "analyzing" | "ready" | "error";

export type ServiceRequestAiAnalysisRequest = {
  categoryId?: number | null;
  categoryName?: string | null;
  description: string;
  serviceId?: number | null;
  serviceName?: string | null;
  title?: string | null;
  urgency?: RequestUrgency | null;
};

export type RefineServiceRequestDescriptionRequest = {
  additionalDetails: string;
  categoryId?: string | null;
  currentDescription: string;
  serviceId?: string | null;
};

export type RefineServiceRequestDescriptionResponse = {
  fallbackUsed: boolean;
  model?: string | null;
  professionalInformationNeeded: string[];
  provider: "groq" | "local-fallback" | string;
  refinedDescription: string;
};

export type ServiceRequestAiAnalysis = {
  detectedWorkType: string;
  fallbackUsed: boolean;
  improvedDescription: string;
  missingInformation: string[];
  model: string | null;
  professionalInformationNeeded: string[];
  provider: "openai" | "gemini" | "groq" | "local-fallback";
  recommendedNextStep: string;
  safetyWarning: string | null;
  suggestedCategoryCode: string | null;
  suggestedCategoryId: number | null;
  suggestedCategoryName: string | null;
  suggestedBudgetRange: {
    confidence: "LOW" | "MEDIUM" | "HIGH";
    currency: "EUR";
    max: number;
    min: number;
  };
  suggestedServiceId: number | null;
  suggestedServiceName: string | null;
  suggestedServiceSlug: string | null;
  suggestedTitle: string;
  suggestedUrgency: RequestUrgency;
  urgencyReason: string;
  summary: string;
};

export type ServiceRequestDraft = {
  categoryId: number | null;
  categorySlug: string;
  currentStep: RequestStep;
  flexibleSchedule: boolean;
  locationDescription: string;
  postalCode: string;
  originalDescription: string;
  preferredDateFrom: string;
  preferredDateTo: string;
  serverDraftId: string | null;
  serviceId: number | null;
  serviceSlug: string;
  title: string;
  updatedAt: string;
  urgency: RequestUrgency;
  budgetMin: number | null;
  budgetMax: number | null;
  aiAssisted: boolean;
};
