import type { RequestUrgency } from "../types/serviceRequest";

const validUrgencies: RequestUrgency[] = ["LOW", "NORMAL", "HIGH", "EMERGENCY"];
const spanishLocationMessage = "Introduce una ubicaci\u00f3n y un c\u00f3digo postal v\u00e1lidos de Espa\u00f1a.";

export function getDescriptionError(description: string) {
  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    return "Describe brevemente el trabajo que necesitas.";
  }

  if (trimmedDescription.length < 15) {
    return "A\u00f1ade un poco m\u00e1s de informaci\u00f3n para que los profesionales puedan entender el trabajo.";
  }

  if (trimmedDescription.length > 2000) {
    return "La descripci\u00f3n no puede superar 2000 caracteres.";
  }

  return "";
}

export type WorkDetailsValidationInput = {
  flexibleSchedule: boolean;
  locationDescription: string;
  postalCode: string;
  preferredDateFrom: string;
  preferredDateTo: string;
  urgency: RequestUrgency;
};

export type WorkDetailsValidationErrors = {
  locationDescription?: string;
  postalCode?: string;
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

  if (!trimmedLocation || trimmedLocation.length < 3) {
    return spanishLocationMessage;
  }

  if (trimmedLocation.length > 240) {
    return "La ubicaci\u00f3n general no puede superar 240 caracteres.";
  }

  return "";
}

export function getSpanishPostalCodeError(postalCode: string) {
  const trimmedPostalCode = postalCode.trim();

  if (!/^\d{5}$/.test(trimmedPostalCode)) {
    return spanishLocationMessage;
  }

  const prefix = Number(trimmedPostalCode.slice(0, 2));
  if (prefix < 1 || prefix > 52) {
    return spanishLocationMessage;
  }

  return "";
}

export function getWorkDetailsErrors(input: WorkDetailsValidationInput): WorkDetailsValidationErrors {
  const errors: WorkDetailsValidationErrors = {};
  const locationError = getLocationDescriptionError(input.locationDescription);
  const postalCodeError = getSpanishPostalCodeError(input.postalCode);

  if (locationError) errors.locationDescription = locationError;
  if (postalCodeError) errors.postalCode = postalCodeError;

  if (!validUrgencies.includes(input.urgency)) {
    errors.urgency = "Selecciona una urgencia v\u00e1lida.";
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
