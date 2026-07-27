export type ServiceRequestAiUrgency = "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";

export type AnalyzeServiceRequestInput = {
  categoryId?: number | null;
  categoryName?: string | null;
  description: string;
  serviceId?: number | null;
  serviceName?: string | null;
  title?: string | null;
  urgency?: ServiceRequestAiUrgency | null;
};

export type RefineServiceRequestDescriptionInput = {
  additionalDetails: string;
  categoryId?: string | null;
  currentDescription: string;
  serviceId?: string | null;
};

export type RefineServiceRequestDescriptionResult = {
  fallbackUsed: boolean;
  model?: string | null;
  professionalInformationNeeded: string[];
  provider: "groq" | "local-fallback";
  refinedDescription: string;
};

export type BudgetRangeSuggestion = {
  confidence: "LOW" | "MEDIUM" | "HIGH";
  currency: "EUR";
  max: number;
  min: number;
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
  suggestedBudgetRange: BudgetRangeSuggestion;
  suggestedServiceId: number | null;
  suggestedServiceName: string | null;
  suggestedServiceSlug: string | null;
  suggestedTitle: string;
  suggestedUrgency: ServiceRequestAiUrgency;
  urgencyReason: string;
  summary: string;
};
