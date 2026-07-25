import type { RequestUrgency } from "../types/serviceRequest";

const validUrgencies: RequestUrgency[] = ["LOW", "NORMAL", "HIGH", "EMERGENCY"];

export function getDescriptionError(description: string) {
  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    return "Describe brevemente el trabajo que necesitas.";
  }

  if (trimmedDescription.length < 15) {
    return "Añade un poco más de información para que los profesionales puedan entender el trabajo.";
  }

  if (trimmedDescription.length > 2000) {
    return "La descripción no puede superar 2000 caracteres.";
  }

  return "";
}

export type WorkDetailsValidationInput = {
  flexibleSchedule: boolean;
  locationDescription: string;
  preferredDateFrom: string;
  preferredDateTo: string;
  urgency: RequestUrgency;
};

export type WorkDetailsValidationErrors = {
  locationDescription?: string;
  preferredDateFrom?: string;
  preferredDateTo?: string;
  urgency?: string;
};

function getTodayValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isBeforeToday(dateValue: string) {
  return Boolean(dateValue) && dateValue < getTodayValue();
}

export function getLocationDescriptionError(locationDescription: string) {
  const trimmedLocation = locationDescription.trim();

  if (!trimmedLocation) {
    return "Indica una ubicación general.";
  }

  if (trimmedLocation.length < 3) {
    return "Añade una ubicación un poco más clara.";
  }

  if (trimmedLocation.length > 240) {
    return "La ubicación general no puede superar 240 caracteres.";
  }

  return "";
}

export function getWorkDetailsErrors(input: WorkDetailsValidationInput): WorkDetailsValidationErrors {
  const errors: WorkDetailsValidationErrors = {};
  const locationError = getLocationDescriptionError(input.locationDescription);

  if (locationError) errors.locationDescription = locationError;

  if (!validUrgencies.includes(input.urgency)) {
    errors.urgency = "Selecciona una urgencia válida.";
  }

  if (!input.flexibleSchedule && !input.preferredDateFrom) {
    errors.preferredDateFrom = "Selecciona una fecha inicial.";
  }

  if (isBeforeToday(input.preferredDateFrom)) {
    errors.preferredDateFrom = "La fecha inicial no puede estar en el pasado.";
  }

  if (isBeforeToday(input.preferredDateTo)) {
    errors.preferredDateTo = "La fecha final no puede estar en el pasado.";
  }

  if (input.preferredDateFrom && input.preferredDateTo && input.preferredDateTo < input.preferredDateFrom) {
    errors.preferredDateTo = "La fecha final no puede ser anterior a la fecha inicial.";
  }

  return errors;
}
