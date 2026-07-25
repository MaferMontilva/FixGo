import type { RequestStep, RequestUrgency, ServiceRequestDraft } from "../types/serviceRequest";

const serviceRequestDraftKey = "fixgo.serviceRequestDraft.v1";
const serviceRequestDraftVersion = 1;
const validUrgencies: RequestUrgency[] = ["LOW", "NORMAL", "HIGH", "EMERGENCY"];
const validSteps: RequestStep[] = [1, 2, 3, 4];

export type StoredServiceRequestDraft = {
  version: 1;
  savedAt: string;
  draft: ServiceRequestDraft;
};

export type ServiceRequestDraftLoadResult = {
  failed: boolean;
  storedDraft: StoredServiceRequestDraft | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isRequestUrgency(value: unknown): value is RequestUrgency {
  return typeof value === "string" && validUrgencies.includes(value as RequestUrgency);
}

function isRequestStep(value: unknown): value is RequestStep {
  return typeof value === "number" && validSteps.includes(value as RequestStep);
}

function getLocalStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function removeRawDraft() {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.removeItem(serviceRequestDraftKey);
  } catch {
    // Ignore storage failures so the form remains usable.
  }
}

function parseDraft(value: unknown): ServiceRequestDraft | null {
  if (!isRecord(value)) return null;

  if (!isNullableNumber(value.categoryId)) return null;
  if (!isString(value.categorySlug)) return null;
  if (!isNullableNumber(value.serviceId)) return null;
  if (!isString(value.serviceSlug)) return null;
  if (!isString(value.title)) return null;
  if (!isString(value.originalDescription)) return null;
  if (!isString(value.locationDescription)) return null;
  if (!isRequestUrgency(value.urgency)) return null;
  if (!isString(value.preferredDateFrom)) return null;
  if (!isString(value.preferredDateTo)) return null;
  if (value.serverDraftId !== undefined && !isNullableString(value.serverDraftId)) return null;
  if (typeof value.flexibleSchedule !== "boolean") return null;
  if (!isRequestStep(value.currentStep)) return null;
  if (!isString(value.updatedAt)) return null;

  return {
    categoryId: value.categoryId,
    categorySlug: value.categorySlug,
    currentStep: value.currentStep,
    flexibleSchedule: value.flexibleSchedule,
    locationDescription: value.locationDescription,
    originalDescription: value.originalDescription,
    preferredDateFrom: value.preferredDateFrom,
    preferredDateTo: value.preferredDateTo,
    serverDraftId: value.serverDraftId ?? null,
    serviceId: value.serviceId,
    serviceSlug: value.serviceSlug,
    title: value.title,
    updatedAt: value.updatedAt,
    urgency: value.urgency
  };
}

function parseStoredDraft(value: unknown): StoredServiceRequestDraft | null {
  if (!isRecord(value)) return null;
  if (value.version !== serviceRequestDraftVersion) return null;
  if (!isString(value.savedAt)) return null;

  const draft = parseDraft(value.draft);
  if (!draft) return null;

  return {
    version: serviceRequestDraftVersion,
    savedAt: value.savedAt,
    draft
  };
}

export function saveServiceRequestDraft(draft: ServiceRequestDraft) {
  const storage = getLocalStorage();
  if (!storage) return null;

  const storedDraft: StoredServiceRequestDraft = {
    version: serviceRequestDraftVersion,
    savedAt: new Date().toISOString(),
    draft
  };

  try {
    storage.setItem(serviceRequestDraftKey, JSON.stringify(storedDraft));
    return storedDraft;
  } catch {
    return null;
  }
}

export function loadServiceRequestDraftResult(): ServiceRequestDraftLoadResult {
  const storage = getLocalStorage();
  if (!storage) return { failed: false, storedDraft: null };

  try {
    const rawDraft = storage.getItem(serviceRequestDraftKey);
    if (!rawDraft) return { failed: false, storedDraft: null };

    const parsedDraft = parseStoredDraft(JSON.parse(rawDraft));
    if (!parsedDraft) {
      removeRawDraft();
      return { failed: true, storedDraft: null };
    }

    return { failed: false, storedDraft: parsedDraft };
  } catch {
    removeRawDraft();
    return { failed: true, storedDraft: null };
  }
}

export function loadServiceRequestDraft() {
  return loadServiceRequestDraftResult().storedDraft;
}

export function removeServiceRequestDraft() {
  removeRawDraft();
}

export function hasServiceRequestDraft() {
  return loadServiceRequestDraft() !== null;
}
